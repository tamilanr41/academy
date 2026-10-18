const SiteSetting = require('../models/SiteSetting');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const auditService = require('../services/auditService');
const settingsCache = require('../services/settingsCache');
const ApiError = require('../utils/ApiError');
const { rank } = require('../utils/roles');

/** Public, sanitized settings payload (no admin-only or sensitive fields). */
const getPublic = asyncHandler(async (_req, res) => {
  const settings = await settingsCache.getSettings();
  return success(res, {
    academyName: settings.academyName,
    tagline: settings.tagline,
    logo: settings.logo,
    favicon: settings.favicon,
    contact: settings.contact,
    social: settings.social,
    brand: settings.brand,
    locale: settings.locale,
    seo: settings.seo,
    features: settings.features,
    footer: settings.footer,
    media: settings.media,
  }, 'Settings fetched');
});

const getAdmin = asyncHandler(async (_req, res) => {
  const settings = await SiteSetting.getSettings();
  return success(res, settings, 'Settings fetched');
});

const update = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.getSettings();
  const body = req.body;

  for (const key of Object.keys(body)) {
    if (body[key] && typeof body[key] === 'object' && !Array.isArray(body[key])) {
      settings[key] = { ...(settings[key]?.toObject?.() || settings[key] || {}), ...body[key] };
      if (key === 'contact' && body.contact.address) {
        settings.contact.address = { ...(settings.contact.address?.toObject?.() || settings.contact.address || {}), ...body.contact.address };
      }
    } else {
      settings[key] = body[key];
    }
  }
  settings.updatedBy = req.user._id;
  await settings.save();
  settingsCache.invalidate();

  await auditService.log({ actor: req.user, action: 'settings.update', entity: 'SiteSetting', entityId: settings._id, summary: 'Updated site settings', meta: { sections: Object.keys(body) }, req });
  return success(res, settings, 'Settings updated');
});

const listAuditLogs = asyncHandler(async (req, res) => {
  const { action, entity, actor, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 30, maxLimit: 100 });

  const filter = {};
  if (action) filter.action = action;
  if (entity) filter.entity = entity;
  if (actor) filter.actor = actor;

  const [items, total] = await Promise.all([
    AuditLog.find(filter).populate('actor', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Audit logs fetched' });
});

/* ----------------------------- user administration ----------------------------- */

const listUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) {
    const regex = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    User.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Users fetched' });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, isActive } = req.body;
  if (['super_admin', 'admin'].includes(role) && req.user.role !== 'super_admin') {
    throw ApiError.forbidden('Only a Super Admin can create administrative accounts');
  }
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({ name, email, password, role, phone: phone || '', isActive: isActive !== false, createdBy: req.user._id });
  await auditService.log({ actor: req.user, action: 'user.create', entity: 'User', entityId: user._id, summary: `Created ${role} account for ${email}`, req });
  return success(res, user, 'User created');
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const body = { ...req.body };
  const touchesPrivileged = ['super_admin', 'admin'].includes(user.role) || ['super_admin', 'admin'].includes(body.role || '');
  if (touchesPrivileged && req.user.role !== 'super_admin') {
    throw ApiError.forbidden('Only a Super Admin can modify administrative accounts');
  }
  if (body.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw ApiError.forbidden('Only a Super Admin can grant the Super Admin role');
  }
  if (String(user._id) === String(req.user._id) && body.isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }
  // Prevent removing the last active super admin.
  if (user.role === 'super_admin' && (body.role && body.role !== 'super_admin' || body.isActive === false)) {
    const remaining = await User.countDocuments({ role: 'super_admin', isActive: true, _id: { $ne: user._id } });
    if (remaining === 0) throw ApiError.badRequest('At least one active Super Admin must remain');
  }

  Object.assign(user, body);
  if (body.password) user.password = body.password;
  await user.save();

  await auditService.log({ actor: req.user, action: 'user.update', entity: 'User', entityId: user._id, summary: `Updated account ${user.email}`, meta: { fields: Object.keys(body) }, req });
  return success(res, user, 'User updated');
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (String(user._id) === String(req.user._id)) throw ApiError.badRequest('You cannot delete your own account');
  if (user.role === 'super_admin') {
    const remaining = await User.countDocuments({ role: 'super_admin', _id: { $ne: user._id } });
    if (remaining === 0) throw ApiError.badRequest('At least one Super Admin must remain');
  }
  if (rank(user.role) >= 3 && req.user.role !== 'super_admin') throw ApiError.forbidden('Only a Super Admin can delete administrative accounts');

  user.isActive = false;
  await user.save();
  await auditService.log({ actor: req.user, action: 'user.deactivate', entity: 'User', entityId: user._id, summary: `Deactivated account ${user.email}`, req });
  return success(res, null, 'User deactivated');
});

module.exports = { getPublic, getAdmin, update, listAuditLogs, listUsers, createUser, updateUser, deleteUser };

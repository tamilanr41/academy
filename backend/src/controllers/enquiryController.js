const Enquiry = require('../models/Enquiry');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');
const { getSettings } = require('../services/settingsCache');
const { toCSV, sendCSV } = require('../utils/csv');
const User = require('../models/User');

const submit = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload.honeypot;

  const settings = await getSettings();
  const enquiry = await Enquiry.create({
    ...payload,
    user: req.user?._id,
    status: 'new',
  });

  if (settings.email.notifyOnEnquiry) {
    await emailService.sendMail({
      to: enquiry.email,
      subject: 'We received your enquiry',
      html: `<p>Hi ${enquiry.name},</p><p>Regarding: <strong>${enquiry.subject}</strong></p><p>Our team will get back to you within one working day.</p>`,
    });
  }

  await auditService.log({ actor: req.user, action: 'enquiry.submit', entity: 'Enquiry', entityId: enquiry._id, summary: `Enquiry "${enquiry.subject}" received`, req });
  return created(res, enquiry, 'Enquiry submitted successfully. We will get back to you shortly.');
});

const adminList = asyncHandler(async (req, res) => {
  const { search, status, type, assignedTo, followUpFrom, followUpTo, page, limit, export: exportCsv } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};
  if (search) filter.$or = [{ name: buildRegex(search) }, { email: buildRegex(search) }, { subject: buildRegex(search) }, { phone: buildRegex(search) }];
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (followUpFrom || followUpTo) {
    filter.followUpDate = {};
    if (followUpFrom) filter.followUpDate.$gte = new Date(followUpFrom);
    if (followUpTo) filter.followUpDate.$lte = new Date(`${String(followUpTo).slice(0, 10)}T23:59:59.999Z`);
  }

  if (exportCsv === 'csv') {
    const rows = await Enquiry.find(filter).populate('course', 'title').populate('assignedTo', 'name').sort({ createdAt: -1 }).limit(5000).lean();
    const csv = toCSV(rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'subject', label: 'Subject' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { label: 'Course', value: (r) => r.course?.title || '' },
      { label: 'Assigned To', value: (r) => r.assignedTo?.name || '' },
      { key: 'followUpDate', label: 'Follow Up' },
      { label: 'Created At', value: (r) => (r.createdAt ? new Date(r.createdAt).toISOString() : '') },
    ]);
    return sendCSV(res, `enquiries-${Date.now()}.csv`, csv);
  }

  const [items, total] = await Promise.all([
    Enquiry.find(filter).populate('course', 'title').populate('assignedTo', 'name email').populate('staffNotes.by', 'name').sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Enquiry.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Enquiries fetched' });
});

const adminGetById = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id)
    .populate('course', 'title slug')
    .populate('assignedTo', 'name email')
    .populate('staffNotes.by', 'name email');
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return success(res, enquiry, 'Enquiry fetched');
});

const update = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');

  const body = { ...req.body };
  const { note, ...updates } = body;

  if (updates.assignedTo !== undefined) {
    if (updates.assignedTo) {
      const staff = await User.findOne({ _id: updates.assignedTo, role: { $in: ['super_admin', 'admin', 'staff', 'trainer'] } });
      if (!staff) throw ApiError.badRequest('Selected assignee is not a staff member');
    }
    updates.assignedTo = updates.assignedTo || null;
  }
  if (updates.followUpDate !== undefined) {
    updates.followUpDate = updates.followUpDate ? new Date(updates.followUpDate) : null;
  }
  if (updates.status === 'resolved' && !enquiry.resolvedAt) {
    updates.resolvedAt = new Date();
  }

  Object.assign(enquiry, updates);
  if (note) enquiry.staffNotes.push({ note, by: req.user._id, at: new Date() });
  await enquiry.save();

  await auditService.log({ actor: req.user, action: 'enquiry.update', entity: 'Enquiry', entityId: enquiry._id, summary: `Updated enquiry "${enquiry.subject}"`, meta: { status: enquiry.status }, req });
  return success(res, enquiry, 'Enquiry updated');
});

const stats = asyncHandler(async (_req, res) => {
  const [byStatus, total] = await Promise.all([
    Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Enquiry.countDocuments(),
  ]);
  return success(res, { total, byStatus }, 'Enquiry stats fetched');
});

module.exports = { submit, adminList, adminGetById, update, stats };

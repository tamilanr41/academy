const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CourseApplication = require('../models/CourseApplication');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const auditService = require('../services/auditService');
const { toCSV, sendCSV } = require('../utils/csv');

const list = asyncHandler(async (req, res) => {
  const { search, status, course, page, limit, export: exportCsv } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  const filter = { role: 'student' };
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) {
    filter.$or = [{ name: buildRegex(search) }, { email: buildRegex(search) }, { phone: buildRegex(search) }];
  }
  if (course) {
    const studentIds = await Enrollment.distinct('student', { course });
    filter._id = { $in: studentIds };
  }

  if (exportCsv === 'csv') {
    const rows = await User.find(filter).sort({ createdAt: -1 }).limit(10000).lean();
    const csv = toCSV(rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { label: 'Verified', value: (r) => (r.isEmailVerified ? 'Yes' : 'No') },
      { label: 'Status', value: (r) => (r.isActive ? 'Active' : 'Inactive') },
      { label: 'Registered On', value: (r) => (r.createdAt ? new Date(r.createdAt).toISOString() : '') },
    ]);
    return sendCSV(res, `students-${Date.now()}.csv`, csv);
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    User.countDocuments(filter),
  ]);

  const profiles = await StudentProfile.find({ user: { $in: items.map((u) => u._id) } }).lean();
  const profileMap = Object.fromEntries(profiles.map((pr) => [String(pr.user), pr]));
  const shaped = items.map((u) => ({ ...u, profile: profileMap[String(u._id)] || null }));

  return paginated(res, { items: shaped, total, page: p, limit: l, message: 'Students fetched' });
});

const getById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'student' }).lean();
  if (!user) throw ApiError.notFound('Student not found');

  const [profile, applications, enrollments] = await Promise.all([
    StudentProfile.findOne({ user: user._id }).lean(),
    CourseApplication.find({ $or: [{ user: user._id }, { email: user.email }] })
      .populate('course', 'title slug')
      .populate('batch', 'name startDate')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Enrollment.find({ student: user._id }).populate('course', 'title slug image').populate('batch', 'name startDate').sort({ enrolledAt: -1 }).lean(),
  ]);

  return success(res, { user, profile, applications, enrollments }, 'Student fetched');
});

const update = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!user) throw ApiError.notFound('Student not found');

  const body = { ...req.body };

  // Guard: only a super_admin can create/modify another super_admin or admin account.
  if (body.role && body.role !== user.role) {
    if (['super_admin', 'admin'].includes(body.role) && req.user.role !== 'super_admin') {
      throw ApiError.forbidden('Only a Super Admin can change accounts to administrative roles');
    }
    if (['super_admin', 'admin'].includes(user.role) && req.user.role !== 'super_admin') {
      throw ApiError.forbidden('Only a Super Admin can modify administrative accounts');
    }
  }
  if (body.role) user.role = body.role;
  if (body.name !== undefined) user.name = body.name;
  if (body.phone !== undefined) user.phone = body.phone;
  if (body.isActive !== undefined) user.isActive = body.isActive;
  if (body.password) user.password = body.password;
  await user.save();

  await auditService.log({
    actor: req.user,
    action: 'student.update',
    entity: 'User',
    entityId: user._id,
    summary: `Updated student ${user.email}`,
    meta: { fields: Object.keys(body) },
    req,
  });
  return success(res, user, 'Student updated');
});

const toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!user) throw ApiError.notFound('Student not found');
  user.isActive = !user.isActive;
  await user.save();

  await auditService.log({ actor: req.user, action: user.isActive ? 'student.activate' : 'student.deactivate', entity: 'User', entityId: user._id, summary: `${user.isActive ? 'Activated' : 'Deactivated'} ${user.email}`, req });
  return success(res, user, `Student ${user.isActive ? 'activated' : 'deactivated'}`);
});

module.exports = { list, getById, update, toggleActive };

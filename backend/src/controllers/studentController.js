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
const { storeFile } = require('../services/uploadService');
const { computeProfileCompleteness, PROFILE_REQUIRED_FIELDS } = require('../utils/profileCompleteness');

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
    const profiles = await StudentProfile.find({ user: { $in: rows.map((u) => u._id) } }).lean();
    const profileMap = Object.fromEntries(profiles.map((pr) => [String(pr.user), pr]));
    const csv = toCSV(rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { label: 'Alternate Phone', value: (r) => profileMap[String(r._id)]?.alternatePhone || '' },
      { label: 'WhatsApp', value: (r) => profileMap[String(r._id)]?.whatsapp || '' },
      { label: 'Date of Birth', value: (r) => { const d = profileMap[String(r._id)]?.dateOfBirth; return d ? new Date(d).toISOString().slice(0, 10) : ''; } },
      { label: 'Gender', value: (r) => profileMap[String(r._id)]?.gender || '' },
      { label: 'Qualification', value: (r) => profileMap[String(r._id)]?.qualification || '' },
      { label: 'College', value: (r) => profileMap[String(r._id)]?.college || '' },
      { label: 'Year', value: (r) => profileMap[String(r._id)]?.yearOfStudy || '' },
      { label: 'Address', value: (r) => [profileMap[String(r._id)]?.address?.line1, profileMap[String(r._id)]?.address?.line2].filter(Boolean).join(', ') },
      { label: 'City', value: (r) => profileMap[String(r._id)]?.address?.city || '' },
      { label: 'State', value: (r) => profileMap[String(r._id)]?.address?.state || '' },
      { label: 'Pincode', value: (r) => profileMap[String(r._id)]?.address?.pincode || '' },
      { label: 'Guardian Name', value: (r) => profileMap[String(r._id)]?.guardian?.name || '' },
      { label: 'Guardian Phone', value: (r) => profileMap[String(r._id)]?.guardian?.phone || '' },
      { label: 'Guardian Relation', value: (r) => profileMap[String(r._id)]?.guardian?.relation || '' },
      { label: 'How They Heard', value: (r) => profileMap[String(r._id)]?.source || '' },
      { label: 'Profile Complete', value: (r) => (computeProfileCompleteness(r, profileMap[String(r._id)] || null).isComplete ? 'Yes' : 'No') },
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
  const shaped = items.map((u) => {
    const profile = profileMap[String(u._id)] || null;
    const { isComplete, missing } = computeProfileCompleteness(u, profile);
    return { ...u, profile, profileComplete: isComplete, profileMissing: missing };
  });

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

  const { isComplete, missing } = computeProfileCompleteness(user, profile);

  return success(res, { user, profile, profileComplete: isComplete, profileMissing: missing, applications, enrollments }, 'Student fetched');
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

/* ------------------------- own-profile (student self service) ------------------------ */

const SCALAR_FIELDS = [
  'gender',
  'qualification',
  'occupation',
  'bio',
  'alternatePhone',
  'whatsapp',
  'college',
  'yearOfStudy',
  'specialization',
  'interestedCourse',
  'preferredMode',
  'preferredTiming',
  'source',
];

const NESTED_FIELDS = {
  address: ['line1', 'line2', 'city', 'state', 'pincode', 'country'],
  guardian: ['name', 'phone', 'relation'],
  emergencyContact: ['name', 'phone', 'relation'],
};

function ensureStudent(req) {
  if (req.user.role !== 'student') throw ApiError.forbidden('Only students can manage a student profile');
}

/** Upserts and returns the profile document for the logged-in student. */
async function getOrCreateProfile(userId) {
  return StudentProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

const myProfile = asyncHandler(async (req, res) => {
  ensureStudent(req);

  const [user, profileDoc] = await Promise.all([User.findById(req.user._id), getOrCreateProfile(req.user._id)]);
  const profile = profileDoc.toObject();
  const completeness = computeProfileCompleteness(user.toObject(), profile);

  if (completeness.isComplete && !profile.completedAt) {
    await StudentProfile.updateOne({ _id: profile._id }, { $set: { completedAt: new Date() } });
  }

  return success(res, { user, profile, ...completeness, requiredFields: PROFILE_REQUIRED_FIELDS }, 'Profile fetched');
});

const updateMyProfile = asyncHandler(async (req, res) => {
  ensureStudent(req);

  const body = req.body || {};
  const user = await User.findById(req.user._id);

  if (body.name !== undefined && body.name !== '') user.name = body.name;
  if (body.phone !== undefined && body.phone !== '') user.phone = body.phone;
  await user.save();

  const set = {};
  for (const key of SCALAR_FIELDS) {
    if (body[key] !== undefined) set[key] = body[key];
  }
  if (body.dateOfBirth !== undefined) {
    set.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
  }
  for (const [group, keys] of Object.entries(NESTED_FIELDS)) {
    if (!body[group]) continue;
    for (const key of keys) {
      if (body[group][key] !== undefined) set[`${group}.${key}`] = body[group][key];
    }
  }

  if (Object.keys(body).length === 0) throw ApiError.badRequest('Nothing to update');

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: set, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const completeness = computeProfileCompleteness(user.toObject(), profile.toObject());
  if (completeness.isComplete && !profile.completedAt) {
    profile.completedAt = new Date();
    await profile.save();
  }

  await auditService.log({
    actor: req.user,
    action: 'profile.update',
    entity: 'StudentProfile',
    entityId: profile._id,
    summary: `Student profile updated${completeness.isComplete ? ' (complete)' : ''}`,
    meta: { fields: Object.keys(body) },
    req,
  });

  return success(res, { user, profile, ...completeness, requiredFields: PROFILE_REQUIRED_FIELDS }, 'Profile updated');
});

const uploadDocument = asyncHandler(async (req, res) => {
  ensureStudent(req);
  if (!req.file) throw ApiError.badRequest('A file is required');

  const type = String(req.body.type || 'other');
  const number = String(req.body.number || '');
  const stored = await storeFile(req.file, 'academy/student-documents');

  const profile = await getOrCreateProfile(req.user._id);
  profile.documents = (profile.documents || []).filter((doc) => doc.type !== type);
  profile.documents.push({ type, number, url: stored.url, publicId: stored.publicId });
  await profile.save();

  return success(res, { documents: profile.documents }, 'Document uploaded');
});

const deleteDocument = asyncHandler(async (req, res) => {
  ensureStudent(req);

  const profile = await getOrCreateProfile(req.user._id);
  const before = (profile.documents || []).length;
  profile.documents = (profile.documents || []).filter((doc) => String(doc._id) !== String(req.params.id));
  if (profile.documents.length === before) throw ApiError.notFound('Document not found');
  await profile.save();

  return success(res, { documents: profile.documents }, 'Document removed');
});

module.exports = { list, getById, update, toggleActive, myProfile, updateMyProfile, uploadDocument, deleteDocument };

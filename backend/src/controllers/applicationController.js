const CourseApplication = require('../models/CourseApplication');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');
const { getSettings } = require('../services/settingsCache');
const { toCSV, sendCSV } = require('../utils/csv');

/**
 * Public application submission.
 * - honeypot field silently rejects bots
 * - duplicate submissions (same email + course in 24h) are rejected
 * - status always starts at "new" (an enquiry is never an automatic admission)
 */
const submit = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (!settings.features.registrationEnabled) {
    throw ApiError.serviceUnavailable('Applications are currently closed. Please contact the academy.');
  }

  const payload = { ...req.body };
  delete payload.honeypot;

  const course = await Course.findOne({ _id: payload.course, isPublished: true });
  if (!course) throw ApiError.badRequest('Selected course is not available');

  if (payload.batch) {
    const batch = await Batch.findOne({ _id: payload.batch, status: { $ne: 'cancelled' } });
    if (!batch) throw ApiError.badRequest('Selected batch is not available');
    if (batch.enrolledCount >= batch.capacity) throw ApiError.conflict('Selected batch is full. Please choose another batch.');
  }

  const recent = await CourseApplication.findOne({
    email: payload.email,
    course: payload.course,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recent) throw ApiError.conflict('You have already applied for this course in the last 24 hours.');

  let application = await CourseApplication.create({
    ...payload,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
    referenceNumber: CourseApplication.generateReference(),
    status: 'new',
    user: req.user?._id,
    statusHistory: [{ status: 'new', note: 'Application submitted', at: new Date() }],
  });

  let notification = null;
  if (req.user) {
    notification = await Notification.create({
      user: req.user._id,
      title: 'Application submitted',
      message: `Your application ${application.referenceNumber} was received.`,
      type: 'application',
      link: '/student/applications',
    });
  }

  if (settings.email.notifyOnApplication) {
    await emailService.sendMail({
      to: application.email,
      subject: `Application received — ${application.referenceNumber}`,
      html: `<p>Hi ${application.name},</p><p>We received your application for <strong>${course.title}</strong>.</p><p>Reference: <strong>${application.referenceNumber}</strong></p>`,
    });
  }

  await auditService.log({
    actor: req.user,
    action: 'application.submit',
    entity: 'CourseApplication',
    entityId: application._id,
    summary: `Application ${application.referenceNumber} submitted`,
    req,
  });

  application = await CourseApplication.findById(application._id).populate('course', 'title slug image');
  return created(res, { application, notification }, 'Application submitted successfully');
});

/** Applications belonging to the logged-in student. */
const mine = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const { page: p, limit: l, skip } = parsePagination({ page, limit }, { defaultLimit: 10 });

  const filter = { $or: [{ user: req.user._id }, { email: req.user.email }] };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    CourseApplication.find(filter).populate('course', 'title slug image fee durationText').populate('batch', 'name startDate').sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    CourseApplication.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Applications fetched' });
});

const mineById = asyncHandler(async (req, res) => {
  const application = await CourseApplication.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { email: req.user.email }],
  })
    .populate('course', 'title slug image fee durationText description')
    .populate('batch', 'name startDate endDate days startTime endTime');
  if (!application) throw ApiError.notFound('Application not found');
  return success(res, application, 'Application fetched');
});

/* ---------------------------------- admin --------------------------------- */

const adminList = asyncHandler(async (req, res) => {
  const { search, status, course, assignedTo, from, to, page, limit, export: exportCsv } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};
  if (search) filter.$or = [{ name: buildRegex(search) }, { email: buildRegex(search) }, { referenceNumber: buildRegex(search) }, { phone: buildRegex(search) }];
  if (status) filter.status = status;
  if (course) filter.course = course;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(`${String(to).slice(0, 10)}T23:59:59.999Z`);
  }

  if (exportCsv === 'csv') {
    const rows = await CourseApplication.find(filter).populate('course', 'title').populate('assignedTo', 'name').sort({ createdAt: -1 }).limit(5000).lean();
    const csv = toCSV(rows, [
      { key: 'referenceNumber', label: 'Reference' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { label: 'Course', value: (r) => r.course?.title || '' },
      { key: 'mode', label: 'Mode' },
      { key: 'status', label: 'Status' },
      { label: 'Assigned To', value: (r) => r.assignedTo?.name || '' },
      { label: 'Created At', value: (r) => (r.createdAt ? new Date(r.createdAt).toISOString() : '') },
    ]);
    return sendCSV(res, `applications-${Date.now()}.csv`, csv);
  }

  const [items, total] = await Promise.all([
    CourseApplication.find(filter)
      .populate('course', 'title slug image')
      .populate('batch', 'name startDate')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    CourseApplication.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Applications fetched' });
});

const adminGetById = asyncHandler(async (req, res) => {
  const application = await CourseApplication.findById(req.params.id)
    .populate('course', 'title slug fee image category')
    .populate('batch')
    .populate('assignedTo', 'name email role')
    .populate('user', 'name email createdAt')
    .populate('staffNotes.by', 'name email');
  if (!application) throw ApiError.notFound('Application not found');
  return success(res, application, 'Application fetched');
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const application = await CourseApplication.findById(req.params.id).populate('course', 'title');
  if (!application) throw ApiError.notFound('Application not found');

  const previous = application.status;
  application.status = status;
  application.statusHistory.push({ status, note: note || '', changedBy: req.user._id, at: new Date() });
  if (['approved', 'rejected', 'enrolled'].includes(status)) {
    application.followUpDate = undefined;
  }
  await application.save();

  if (application.user && String(application.user) !== String(req.user._id)) {
    await Notification.create({
      user: application.user,
      title: 'Application status updated',
      message: `${application.referenceNumber} is now ${status.replace(/_/g, ' ')}`,
      type: 'application',
      link: '/student/applications',
    });
  }

  const settings = await getSettings();
  if (settings.email.notifyOnApplication && application.email) {
    await emailService.sendMail({
      to: application.email,
      subject: `Application update — ${application.referenceNumber}`,
      html: `<p>Hi ${application.name},</p><p>Your application <strong>${application.referenceNumber}</strong> is now <strong>${status.replace(/_/g, ' ')}</strong>.</p>`,
    });
  }

  await auditService.log({
    actor: req.user,
    action: 'application.status',
    entity: 'CourseApplication',
    entityId: application._id,
    summary: `Status ${previous} -> ${status} for ${application.referenceNumber}`,
    meta: { from: previous, to: status },
    req,
  });

  return success(res, application, 'Application status updated');
});

const addNote = asyncHandler(async (req, res) => {
  const application = await CourseApplication.findById(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');
  application.staffNotes.push({ note: req.body.note, by: req.user._id, at: new Date() });
  await application.save();
  return success(res, application, 'Note added');
});

const assign = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  if (assignedTo) {
    const staff = await User.findOne({ _id: assignedTo, role: { $in: ['super_admin', 'admin', 'staff', 'trainer'] } });
    if (!staff) throw ApiError.badRequest('Selected assignee is not a staff member');
  }
  const application = await CourseApplication.findByIdAndUpdate(req.params.id, { assignedTo: assignedTo || null }, { new: true });
  if (!application) throw ApiError.notFound('Application not found');
  await auditService.log({ actor: req.user, action: 'application.assign', entity: 'CourseApplication', entityId: application._id, summary: `Assigned ${application.referenceNumber}`, req });
  return success(res, application, 'Application assigned');
});

const setFollowUp = asyncHandler(async (req, res) => {
  const value = req.body.followUpDate;
  const application = await CourseApplication.findByIdAndUpdate(
    req.params.id,
    { followUpDate: value ? new Date(value) : null },
    { new: true }
  );
  if (!application) throw ApiError.notFound('Application not found');
  return success(res, application, 'Follow-up updated');
});

module.exports = { submit, mine, mineById, adminList, adminGetById, updateStatus, addNote, assign, setFollowUp };

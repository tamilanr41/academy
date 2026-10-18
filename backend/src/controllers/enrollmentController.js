const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const auditService = require('../services/auditService');

/**
 * Enrolls a student into a course/batch with capacity enforcement.
 * Atomic conditional update prevents over-enrolment under concurrent requests.
 */
async function enrollStudent({ studentId, courseId, batchId, applicationId, req }) {
  const [student, course] = await Promise.all([
    User.findOne({ _id: studentId, role: 'student' }),
    Course.findById(courseId),
  ]);
  if (!student) throw ApiError.badRequest('Student not found');
  if (!course) throw ApiError.badRequest('Course not found');

  let batch = null;
  if (batchId) {
    batch = await Batch.findById(batchId);
    if (!batch) throw ApiError.badRequest('Batch not found');
    if (String(batch.course) !== String(course._id)) throw ApiError.badRequest('Batch does not belong to the selected course');

    const updated = await Batch.findOneAndUpdate(
      { _id: batch._id, enrolledCount: { $lt: batch.capacity } },
      { $inc: { enrolledCount: 1 } },
      { new: true }
    );
    if (!updated) throw ApiError.conflict('This batch is already at full capacity');
    batch = updated;
  }

  const existing = await Enrollment.findOne({
    student: student._id,
    course: course._id,
    ...(batch ? { batch: batch._id } : {}),
    status: { $ne: 'dropped' },
  });
  if (existing) {
    if (batch) await Batch.updateOne({ _id: batch._id }, { $inc: { enrolledCount: -1 } });
    throw ApiError.conflict('This student is already enrolled in this course/batch');
  }

  try {
    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
      batch: batch ? batch._id : undefined,
      application: applicationId,
      status: 'active',
      enrolledAt: new Date(),
    });

    await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });
    await Notification.create({
      user: student._id,
      title: 'Enrolled in a course',
      message: `You are now enrolled in ${course.title}${batch ? ` (batch: ${batch.name})` : ''}.`,
      type: 'success',
      link: '/student/enrollments',
    });
    await auditService.log({ actor: req?.user, action: 'enrollment.create', entity: 'Enrollment', entityId: enrollment._id, summary: `Enrolled ${student.email} in ${course.title}`, req });
    return { enrollment, course, batch };
  } catch (err) {
    if (batch) await Batch.updateOne({ _id: batch._id }, { $inc: { enrolledCount: -1 } });
    throw err;
  }
}

const adminCreate = asyncHandler(async (req, res) => {
  const { studentId, course, batch, application } = req.body;
  const result = await enrollStudent({ studentId, courseId: course, batchId: batch, applicationId: application, req });
  return created(res, result.enrollment, 'Student enrolled successfully');
});

const adminList = asyncHandler(async (req, res) => {
  const { course, batch, status, student, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (course) filter.course = course;
  if (batch) filter.batch = batch;
  if (status) filter.status = status;
  if (student) filter.student = student;

  const [items, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('student', 'name email phone avatar')
      .populate('course', 'title slug image')
      .populate('batch', 'name startDate')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Enrollments fetched' });
});

const myEnrollments = asyncHandler(async (req, res) => {
  const items = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title slug image fee durationText curriculum learningOutcomes mode level',
    })
    .populate('batch', 'name startDate endDate days startTime endTime venue meetingLink trainer')
    .sort({ enrolledAt: -1 })
    .lean();
  return success(res, items, 'Enrollments fetched');
});

const drop = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('batch', 'capacity enrolledCount').populate('course', 'title');
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.status !== 'active') throw ApiError.badRequest('Only active enrollments can be dropped');

  enrollment.status = 'dropped';
  await enrollment.save();
  if (enrollment.batch) await Batch.updateOne({ _id: enrollment.batch._id }, { $inc: { enrolledCount: -1 } });
  await Course.updateOne({ _id: enrollment.course._id }, { $inc: { enrolledCount: -1 } });

  await auditService.log({ actor: req.user, action: 'enrollment.drop', entity: 'Enrollment', entityId: enrollment._id, summary: `Dropped enrollment for ${enrollment.course?.title}`, req });
  return success(res, enrollment, 'Enrollment dropped');
});

/**
 * Student marks a curriculum module as complete.
 * progressPercent is derived from the course curriculum — never trusted as input.
 */
const updateProgress = asyncHandler(async (req, res) => {
  const { moduleTitle, completed } = req.body;
  const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user._id }).populate('course', 'curriculum title');
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.status !== 'active') throw ApiError.badRequest('Enrollment is not active');

  const curriculumTitles = (enrollment.course?.curriculum || []).map((m) => m.title);
  if (!curriculumTitles.includes(moduleTitle)) throw ApiError.badRequest('Unknown curriculum module');

  const existingIdx = enrollment.progress.findIndex((p) => p.moduleTitle === moduleTitle);
  if (completed) {
    if (existingIdx >= 0) enrollment.progress[existingIdx].completedAt = new Date();
    else enrollment.progress.push({ moduleTitle, completedAt: new Date() });
  } else if (existingIdx >= 0) {
    enrollment.progress.splice(existingIdx, 1);
  }

  const total = curriculumTitles.length || 1;
  const done = enrollment.progress.length;
  enrollment.progressPercent = Math.round((done / total) * 100);

  if (enrollment.progressPercent === 100 && enrollment.status === 'active') {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    await Notification.create({
      user: req.user._id,
      title: 'Course completed 🎓',
      message: `Congratulations! You completed ${enrollment.course?.title || 'your course'}.`,
      type: 'success',
      link: '/student/certificates',
    });
  }

  await enrollment.save();
  return success(res, enrollment, 'Progress updated');
});

const issueCertificate = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('student', 'name email').populate('course', 'title');
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.certificate?.issued) throw ApiError.conflict('Certificate already issued for this enrollment');
  if (!['completed', 'active'].includes(enrollment.status)) throw ApiError.badRequest('Enrollment is not eligible for a certificate');

  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  enrollment.certificate = { issued: true, certificateId, issuedAt: new Date(), url: req.body.url || '' };
  await enrollment.save();

  await auditService.log({ actor: req.user, action: 'certificate.issue', entity: 'Enrollment', entityId: enrollment._id, summary: `Issued certificate ${certificateId}`, req });
  return success(res, enrollment, 'Certificate issued');
});

module.exports = { adminCreate, adminList, myEnrollments, drop, updateProgress, issueCertificate, enrollStudent };

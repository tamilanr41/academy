const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const auditService = require('../services/auditService');

const listPublic = asyncHandler(async (req, res) => {
  const { course, upcoming, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination({ page, limit }, { defaultLimit: 12 });

  const filter = { status: { $ne: 'cancelled' } };
  if (course) filter.course = course;
  if (upcoming === 'true') {
    filter.startDate = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    filter.status = { $in: ['upcoming', 'ongoing'] };
  }

  const [items, total] = await Promise.all([
    Batch.find(filter)
      .populate('course', 'title slug image fee durationText mode')
      .populate('trainer', 'name designation photo')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(l)
      .lean(),
    Batch.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Batches fetched' });
});

const listAdmin = asyncHandler(async (req, res) => {
  const { course, status, search, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (course) filter.course = course;
  if (status) filter.status = status;
  if (search) filter.name = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const [items, total] = await Promise.all([
    Batch.find(filter).populate('course', 'title slug').populate('trainer', 'name designation').sort({ startDate: -1 }).skip(skip).limit(l).lean(),
    Batch.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Batches fetched' });
});

const getById = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id).populate('course', 'title slug image fee durationText mode').populate('trainer', 'name designation photo email phone');
  if (!batch) throw ApiError.notFound('Batch not found');
  return success(res, batch, 'Batch fetched');
});

const create = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);
  if (!course) throw ApiError.badRequest('Selected course does not exist');

  const batch = await Batch.create({ ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) });
  await auditService.log({ actor: req.user, action: 'batch.create', entity: 'Batch', entityId: batch._id, summary: `Created batch "${batch.name}"`, req });
  return created(res, batch, 'Batch created');
});

const update = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw ApiError.notFound('Batch not found');

  const body = { ...req.body };
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  if (body.capacity !== undefined && body.capacity < batch.enrolledCount) {
    throw ApiError.badRequest(`Capacity cannot be lower than the ${batch.enrolledCount} already enrolled student(s)`);
  }
  if (body.course) {
    const course = await Course.findById(body.course);
    if (!course) throw ApiError.badRequest('Selected course does not exist');
  }

  Object.assign(batch, body);
  await batch.save();

  await auditService.log({ actor: req.user, action: 'batch.update', entity: 'Batch', entityId: batch._id, summary: `Updated batch "${batch.name}"`, req });
  return success(res, batch, 'Batch updated');
});

const remove = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw ApiError.notFound('Batch not found');

  const activeEnrollments = await Enrollment.countDocuments({ batch: batch._id, status: 'active' });
  if (activeEnrollments > 0) {
    batch.status = 'cancelled';
    await batch.save();
    await auditService.log({ actor: req.user, action: 'batch.cancel', entity: 'Batch', entityId: batch._id, summary: `Cancelled batch "${batch.name}"`, req });
    return success(res, batch, 'Batch had active enrollments and was cancelled instead of deleted');
  }

  await batch.deleteOne();
  await auditService.log({ actor: req.user, action: 'batch.delete', entity: 'Batch', entityId: req.params.id, summary: `Deleted batch "${batch.name}"`, req });
  return success(res, null, 'Batch deleted');
});

const students = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw ApiError.notFound('Batch not found');

  const enrollments = await Enrollment.find({ batch: batch._id })
    .populate('student', 'name email phone avatar')
    .populate('course', 'title slug')
    .sort({ enrolledAt: -1 })
    .lean();

  return success(res, { batch, students: enrollments }, 'Batch students fetched');
});

module.exports = { listPublic, listAdmin, getById, create, update, remove, students };

const Trainer = require('../models/Trainer');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const auditService = require('../services/auditService');

const listPublic = asyncHandler(async (_req, res) => {
  const trainers = await Trainer.find({ isActive: true })
    .populate('courses', 'title slug')
    .sort({ order: 1, name: 1 })
    .lean();
  return success(res, trainers, 'Trainers fetched');
});

const listAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (search) filter.$or = [{ name: buildRegex(search) }, { designation: buildRegex(search) }, { specializations: buildRegex(search) }];

  const [items, total] = await Promise.all([
    Trainer.find(filter).populate('courses', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Trainer.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Trainers fetched' });
});

const getBySlug = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findOne({ slug: req.params.slug, isActive: true }).populate('courses', 'title slug image fee');
  if (!trainer) throw ApiError.notFound('Trainer not found');
  return success(res, trainer, 'Trainer fetched');
});

const getById = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id).populate('courses', 'title slug image fee');
  if (!trainer) throw ApiError.notFound('Trainer not found');
  return success(res, trainer, 'Trainer fetched');
});

const create = asyncHandler(async (req, res) => {
  const trainer = await Trainer.create(req.body);
  await auditService.log({ actor: req.user, action: 'trainer.create', entity: 'Trainer', entityId: trainer._id, summary: `Created trainer "${trainer.name}"`, req });
  return created(res, trainer, 'Trainer created');
});

const update = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!trainer) throw ApiError.notFound('Trainer not found');
  await auditService.log({ actor: req.user, action: 'trainer.update', entity: 'Trainer', entityId: trainer._id, summary: `Updated trainer "${trainer.name}"`, req });
  return success(res, trainer, 'Trainer updated');
});

const remove = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) throw ApiError.notFound('Trainer not found');
  await trainer.deleteOne();
  await auditService.log({ actor: req.user, action: 'trainer.delete', entity: 'Trainer', entityId: req.params.id, summary: `Deleted trainer "${trainer.name}"`, req });
  return success(res, null, 'Trainer deleted');
});

module.exports = { listPublic, listAdmin, getBySlug, getById, create, update, remove };

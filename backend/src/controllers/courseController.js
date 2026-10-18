const Course = require('../models/Course');
const CourseCategory = require('../models/CourseCategory');
const Trainer = require('../models/Trainer');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const auditService = require('../services/auditService');

/* ----------------------------- public queries ----------------------------- */

const listPublic = asyncHandler(async (req, res) => {
  const { search, category, level, mode, featured, minFee, maxFee, sort, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination({ page, limit }, { defaultLimit: 12 });

  const filter = { isPublished: true, status: 'published' };
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (mode) filter.mode = mode;
  if (featured === 'true') filter.isFeatured = true;
  if (minFee !== undefined || maxFee !== undefined) {
    filter.fee = {};
    if (minFee !== undefined) filter.fee.$gte = Number(minFee);
    if (maxFee !== undefined) filter.fee.$lte = Number(maxFee);
  }

  let order;
  if (sort === 'popular') order = { enrolledCount: -1, views: -1 };
  else if (sort === 'fee_low') order = { fee: 1 };
  else if (sort === 'fee_high') order = { fee: -1 };
  else if (sort === 'title') order = { title: 1 };
  else if (sort === 'newest') order = { createdAt: -1 };
  else order = { isFeatured: -1, order: 1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('category', 'name slug')
      .populate('trainers', 'name designation photo')
      .sort(order)
      .skip(skip)
      .limit(l)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return paginated(res, { items, total, page: p, limit: l, message: 'Courses fetched' });
});

const getBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('category', 'name slug description')
    .populate('trainers');

  if (!course || (!course.isPublished && req.user?.role === undefined)) {
    throw ApiError.notFound('Course not found');
  }

  Course.updateOne({ _id: course._id }, { $inc: { views: 1 } }).exec();

  const related = await Course.find({
    _id: { $ne: course._id },
    category: course.category?._id || course.category,
    isPublished: true,
  })
    .limit(4)
    .select('title slug shortDescription fee discountFee durationText level mode image ratingAverage')
    .lean();

  return success(res, { course, related }, 'Course fetched');
});

/* ------------------------------ admin queries ----------------------------- */

const listAdmin = asyncHandler(async (req, res) => {
  const { search, category, status, level, mode, page, limit } = req.query;
  const { page: p, limit: l, skip, sort } = parsePagination(req.query, { defaultLimit: 15 });

  const filter = {};
  if (search) filter.$or = [{ title: buildRegex(search) }, { tags: buildRegex(search) }];
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (level) filter.level = level;
  if (mode) filter.mode = mode;

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('category', 'name slug')
      .populate('trainers', 'name designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return paginated(res, { items, total, page: p, limit: l, message: 'Courses fetched' });
});

const getById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('category', 'name slug').populate('trainers', 'name designation photo');
  if (!course) throw ApiError.notFound('Course not found');
  return success(res, course, 'Course fetched');
});

/* --------------------------------- mutations ------------------------------ */

const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.isPublished) body.status = 'published';
  const course = await Course.create(body);

  await auditService.log({ actor: req.user, action: 'course.create', entity: 'Course', entityId: course._id, summary: `Created course "${course.title}"`, req });
  return created(res, course, 'Course created');
});

const update = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  const body = { ...req.body };
  if (body.isPublished === true) body.status = 'published';
  if (body.isPublished === false && body.status === undefined) body.status = 'draft';

  Object.assign(course, body);
  await course.save();

  await auditService.log({ actor: req.user, action: 'course.update', entity: 'Course', entityId: course._id, summary: `Updated course "${course.title}"`, req });
  return success(res, course, 'Course updated');
});

const remove = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  // Soft delete: archive instead of dropping history that students may reference.
  course.status = 'archived';
  course.isPublished = false;
  await course.save();

  await auditService.log({ actor: req.user, action: 'course.archive', entity: 'Course', entityId: course._id, summary: `Archived course "${course.title}"`, req });
  return success(res, course, 'Course archived');
});

const destroy = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  const title = course.title;
  await course.deleteOne();
  await auditService.log({ actor: req.user, action: 'course.delete', entity: 'Course', entityId: req.params.id, summary: `Deleted course "${title}"`, req });
  return success(res, null, 'Course deleted permanently');
});

/* --------------------------------- reviews -------------------------------- */

const addReview = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || !course.isPublished) throw ApiError.notFound('Course not found');
  if (!course.reviews) course.reviews = [];

  course.reviews.push({
    user: req.user?._id,
    name: req.body.name,
    rating: req.body.rating,
    comment: req.body.comment,
    role: req.user?.role === 'student' ? 'Student' : 'Student',
    isApproved: false,
  });
  await course.save();

  return created(res, { pending: true }, 'Thanks! Your review will appear after moderation.');
});

/* ------------------------------- categories ------------------------------- */

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await CourseCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  const counts = await Course.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const withCounts = categories.map((c) => ({ ...c, courseCount: countMap[String(c._id)] || 0 }));
  return success(res, withCounts, 'Categories fetched');
});

const listCategoriesAdmin = asyncHandler(async (_req, res) => {
  const categories = await CourseCategory.find().sort({ order: 1, name: 1 }).lean();
  return success(res, categories, 'Categories fetched');
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await CourseCategory.create(req.body);
  await auditService.log({ actor: req.user, action: 'category.create', entity: 'CourseCategory', entityId: category._id, summary: `Created category "${category.name}"`, req });
  return created(res, category, 'Category created');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await CourseCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound('Category not found');
  await auditService.log({ actor: req.user, action: 'category.update', entity: 'CourseCategory', entityId: category._id, summary: `Updated category "${category.name}"`, req });
  return success(res, category, 'Category updated');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Course.countDocuments({ category: req.params.id });
  if (inUse > 0) throw ApiError.conflict(`Cannot delete: ${inUse} course(s) still use this category`);
  const category = await CourseCategory.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  await auditService.log({ actor: req.user, action: 'category.delete', entity: 'CourseCategory', entityId: req.params.id, summary: `Deleted category "${category.name}"`, req });
  return success(res, null, 'Category deleted');
});

module.exports = {
  listPublic,
  getBySlug,
  listAdmin,
  getById,
  create,
  update,
  remove,
  destroy,
  addReview,
  listCategories,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
};

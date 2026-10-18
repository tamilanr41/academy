const Testimonial = require('../models/Testimonial');
const Event = require('../models/Event');
const GalleryItem = require('../models/GalleryItem');
const Faq = require('../models/Faq');
const Announcement = require('../models/Announcement');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildRegex } = require('../utils/pagination');
const auditService = require('../services/auditService');

/**
 * Small CRUD factory so every content type shares consistent
 * pagination, validation, error handling and audit behaviour.
 */
function createCrud({ model, name, publicFilter, publicSort, adminSort, searchFields = [], populate = '', writeRoles = ['admin', 'staff'] }) {
  const listPublic = asyncHandler(async (_req, res) => {
    const query = model.find(publicFilter).sort(publicSort);
    if (populate) query.populate(populate);
    const items = await query.lean();
    return success(res, items, `${name} fetched`);
  });

  const listAdmin = asyncHandler(async (req, res) => {
    const { search, page, limit, status } = req.query;
    const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

    const filter = {};
    if (search && searchFields.length) {
      filter.$or = searchFields.map((field) => ({ [field]: buildRegex(search) }));
    }
    if (status === 'published') filter.isPublished = true;
    if (status === 'draft') filter.isPublished = false;
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const query = model.find(filter).sort(adminSort || { createdAt: -1 }).skip(skip).limit(l);
    if (populate) query.populate(populate);
    const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
    return paginated(res, { items, total, page: p, limit: l, message: `${name} fetched` });
  });

  const getById = asyncHandler(async (req, res) => {
    const query = model.findById(req.params.id);
    if (populate) query.populate(populate);
    const doc = await query.lean();
    if (!doc) throw ApiError.notFound(`${name} not found`);
    return success(res, doc, `${name} fetched`);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await model.create(req.body);
    await auditService.log({ actor: req.user, action: `${name.toLowerCase()}.create`, entity: model.modelName, entityId: doc._id, summary: `Created ${name}`, req });
    return created(res, doc, `${name} created`);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) throw ApiError.notFound(`${name} not found`);
    await auditService.log({ actor: req.user, action: `${name.toLowerCase()}.update`, entity: model.modelName, entityId: doc._id, summary: `Updated ${name}`, req });
    return success(res, doc, `${name} updated`);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${name} not found`);
    await auditService.log({ actor: req.user, action: `${name.toLowerCase()}.delete`, entity: model.modelName, entityId: req.params.id, summary: `Deleted ${name}`, req });
    return success(res, null, `${name} deleted`);
  });

  return { listPublic, listAdmin, getById, create, update, remove };
}

const testimonials = createCrud({
  model: Testimonial,
  name: 'Testimonial',
  publicFilter: { isApproved: true },
  publicSort: { isFeatured: -1, order: 1, createdAt: -1 },
  searchFields: ['name', 'content', 'role'],
  populate: 'course',
});

const events = createCrud({
  model: Event,
  name: 'Event',
  publicFilter: { isPublished: true },
  publicSort: { startDate: 1 },
  searchFields: ['title', 'description', 'location'],
});

const gallery = createCrud({
  model: GalleryItem,
  name: 'Gallery item',
  publicFilter: { isActive: true },
  publicSort: { order: 1, createdAt: -1 },
  searchFields: ['title', 'caption'],
});

const faqs = createCrud({
  model: Faq,
  name: 'FAQ',
  publicFilter: { isActive: true },
  publicSort: { order: 1, createdAt: -1 },
  searchFields: ['question', 'answer'],
});

const announcements = createCrud({
  model: Announcement,
  name: 'Announcement',
  publicFilter: { isPublished: true },
  publicSort: { createdAt: -1 },
  searchFields: ['title', 'message'],
});

/** Approve / reject testimonial moderation shortcut. */
const moderateTestimonial = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const doc = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: Boolean(isApproved) },
    { new: true, runValidators: true }
  );
  if (!doc) throw ApiError.notFound('Testimonial not found');
  await auditService.log({ actor: req.user, action: 'testimonial.moderate', entity: 'Testimonial', entityId: doc._id, summary: `${isApproved ? 'Approved' : 'Unapproved'} testimonial`, req });
  return success(res, doc, `Testimonial ${isApproved ? 'approved' : 'moved to pending'}`);
});

module.exports = { testimonials, events, gallery, faqs, announcements, moderateTestimonial };

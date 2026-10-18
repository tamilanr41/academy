const express = require('express');
const courseController = require('../controllers/courseController');
const trainerController = require('../controllers/trainerController');
const batchController = require('../controllers/batchController');
const applicationController = require('../controllers/applicationController');
const enquiryController = require('../controllers/enquiryController');
const studentController = require('../controllers/studentController');
const enrollmentController = require('../controllers/enrollmentController');
const dashboardController = require('../controllers/dashboardController');
const contentController = require('../controllers/contentController');
const settingsController = require('../controllers/settingsController');
const newsletterController = require('../controllers/newsletterController');
const paymentController = require('../controllers/paymentController');
const { upload, storeFile } = require('../services/uploadService');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter, formLimiter } = require('../middleware/rateLimit');
const asyncHandler = require('../utils/asyncHandler');
const { created } = require('../utils/response');
const {
  courseSchema,
  categorySchema,
  batchSchema,
  trainerSchema,
  applicationStatusSchema,
  applicationNoteSchema,
  assignSchema,
  followUpSchema,
  enquiryUpdateSchema,
  studentUpdateSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  testimonialSchema,
  eventSchema,
  galleryItemSchema,
  faqSchema,
  announcementSchema,
  settingsUpdateSchema,
} = require('../validators/schemas');
const { z } = require('zod');

const router = express.Router();
const staff = authorize('admin', 'staff');
const adminOnly = authorize('admin');

router.use(protect, apiLimiter);

/* -------------------------------- dashboard -------------------------------- */

router.get('/dashboard/stats', staff, dashboardController.stats);
router.get('/dashboard/analytics', staff, dashboardController.analytics);

/* ---------------------------------- courses -------------------------------- */

router.get('/courses', staff, courseController.listAdmin);
router.get('/courses/:id', staff, courseController.getById);
router.post('/courses', staff, validate(courseSchema), courseController.create);
router.patch('/courses/:id', staff, validate(courseSchema.partial(), 'body', { providedOnly: true }), courseController.update);
router.delete('/courses/:id', staff, courseController.remove);
router.delete('/courses/:id/permanent', adminOnly, courseController.destroy);

router.get('/categories', staff, courseController.listCategoriesAdmin);
router.post('/categories', staff, validate(categorySchema), courseController.createCategory);
router.patch('/categories/:id', staff, validate(categorySchema.partial(), 'body', { providedOnly: true }), courseController.updateCategory);
router.delete('/categories/:id', staff, courseController.deleteCategory);

/* ---------------------------------- trainers ------------------------------- */

router.get('/trainers', staff, trainerController.listAdmin);
router.get('/trainers/:id', staff, trainerController.getById);
router.post('/trainers', staff, validate(trainerSchema), trainerController.create);
router.patch('/trainers/:id', staff, validate(trainerSchema.partial(), 'body', { providedOnly: true }), trainerController.update);
router.delete('/trainers/:id', adminOnly, trainerController.remove);

/* ---------------------------------- batches -------------------------------- */

router.get('/batches', staff, batchController.listAdmin);
router.get('/batches/:id', staff, batchController.getById);
router.get('/batches/:id/students', staff, batchController.students);
router.post('/batches', staff, validate(batchSchema), batchController.create);
router.patch('/batches/:id', staff, validate(batchSchema.partial(), 'body', { providedOnly: true }), batchController.update);
router.delete('/batches/:id', staff, batchController.remove);

/* ------------------------------- applications ------------------------------ */

router.get('/applications', staff, applicationController.adminList);
router.get('/applications/:id', staff, applicationController.adminGetById);
router.patch('/applications/:id/status', staff, validate(applicationStatusSchema), applicationController.updateStatus);
router.post('/applications/:id/notes', staff, validate(applicationNoteSchema), applicationController.addNote);
router.patch('/applications/:id/assign', staff, validate(assignSchema), applicationController.assign);
router.patch('/applications/:id/follow-up', staff, validate(followUpSchema), applicationController.setFollowUp);

/* --------------------------------- enquiries ------------------------------- */

router.get('/enquiries', staff, enquiryController.adminList);
router.get('/enquiries/stats', staff, enquiryController.stats);
router.get('/enquiries/:id', staff, enquiryController.adminGetById);
router.patch('/enquiries/:id', staff, validate(enquiryUpdateSchema), enquiryController.update);

/* ---------------------------------- students ------------------------------- */

router.get('/students', staff, studentController.list);
router.get('/students/:id', staff, studentController.getById);
router.patch('/students/:id', staff, validate(studentUpdateSchema), studentController.update);
router.patch('/students/:id/toggle-active', staff, studentController.toggleActive);

/* -------------------------------- enrollments ------------------------------ */

router.get('/enrollments', staff, enrollmentController.adminList);
router.post(
  '/enrollments',
  staff,
  validate(z.object({ studentId: z.string().regex(/^[0-9a-fA-F]{24}$/), course: z.string().regex(/^[0-9a-fA-F]{24}$/), batch: z.string().optional(), application: z.string().optional() })),
  enrollmentController.adminCreate
);
router.patch('/enrollments/:id/drop', staff, enrollmentController.drop);
router.post('/enrollments/:id/certificate', staff, validate(z.object({ url: z.string().optional() })), enrollmentController.issueCertificate);

/* ---------------------------------- content -------------------------------- */

const contentRoutes = [
  { path: 'testimonials', ctrl: contentController.testimonials, schema: testimonialSchema },
  { path: 'events', ctrl: contentController.events, schema: eventSchema },
  { path: 'gallery', ctrl: contentController.gallery, schema: galleryItemSchema },
  { path: 'faqs', ctrl: contentController.faqs, schema: faqSchema },
  { path: 'announcements', ctrl: contentController.announcements, schema: announcementSchema },
];

for (const { path, ctrl, schema } of contentRoutes) {
  router.get(`/${path}`, staff, ctrl.listAdmin);
  router.get(`/${path}/:id`, staff, ctrl.getById);
  router.post(`/${path}`, staff, validate(schema), ctrl.create);
  router.patch(`/${path}/:id`, staff, validate(schema.partial(), 'body', { providedOnly: true }), ctrl.update);
  router.delete(`/${path}/:id`, staff, ctrl.remove);
}

router.patch('/testimonials/:id/moderate', staff, validate(z.object({ isApproved: z.boolean() })), contentController.moderateTestimonial);

/* -------------------------------- newsletter ------------------------------- */

router.get('/newsletter/subscribers', staff, newsletterController.listSubscribers);

/* --------------------------------- payments -------------------------------- */

router.get('/payments', staff, paymentController.adminList);
router.get('/payments/stats', staff, paymentController.adminStats);
router.post(
  '/payments/offline',
  staff,
  validate(
    z.object({
      studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
      course: z.string().regex(/^[0-9a-fA-F]{24}$/),
      batch: z.string().optional(),
      amount: z.coerce.number().min(0).optional(),
      notes: z.string().max(500).optional(),
    })
  ),
  paymentController.recordOffline
);
router.patch(
  '/payments/:id/refund',
  adminOnly,
  validate(z.object({ amount: z.coerce.number().positive(), status: z.enum(['pending', 'processed', 'failed']).default('pending'), reason: z.string().max(500).optional() })),
  paymentController.updateRefund
);

/* ---------------------------------- uploads -------------------------------- */

router.post(
  '/uploads',
  staff,
  formLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const folder = String(req.query.folder || 'academy').replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 60) || 'academy';
    const result = await storeFile(req.file, `academy/${folder}`);
    return created(res, { ...result, name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype }, 'File uploaded');
  })
);

/* --------------------------------- settings -------------------------------- */

router.get('/settings', staff, settingsController.getAdmin);
router.patch('/settings', adminOnly, validate(settingsUpdateSchema), settingsController.update);
router.get('/audit-logs', adminOnly, settingsController.listAuditLogs);

/* ----------------------------------- users --------------------------------- */

router.get('/users', adminOnly, settingsController.listUsers);
router.post('/users', adminOnly, validate(adminCreateUserSchema), settingsController.createUser);
router.patch('/users/:id', adminOnly, validate(adminUpdateUserSchema), settingsController.updateUser);
router.delete('/users/:id', adminOnly, settingsController.deleteUser);

module.exports = router;

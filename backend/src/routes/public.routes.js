const express = require('express');
const courseController = require('../controllers/courseController');
const trainerController = require('../controllers/trainerController');
const batchController = require('../controllers/batchController');
const settingsController = require('../controllers/settingsController');
const contentController = require('../controllers/contentController');
const applicationController = require('../controllers/applicationController');
const enquiryController = require('../controllers/enquiryController');
const newsletterController = require('../controllers/newsletterController');
const paymentController = require('../controllers/paymentController');
const validate = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const { formLimiter, apiLimiter } = require('../middleware/rateLimit');
const {
  courseQuerySchema,
  applicationCreateSchema,
  enquiryCreateSchema,
  newsletterSchema,
  reviewSchema,
} = require('../validators/schemas');

const router = express.Router();

/* --------------------------------- catalog -------------------------------- */

router.get('/settings', settingsController.getPublic);
router.get('/courses', apiLimiter, validate(courseQuerySchema, 'query'), courseController.listPublic);
router.get('/courses/:slug', apiLimiter, optionalAuth, courseController.getBySlug);
router.post('/courses/:id/reviews', apiLimiter, optionalAuth, validate(reviewSchema), courseController.addReview);
router.get('/categories', apiLimiter, courseController.listCategories);
router.get('/trainers', apiLimiter, trainerController.listPublic);
router.get('/trainers/:slug', apiLimiter, trainerController.getBySlug);
router.get('/batches', apiLimiter, batchController.listPublic);

/* --------------------------------- content -------------------------------- */

router.get('/testimonials', apiLimiter, contentController.testimonials.listPublic);
router.get('/events', apiLimiter, contentController.events.listPublic);
router.get('/gallery', apiLimiter, contentController.gallery.listPublic);
router.get('/faqs', apiLimiter, contentController.faqs.listPublic);
router.get('/announcements', apiLimiter, contentController.announcements.listPublic);

/* ---------------------------------- forms --------------------------------- */

router.post('/applications', formLimiter, optionalAuth, validate(applicationCreateSchema), applicationController.submit);
router.post('/enquiries', formLimiter, validate(enquiryCreateSchema), enquiryController.submit);
router.post('/newsletter/subscribe', formLimiter, validate(newsletterSchema), newsletterController.subscribe);
router.post('/newsletter/unsubscribe', formLimiter, validate(newsletterSchema), newsletterController.unsubscribe);

/* -------------------------------- payments -------------------------------- */

router.get('/payments/config', apiLimiter, paymentController.config);

/* --------------------------- authenticated extras -------------------------- */

router.get('/notifications/announcements', protect, apiLimiter, newsletterController.myAnnouncements);

module.exports = router;

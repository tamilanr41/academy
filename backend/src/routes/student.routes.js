const express = require('express');
const applicationController = require('../controllers/applicationController');
const enrollmentController = require('../controllers/enrollmentController');
const newsletterController = require('../controllers/newsletterController');
const paymentController = require('../controllers/paymentController');
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const { reviewSchema, objectId, studentProfileUpdateSchema } = require('../validators/schemas');
const { upload } = require('../services/uploadService');
const { z } = require('zod');

const router = express.Router();

router.use(protect, apiLimiter);

/* --------------------------- profile / applications ------------------------- */

router.get('/profile', studentController.myProfile);
router.patch('/profile', validate(studentProfileUpdateSchema), studentController.updateMyProfile);
router.post('/documents', upload.single('file'), studentController.uploadDocument);
router.delete('/documents/:id', validate(z.object({ id: objectId }), 'params'), studentController.deleteDocument);

router.get('/applications/my', applicationController.mine);
router.get('/applications/my/:id', applicationController.mineById);
router.post('/courses/:id/reviews', validate(reviewSchema), courseController.addReview);

/* ------------------------------- enrollments ------------------------------- */

router.get('/enrollments/my', enrollmentController.myEnrollments);
router.patch(
  '/enrollments/:id/progress',
  validate(z.object({ moduleTitle: z.string().trim().min(1), completed: z.boolean().default(true) })),
  enrollmentController.updateProgress
);

/* ------------------------------ notifications ------------------------------ */

router.get('/notifications', newsletterController.myNotifications);
router.get('/notifications/unread-count', newsletterController.unreadCount);
router.patch('/notifications/:id/read', newsletterController.markRead);
router.post('/notifications/read-all', newsletterController.markAllRead);

/* --------------------------------- payments -------------------------------- */

router.get('/payments/my', paymentController.myPayments);
router.post('/payments/order', validate(z.object({ course: objectId, batch: z.string().optional(), application: z.string().optional() })), paymentController.createOrder);
router.post(
  '/payments/verify',
  validate(
    z.object({
      paymentRecordId: objectId,
      orderId: z.string().trim().min(1, 'Order id is required'),
      paymentId: z.string().trim().min(1, 'Payment id is required'),
      signature: z.string().trim().min(1, 'Signature is required'),
    })
  ),
  paymentController.verifyPayment
);
router.get('/payments/:id/receipt', paymentController.getReceipt);

module.exports = router;

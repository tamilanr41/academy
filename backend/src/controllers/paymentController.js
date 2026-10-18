const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const CourseApplication = require('../models/CourseApplication');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const paymentService = require('../services/paymentService');
const auditService = require('../services/auditService');
const { enrollStudent } = require('./enrollmentController');
const { getSettings } = require('../services/settingsCache');
const env = require('../config/env');

/** Public-safe payment configuration for the frontend. */
const config = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  return success(res, {
    enabled: paymentService.isConfigured() && settings.features.paymentsEnabled,
    provider: 'razorpay',
    keyId: paymentService.isConfigured() ? env.RAZORPAY_KEY_ID : '',
    currency: settings.locale.currency,
    currencySymbol: settings.locale.currencySymbol,
    offlineFallback: true,
  }, 'Payment config fetched');
});

/** Student requests a payment order; the amount always comes from the DB, never the client. */
const createOrder = asyncHandler(async (req, res) => {
  const { course: courseId, batch: batchId, application: applicationId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.badRequest('Course not found');

  const amount = course.discountFee > 0 ? course.discountFee : course.fee;
  if (!amount || amount <= 0) throw ApiError.badRequest('This course does not require an online payment');

  const payment = await Payment.create({
    student: req.user._id,
    course: course._id,
    batch: batchId || undefined,
    application: applicationId || undefined,
    amount,
    currency: course.currency || 'INR',
    provider: 'razorpay',
    status: 'created',
  });

  const order = await paymentService.createOrder({
    amountInPaise: Math.round(amount * 100),
    receipt: payment._id.toString(),
    notes: {
      paymentId: payment._id.toString(),
      studentId: req.user._id.toString(),
      courseId: course._id.toString(),
    },
  });

  payment.orderId = order.id;
  await payment.save();

  await auditService.log({ actor: req.user, action: 'payment.create_order', entity: 'Payment', entityId: payment._id, summary: `Order ${order.id} for ${course.title}`, req });
  return created(res, { payment, order: { id: order.id, amount: order.amount, currency: order.currency }, keyId: env.RAZORPAY_KEY_ID }, 'Payment order created');
});

/**
 * Verifies the Razorpay signature on the server before marking anything as paid.
 * Idempotent: replaying the same verification returns the existing paid record.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentRecordId, orderId, paymentId, signature } = req.body;

  const payment = await Payment.findById(paymentRecordId);
  if (!payment) throw ApiError.notFound('Payment record not found');
  if (String(payment.student) !== String(req.user._id)) throw ApiError.forbidden('This payment does not belong to you');
  if (payment.status === 'paid') return success(res, payment, 'Payment already verified');

  if (payment.orderId && orderId && payment.orderId !== orderId) {
    throw ApiError.badRequest('Order reference mismatch');
  }

  const valid = paymentService.verifyPaymentSignature({ orderId: payment.orderId, paymentId, signature });
  if (!valid) {
    payment.status = 'failed';
    payment.failureReason = 'Signature verification failed';
    await payment.save();
    await auditService.log({ actor: req.user, action: 'payment.verify_failed', entity: 'Payment', entityId: payment._id, summary: 'Invalid payment signature', status: 'failure', req });
    throw ApiError.badRequest('Payment verification failed. If money was deducted, contact the academy with your reference.');
  }

  payment.status = 'paid';
  payment.paymentId = paymentId;
  payment.receiptNumber = payment.receiptNumber || Payment.generateReceipt();
  payment.paidAt = new Date();
  await payment.save();

  if (payment.application) {
    await CourseApplication.updateOne({ _id: payment.application }, { $set: { status: 'enrolled', $push: { statusHistory: { status: 'enrolled', note: 'Payment verified', at: new Date() } } } });
  }

  if (payment.batch) {
    try {
      await enrollStudent({ studentId: payment.student, courseId: payment.course, batchId: payment.batch, applicationId: payment.application, req });
    } catch (err) {
      if (err.statusCode !== 409) console.error('[payment] auto-enroll failed:', err.message);
    }
  }

  await Notification.create({
    user: payment.student,
    title: 'Payment successful',
    message: `We received your payment of ${payment.currency} ${payment.amount}. Receipt: ${payment.receiptNumber}`,
    type: 'payment',
    link: '/student/payments',
  });

  await auditService.log({ actor: req.user, action: 'payment.verify', entity: 'Payment', entityId: payment._id, summary: `Payment ${payment.receiptNumber} verified`, req });
  return success(res, payment, 'Payment verified successfully');
});

/** Razorpay webhook — uses the raw body and is fully idempotent. */
const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer, thanks to express.raw() mounted for this route

  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, message: 'Webhook secret not configured' });
  }
  if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }

  const entityPayment = event?.payload?.payment?.entity;
  if (!entityPayment) return res.json({ success: true, message: 'Ignored event' });

  const payment = entityPayment.order_id ? await Payment.findOne({ orderId: entityPayment.order_id }) : null;
  if (!payment) return res.json({ success: true, message: 'No matching payment' });
  if (payment.status === 'paid' && event.event !== 'payment.failed') return res.json({ success: true, message: 'Already processed' });

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    // Defence in depth: confirm the captured amount matches our record.
    if (Number(entityPayment.amount) && Number(entityPayment.amount) !== Math.round(payment.amount * 100)) {
      console.error('[payment:webhook] amount mismatch', entityPayment.amount, payment.amount);
      return res.status(409).json({ success: false, message: 'Amount mismatch' });
    }
    payment.status = 'paid';
    payment.paymentId = entityPayment.id;
    payment.method = entityPayment.method || '';
    payment.receiptNumber = payment.receiptNumber || Payment.generateReceipt();
    payment.paidAt = new Date();
    await payment.save();

    await auditService.log({ actor: undefined, action: 'payment.webhook_paid', entity: 'Payment', entityId: payment._id, summary: `Webhook marked ${payment.receiptNumber} paid`, req });
  } else if (event.event === 'payment.failed') {
    payment.status = 'failed';
    payment.failureReason = entityPayment.error_description || 'Payment failed';
    await payment.save();
  }

  return res.json({ success: true, message: 'Webhook processed' });
});

const myPayments = asyncHandler(async (req, res) => {
  const items = await Payment.find({ student: req.user._id }).populate('course', 'title slug image fee').populate('batch', 'name').sort({ createdAt: -1 }).lean();
  return success(res, items, 'Payments fetched');
});

const adminList = asyncHandler(async (req, res) => {
  const { status, student, course, page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (status) filter.status = status;
  if (student) filter.student = student;
  if (course) filter.course = course;

  const [items, total] = await Promise.all([
    Payment.find(filter).populate('student', 'name email').populate('course', 'title').sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Payment.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Payments fetched' });
});

const adminStats = asyncHandler(async (_req, res) => {
  const agg = await Payment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
      },
    },
  ]);
  const refunds = await Payment.aggregate([
    { $unwind: '$refunds' },
    { $group: { _id: null, total: { $sum: '$refunds.amount' }, count: { $sum: 1 } } },
  ]);
  return success(res, {
    byStatus: agg.map((a) => ({ status: a._id, count: a.count, total: a.total })),
    refunds: refunds[0] || { total: 0, count: 0 },
  }, 'Payment stats fetched');
});

/** Admin records an offline payment (cash/bank transfer) — never fabricates a gateway success. */
const recordOffline = asyncHandler(async (req, res) => {
  const { studentId, course, batch, amount, notes } = req.body;
  const courseDoc = await Course.findById(course);
  if (!courseDoc) throw ApiError.badRequest('Course not found');

  const value = Number(amount) || (courseDoc.discountFee > 0 ? courseDoc.discountFee : courseDoc.fee);
  if (!value || value <= 0) throw ApiError.badRequest('Amount is required for offline payments');

  const payment = await Payment.create({
    student: studentId,
    course: courseDoc._id,
    batch: batch || undefined,
    amount: value,
    currency: courseDoc.currency || 'INR',
    provider: 'offline',
    status: 'paid',
    receiptNumber: Payment.generateReceipt(),
    paidAt: new Date(),
    notes: notes || 'Recorded by admin (offline payment)',
  });

  if (batch) {
    try {
      await enrollStudent({ studentId, courseId: courseDoc._id, batchId: batch, req });
    } catch (err) {
      if (err.statusCode !== 409) console.error('[payment] offline enroll failed:', err.message);
    }
  }

  await auditService.log({ actor: req.user, action: 'payment.record_offline', entity: 'Payment', entityId: payment._id, summary: `Recorded offline payment ${payment.receiptNumber}`, req });
  return created(res, payment, 'Offline payment recorded');
});

const updateRefund = asyncHandler(async (req, res) => {
  const { amount, status, reason } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'paid') throw ApiError.badRequest('Only paid transactions can be refunded');

  const refundAmount = Number(amount);
  if (!refundAmount || refundAmount <= 0) throw ApiError.badRequest('Refund amount must be greater than zero');
  const alreadyRefunded = payment.refunds.filter((r) => r.status === 'processed').reduce((s, r) => s + r.amount, 0);
  if (refundAmount + alreadyRefunded > payment.amount) throw ApiError.badRequest('Refund exceeds the paid amount');

  payment.refunds.push({ amount: refundAmount, status: status || 'pending', reason: reason || '' });
  const processed = payment.refunds.filter((r) => r.status === 'processed').reduce((s, r) => s + r.amount, 0);
  if (processed >= payment.amount) payment.status = 'refunded';
  else if (processed > 0) payment.status = 'partially_refunded';
  await payment.save();

  await auditService.log({ actor: req.user, action: 'payment.refund', entity: 'Payment', entityId: payment._id, summary: `Refund ${refundAmount} (${status || 'pending'})`, req });
  return success(res, payment, 'Refund recorded');
});

const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('student', 'name email phone').populate('course', 'title fee durationText').populate('batch', 'name startDate');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (String(payment.student._id) !== String(req.user._id) && !['super_admin', 'admin', 'staff'].includes(req.user.role)) {
    throw ApiError.forbidden('This receipt does not belong to you');
  }
  if (payment.status !== 'paid') throw ApiError.badRequest('Receipts are only available for completed payments');
  return success(res, payment, 'Receipt fetched');
});

module.exports = { config, createOrder, verifyPayment, webhook, myPayments, adminList, adminStats, recordOffline, updateRefund, getReceipt };

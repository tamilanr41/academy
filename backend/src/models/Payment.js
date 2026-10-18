const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseApplication' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    provider: { type: String, enum: ['razorpay', 'offline'], default: 'razorpay' },
    orderId: { type: String, index: true },
    paymentId: { type: String, index: true },
    signature: { type: String, select: false },
    status: {
      type: String,
      enum: ['created', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded', 'expired'],
      default: 'created',
      index: true,
    },
    receiptNumber: { type: String, unique: true, sparse: true, index: true },
    failureReason: { type: String, default: '' },
    refunds: [
      {
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
        reason: { type: String, default: '' },
        at: { type: Date, default: Date.now },
      },
    ],
    method: { type: String, default: '' },
    paidAt: { type: Date },
    notes: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

paymentSchema.statics.generateReceipt = function generateReceipt() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `RCPT-${y}${m}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

paymentSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; delete ret.signature; return ret; } });

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'website' },
    unsubscribedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

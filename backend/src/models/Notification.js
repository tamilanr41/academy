const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: ['info', 'success', 'warning', 'application', 'enquiry', 'payment'], default: 'info' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Notification', notificationSchema);

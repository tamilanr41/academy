const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 3000 },
    audience: { type: String, enum: ['all', 'students', 'staff'], default: 'all', index: true },
    priority: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
    link: { type: String, default: '' },
    linkLabel: { type: String, default: '' },
    isPublished: { type: Boolean, default: true, index: true },
    publishAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Announcement', announcementSchema);

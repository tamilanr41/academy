const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    caption: { type: String, trim: true, maxlength: 500, default: '' },
    category: { type: String, enum: ['campus', 'classroom', 'event', 'achievement', 'other'], default: 'other', index: true },
    image: {
      url: { type: String, required: [true, 'Image is required'] },
      publicId: { type: String, default: '' },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

galleryItemSchema.index({ title: 'text', caption: 'text' });
galleryItemSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);

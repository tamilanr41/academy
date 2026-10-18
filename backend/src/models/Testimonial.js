const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    role: { type: String, trim: true, default: '', maxlength: 120 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    photo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    content: { type: String, required: [true, 'Testimonial content is required'], trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isApproved: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

testimonialSchema.index({ name: 'text', content: 'text' });
testimonialSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Testimonial', testimonialSchema);

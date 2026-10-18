const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, 'Question is required'], trim: true, maxlength: 300 },
    answer: { type: String, required: [true, 'Answer is required'], trim: true, maxlength: 3000 },
    category: { type: String, enum: ['general', 'admissions', 'courses', 'payments', 'certificates'], default: 'general', index: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

faqSchema.index({ question: 'text', answer: 'text' });
faqSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Faq', faqSchema);

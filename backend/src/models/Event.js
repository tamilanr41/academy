const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 5000 },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    startDate: { type: Date, required: [true, 'Start date is required'], index: true },
    endDate: { type: Date },
    location: { type: String, trim: true, default: '' },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    registrationUrl: { type: String, default: '' },
    category: { type: String, enum: ['workshop', 'seminar', 'exam', 'cultural', 'other'], default: 'other' },
    seats: { type: Number, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.pre('validate', function makeSlug() {
  if ((this.isModified('title') || this.isNew) && !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true, trim: true });
    this.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
});

eventSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Event', eventSchema);

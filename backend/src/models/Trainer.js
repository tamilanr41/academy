const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: [true, 'Trainer name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    designation: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    photo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, default: 0 },
    specializations: [{ type: String, trim: true }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    bio: { type: String, trim: true, maxlength: 2000, default: '' },
    availability: {
      days: [{ type: String }],
      from: { type: String, default: '' },
      to: { type: String, default: '' },
    },
    social: {
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

trainerSchema.index({ name: 'text', specializations: 'text', qualifications: 'text' });

trainerSchema.pre('validate', function makeSlug() {
  if ((this.isModified('name') || this.isNew) && !this.slug) {
    const base = require('slugify')(this.name, { lower: true, strict: true, trim: true });
    this.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
});

trainerSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Trainer', trainerSchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

const courseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true, maxlength: 80 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    icon: { type: String, default: 'BookOpen' },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseCategorySchema.pre('validate', function makeSlug() {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
});

courseCategorySchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('CourseCategory', courseCategorySchema);

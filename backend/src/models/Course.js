const mongoose = require('mongoose');
const slugify = require('slugify');

const curriculumModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    duration: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const courseFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1500 },
    isApproved: { type: Boolean, default: false, index: true },
    role: { type: String, default: 'Student' },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', index: true },
    shortDescription: { type: String, trim: true, maxlength: 400, default: '' },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', index: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline', index: true },
    durationText: { type: String, trim: true, default: '' },
    durationWeeks: { type: Number, min: 0, default: 0 },
    fee: { type: Number, required: [true, 'Fee is required'], min: 0 },
    discountFee: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'INR' },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    banner: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    videoUrl: { type: String, trim: true, default: '' },
    trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
    prerequisites: [{ type: String, trim: true }],
    learningOutcomes: [{ type: String, trim: true }],
    curriculum: [curriculumModuleSchema],
    faqs: [courseFaqSchema],
    reviews: [reviewSchema],
    seats: { type: Number, min: 0, default: 30 },
    enrolledCount: { type: Number, min: 0, default: 0 },
    views: { type: Number, min: 0, default: 0 },
    certificateProvided: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    order: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        if (ret.reviews) {
          ret.reviewCount = ret.reviews.filter((r) => r.isApproved).length;
          const approved = ret.reviews.filter((r) => r.isApproved);
          ret.ratingAverage = approved.length
            ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10
            : 0;
          ret.reviews = ret.reviews.filter((r) => r.isApproved);
        }
        return ret;
      },
    },
  }
);

courseSchema.index({ title: 'text', shortDescription: 'text', description: 'text', tags: 'text' });
courseSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

courseSchema.pre('validate', function makeSlug() {
  if ((this.isModified('title') || this.isNew) && !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true, trim: true });
    this.slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
});

courseSchema.virtual('effectiveFee').get(function effectiveFee() {
  return this.discountFee > 0 ? this.discountFee : this.fee;
});

module.exports = mongoose.model('Course', courseSchema);

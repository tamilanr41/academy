const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema(
  {
    moduleTitle: { type: String, required: true },
    completedAt: { type: Date },
  },
  { _id: true }
);

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseApplication' },
    status: { type: String, enum: ['active', 'completed', 'dropped', 'cancelled'], default: 'active', index: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: [lessonProgressSchema],
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    certificate: {
      issued: { type: Boolean, default: false },
      certificateId: { type: String, unique: true, sparse: true },
      issuedAt: { type: Date },
      url: { type: String, default: '' },
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1, batch: 1 }, { unique: true, partialFilterExpression: { batch: { $exists: true, $ne: null } } });
enrollmentSchema.index({ createdAt: -1 });

enrollmentSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

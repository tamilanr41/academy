const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['new', 'under_review', 'contacted', 'approved', 'rejected', 'enrolled'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: APPLICATION_STATUSES, required: true },
    note: { type: String, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true, maxlength: 1000 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const courseApplicationSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, index: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true, match: [/^[+\d][\d\s\-()]{7,19}$/, 'Enter a valid phone number'] },
    dateOfBirth: { type: Date },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', index: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    qualification: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'new', index: true },
    statusHistory: [statusHistorySchema],
    staffNotes: [noteSchema],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    source: { type: String, default: 'website', enum: ['website', 'admin', 'phone', 'walk-in', 'other'] },
    followUpDate: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseApplicationSchema.index({ createdAt: -1 });
courseApplicationSchema.index({ name: 'text', email: 'text', referenceNumber: 'text' });

courseApplicationSchema.statics.generateReference = function generateReference() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `APP-${y}${m}-${rand}`;
};

courseApplicationSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('CourseApplication', courseApplicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;

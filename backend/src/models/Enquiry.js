const mongoose = require('mongoose');

const ENQUIRY_STATUSES = ['new', 'in_progress', 'resolved', 'closed'];

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: '', match: [/^$|^[\s\d()+-]{7,20}$/, 'Enter a valid phone number'] },
    subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 3000 },
    type: { type: String, enum: ['general', 'course', 'admission', 'event', 'other'], default: 'general', index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    staffNotes: [
      {
        note: { type: String, required: true, trim: true, maxlength: 1000 },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    followUpDate: { type: Date, index: true },
    resolvedAt: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ name: 'text', subject: 'text', message: 'text' });

enquirySchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('Enquiry', enquirySchema);
module.exports.ENQUIRY_STATUSES = ENQUIRY_STATUSES;

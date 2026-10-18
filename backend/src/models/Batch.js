const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Batch name is required'], trim: true, maxlength: 120 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', index: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    startDate: { type: Date, required: [true, 'Start date is required'], index: true },
    endDate: { type: Date, required: [true, 'End date is required'] },
    days: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    venue: { type: String, trim: true, default: '' },
    meetingLink: { type: String, trim: true, default: '' },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, default: 30 },
    enrolledCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming', index: true },
    fee: { type: Number, min: 0, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        ret.seatsLeft = Math.max(0, (ret.capacity || 0) - (ret.enrolledCount || 0));
        return ret;
      },
    },
  }
);

batchSchema.index({ course: 1, startDate: 1 });
batchSchema.index({ status: 1, startDate: 1 });

batchSchema.pre('validate', function checkDates() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
});

module.exports = mongoose.model('Batch', batchSchema);

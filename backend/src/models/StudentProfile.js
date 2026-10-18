const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },
    qualification: { type: String, trim: true, default: '' },
    occupation: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    guardian: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

studentProfileSchema.virtual('age').get(function calcAge() {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
});

studentProfileSchema.set('toJSON', { virtuals: false, transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

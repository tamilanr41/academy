const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    academyName: { type: String, default: 'Magma Minds Academy' },
    tagline: { type: String, default: 'No. 1 Computer Training and Spoken English Classes in Tiruppur' },
    logo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    favicon: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      alternatePhone: { type: String, default: '' },
      address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
      },
      mapEmbedUrl: { type: String, default: '' },
      coordinates: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
      businessHours: [
        {
          day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
          open: { type: String, default: '' },
          close: { type: String, default: '' },
          closed: { type: Boolean, default: false },
        },
      ],
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    brand: {
      primaryColor: { type: String, default: '#971F05' },
      accentColor: { type: String, default: '#F4B9B9' },
      radius: { type: String, enum: ['sm', 'md', 'lg', 'xl'], default: 'lg' },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
    locale: {
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      dateFormat: { type: String, default: 'dd MMM yyyy' },
    },
    seo: {
      siteTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
    },
    features: {
      paymentsEnabled: { type: Boolean, default: false },
      registrationEnabled: { type: Boolean, default: true },
      onlineLearningEnabled: { type: Boolean, default: true },
      testimonialSubmission: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    email: {
      enabled: { type: Boolean, default: true },
      fromName: { type: String, default: '' },
      fromEmail: { type: String, default: '' },
      notifyOnApplication: { type: Boolean, default: true },
      notifyOnEnquiry: { type: Boolean, default: true },
    },
    footer: {
      aboutText: { type: String, default: '' },
      links: [
        {
          label: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
    },
    media: {
      heroImage: { type: String, default: '' },
      heroVideoUrl: { type: String, default: '' },
      promoVideoUrl: { type: String, default: '' },
      promoPoster: { type: String, default: '' },
      campusVideoUrl: { type: String, default: '' },
      campusPoster: { type: String, default: '' },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, minimize: false }
);

siteSettingSchema.statics.getSettings = async function getSettings() {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) {
    doc = await this.create({ key: 'site' });
  }
  return doc;
};

siteSettingSchema.set('toJSON', { transform(_d, ret) { delete ret.__v; return ret; } });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);

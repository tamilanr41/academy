const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier');
const optionalObjectId = z.union([objectId, z.literal(''), z.null()]).optional().transform((v) => (v === '' || v === null ? undefined : v));

const emailField = z.email({ message: 'Enter a valid email address' }).trim().toLowerCase();
const phoneField = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s\-()]{7,19}$/, 'Enter a valid phone number');
const optionalPhoneField = z
  .string()
  .trim()
  .regex(/^$|^\+?[0-9][0-9\s\-()]{7,19}$/, 'Enter a valid phone number')
  .optional();

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .refine((v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v), 'Password must contain letters and numbers');

const dateField = z
  .string()
  .trim()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date');

const urlField = z
  .string()
  .trim()
  .refine((v) => v === '' || /^(https?:\/\/|\/)/.test(v), 'Enter a valid URL');

/**
 * File reference fields accept either { url, publicId } (from the upload API)
 * or a plain URL string, and always normalize to the object shape used by models.
 */
const fileRef = z
  .union([
    z.object({ url: z.string().default(''), publicId: z.string().default('') }),
    z.string().transform((url) => ({ url, publicId: '' })),
  ])
  .optional()
  .default({ url: '', publicId: '' });

const fileRefRequired = z
  .union([
    z.object({ url: z.string().min(1, 'Image is required'), publicId: z.string().default('') }),
    z.string().min(1, 'Image is required').transform((url) => ({ url, publicId: '' })),
  ]);

/* ---------------------------------- auth ---------------------------------- */

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: emailField,
  password: passwordField,
  phone: optionalPhoneField,
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({ email: emailField });

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  password: passwordField,
});

const verifyEmailSchema = z.object({ token: z.string().min(10, 'Invalid verification token') });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordField,
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: optionalPhoneField,
  dateOfBirth: dateField.optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
  qualification: z.string().trim().max(120).optional(),
  occupation: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  address: z
    .object({
      line1: z.string().max(200).optional(),
      line2: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(12).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  guardian: z
    .object({
      name: z.string().max(120).optional(),
      phone: z.string().max(20).optional(),
      relation: z.string().max(60).optional(),
    })
    .optional(),
});

const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailField,
  password: passwordField,
  role: z.enum(['super_admin', 'admin', 'staff', 'trainer', 'student']).default('student'),
  phone: optionalPhoneField,
  isActive: z.boolean().optional(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(['super_admin', 'admin', 'staff', 'trainer', 'student']).optional(),
  isActive: z.boolean().optional(),
  phone: optionalPhoneField,
  password: passwordField.optional(),
});

/* --------------------------------- courses -------------------------------- */

const curriculumItemSchema = z.object({
  title: z.string().trim().min(1, 'Module title is required').max(200),
  description: z.string().trim().max(1200).optional().default(''),
  duration: z.string().trim().max(60).optional().default(''),
  order: z.number().int().min(0).optional().default(0),
});

const faqItemSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(300),
  answer: z.string().trim().min(1, 'Answer is required').max(3000),
});

const courseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  category: objectId,
  shortDescription: z.string().trim().max(400).optional().default(''),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  mode: z.enum(['online', 'offline', 'hybrid']).default('offline'),
  durationText: z.string().trim().max(80).optional().default(''),
  durationWeeks: z.coerce.number().int().min(0).max(240).optional().default(0),
  fee: z.coerce.number().min(0, 'Fee cannot be negative'),
  discountFee: z.coerce.number().min(0).optional().default(0),
  currency: z.string().max(6).optional().default('INR'),
  image: fileRef,
  banner: fileRef,
  videoUrl: z.string().trim().max(1000).optional().default(''),
  trainers: z.array(objectId).optional().default([]),
  prerequisites: z.array(z.string().trim().max(300)).optional().default([]),
  learningOutcomes: z.array(z.string().trim().max(300)).optional().default([]),
  curriculum: z.array(curriculumItemSchema).max(100).optional().default([]),
  faqs: z.array(faqItemSchema).max(50).optional().default([]),
  seats: z.coerce.number().int().min(0).max(10000).optional().default(30),
  certificateProvided: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  tags: z.array(z.string().trim().toLowerCase().max(40)).max(20).optional().default([]),
  order: z.coerce.number().int().optional().default(0),
  seo: z
    .object({
      metaTitle: z.string().max(160).optional().default(''),
      metaDescription: z.string().max(320).optional().default(''),
    })
    .optional()
    .default({ metaTitle: '', metaDescription: '' }),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(''),
  icon: z.string().max(40).optional().default('BookOpen'),
  image: fileRef,
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const courseQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  mode: z.enum(['online', 'offline', 'hybrid']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  publishedOnly: z.enum(['true', 'false']).optional(),
  minFee: z.coerce.number().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'popular', 'fee_low', 'fee_high', 'title']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, 'Tell us a little more').max(1500),
  email: emailField.optional(),
});

/* ------------------------------- applications ------------------------------ */

const applicationCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: emailField,
  phone: phoneField,
  dateOfBirth: dateField.optional(),
  course: objectId,
  batch: optionalObjectId,
  mode: z.enum(['online', 'offline', 'hybrid']).default('offline'),
  qualification: z.string().trim().max(160).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  honeypot: z.string().max(0, 'Submission rejected').optional().default(''),
});

const applicationStatusSchema = z.object({
  status: z.enum(['new', 'under_review', 'contacted', 'approved', 'rejected', 'enrolled']),
  note: z.string().trim().max(1000).optional().default(''),
});

const applicationNoteSchema = z.object({
  note: z.string().trim().min(2, 'Note cannot be empty').max(1000),
});

const assignSchema = z.object({
  assignedTo: z.union([objectId, z.null()]),
});

const followUpSchema = z.object({
  followUpDate: z.union([z.string().trim().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'), z.null()]),
});

/* --------------------------------- enquiries ------------------------------- */

const enquiryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: emailField,
  phone: optionalPhoneField,
  subject: z.string().trim().min(3, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
  type: z.enum(['general', 'course', 'admission', 'event', 'other']).default('general'),
  course: optionalObjectId,
  honeypot: z.string().max(0, 'Submission rejected').optional().default(''),
});

const enquiryUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: z.union([objectId, z.null()]).optional(),
  followUpDate: z.union([z.string().trim().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'), z.null()]).optional(),
  note: z.string().trim().min(2).max(1000).optional(),
});

/* --------------------------------- students -------------------------------- */

const studentUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: optionalPhoneField,
  isActive: z.boolean().optional(),
  role: z.enum(['super_admin', 'admin', 'staff', 'trainer', 'student']).optional(),
});

/* --------------------------------- batches --------------------------------- */

const batchSchema = z.object({
  name: z.string().trim().min(2, 'Batch name is required').max(120),
  course: objectId,
  trainer: optionalObjectId,
  mode: z.enum(['online', 'offline', 'hybrid']).default('offline'),
  startDate: z.string().trim().refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid start date'),
  endDate: z.string().trim().refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid end date'),
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional().default([]),
  startTime: z.string().max(10).optional().default(''),
  endTime: z.string().max(10).optional().default(''),
  timezone: z.string().max(60).optional().default('Asia/Kolkata'),
  venue: z.string().max(200).optional().default(''),
  meetingLink: urlField.optional().default(''),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(10000),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional().default('upcoming'),
  fee: z.coerce.number().min(0).optional().default(0),
});

/* -------------------------------- trainers --------------------------------- */

const trainerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  user: optionalObjectId,
  designation: z.string().trim().max(140).optional().default(''),
  email: z.union([emailField, z.literal('')]).optional().default(''),
  phone: optionalPhoneField,
  photo: fileRef,
  qualifications: z.array(z.string().trim().max(200)).max(20).optional().default([]),
  experienceYears: z.coerce.number().int().min(0).max(60).optional().default(0),
  specializations: z.array(z.string().trim().max(200)).max(20).optional().default([]),
  courses: z.array(objectId).optional().default([]),
  bio: z.string().trim().max(2000).optional().default(''),
  availability: z
    .object({
      days: z.array(z.string().max(10)).optional().default([]),
      from: z.string().max(10).optional().default(''),
      to: z.string().max(10).optional().default(''),
    })
    .optional()
    .default({ days: [], from: '', to: '' }),
  social: z
    .object({
      linkedin: urlField.optional().default(''),
      website: urlField.optional().default(''),
    })
    .optional()
    .default({ linkedin: '', website: '' }),
  isActive: z.boolean().optional().default(true),
  order: z.coerce.number().int().optional().default(0),
});

/* --------------------------------- content --------------------------------- */

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).optional().default(''),
  content: z.string().trim().min(10, 'Testimonial must be at least 10 characters').max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  photo: fileRef,
  course: optionalObjectId,
  isApproved: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  order: z.coerce.number().int().optional().default(0),
});

const eventSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  image: fileRef,
  startDate: z.string().trim().refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date'),
  endDate: z.union([z.string().trim().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'), z.null()]).optional(),
  location: z.string().max(200).optional().default(''),
  mode: z.enum(['online', 'offline', 'hybrid']).optional().default('offline'),
  registrationUrl: urlField.optional().default(''),
  category: z.enum(['workshop', 'seminar', 'exam', 'cultural', 'other']).optional().default('other'),
  seats: z.coerce.number().int().min(0).optional().default(0),
  isPublished: z.boolean().optional().default(false),
});

const galleryItemSchema = z.object({
  title: z.string().trim().min(2).max(160),
  caption: z.string().trim().max(500).optional().default(''),
  category: z.enum(['campus', 'classroom', 'event', 'achievement', 'other']).optional().default('other'),
  image: fileRefRequired,
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const faqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(3000),
  category: z.enum(['general', 'admissions', 'courses', 'payments', 'certificates']).optional().default('general'),
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(200),
  message: z.string().trim().min(3).max(3000),
  audience: z.enum(['all', 'students', 'staff']).optional().default('all'),
  priority: z.enum(['low', 'normal', 'urgent']).optional().default('normal'),
  link: urlField.optional().default(''),
  linkLabel: z.string().max(80).optional().default(''),
  isPublished: z.boolean().optional().default(true),
  publishAt: z.union([z.string().trim().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'), z.null()]).optional(),
  expiresAt: z.union([z.string().trim().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date'), z.null()]).optional(),
});

/* -------------------------------- settings --------------------------------- */

const settingsUpdateSchema = z.object({
  academyName: z.string().trim().min(2).max(160).optional(),
  tagline: z.string().trim().max(200).optional(),
  logo: z.object({ url: z.string().max(500).optional(), publicId: z.string().max(300).optional() }).optional(),
  favicon: z.object({ url: z.string().max(500).optional(), publicId: z.string().max(300).optional() }).optional(),
  contact: z
    .object({
      email: z.union([emailField, z.literal('')]).optional(),
      phone: z.string().max(40).optional(),
      alternatePhone: z.string().max(40).optional(),
      address: z
        .object({
          line1: z.string().max(200).optional(),
          line2: z.string().max(200).optional(),
          city: z.string().max(100).optional(),
          state: z.string().max(100).optional(),
          pincode: z.string().max(12).optional(),
          country: z.string().max(100).optional(),
        })
        .optional(),
      mapEmbedUrl: z.string().max(1000).optional(),
      coordinates: z.object({ lat: z.coerce.number().optional(), lng: z.coerce.number().optional() }).optional(),
      businessHours: z
        .array(
          z.object({
            day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
            open: z.string().max(10).optional().default(''),
            close: z.string().max(10).optional().default(''),
            closed: z.boolean().optional().default(false),
          })
        )
        .optional(),
    })
    .optional(),
  social: z
    .object({
      facebook: z.string().max(400).optional(),
      instagram: z.string().max(400).optional(),
      youtube: z.string().max(400).optional(),
      linkedin: z.string().max(400).optional(),
      twitter: z.string().max(400).optional(),
      whatsapp: z.string().max(400).optional(),
    })
    .optional(),
  brand: z
    .object({
      primaryColor: z.string().max(20).optional(),
      accentColor: z.string().max(20).optional(),
      radius: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional(),
  locale: z
    .object({
      currency: z.string().max(6).optional(),
      currencySymbol: z.string().max(6).optional(),
      timezone: z.string().max(60).optional(),
      dateFormat: z.string().max(40).optional(),
    })
    .optional(),
  seo: z
    .object({
      siteTitle: z.string().max(200).optional(),
      metaDescription: z.string().max(400).optional(),
      keywords: z.array(z.string().max(60)).max(30).optional(),
      ogImage: z.string().max(500).optional(),
      canonicalUrl: z.string().max(500).optional(),
    })
    .optional(),
  features: z
    .object({
      paymentsEnabled: z.boolean().optional(),
      registrationEnabled: z.boolean().optional(),
      onlineLearningEnabled: z.boolean().optional(),
      testimonialSubmission: z.boolean().optional(),
      maintenanceMode: z.boolean().optional(),
    })
    .optional(),
  email: z
    .object({
      enabled: z.boolean().optional(),
      fromName: z.string().max(120).optional(),
      fromEmail: z.union([emailField, z.literal('')]).optional(),
      notifyOnApplication: z.boolean().optional(),
      notifyOnEnquiry: z.boolean().optional(),
    })
    .optional(),
  footer: z
    .object({
      aboutText: z.string().max(1000).optional(),
      links: z
        .array(z.object({ label: z.string().min(1).max(80), url: z.string().min(1).max(400) }))
        .max(20)
        .optional(),
    })
    .optional(),
  media: z
    .object({
      heroImage: z.string().max(1000).optional(),
      heroVideoUrl: z.string().max(1000).optional(),
      promoVideoUrl: z.string().max(1000).optional(),
      promoPoster: z.string().max(1000).optional(),
      campusVideoUrl: z.string().max(1000).optional(),
      campusPoster: z.string().max(1000).optional(),
    })
    .optional(),
});

/* -------------------------------- misc forms -------------------------------- */

const newsletterSchema = z.object({ email: emailField });

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = {
  objectId,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  courseSchema,
  categorySchema,
  courseQuerySchema,
  reviewSchema,
  applicationCreateSchema,
  applicationStatusSchema,
  applicationNoteSchema,
  assignSchema,
  followUpSchema,
  enquiryCreateSchema,
  enquiryUpdateSchema,
  studentUpdateSchema,
  batchSchema,
  trainerSchema,
  testimonialSchema,
  eventSchema,
  galleryItemSchema,
  faqSchema,
  announcementSchema,
  settingsUpdateSchema,
  newsletterSchema,
  paginationQuery,
};

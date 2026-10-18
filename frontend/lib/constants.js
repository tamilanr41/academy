/** Shared constants: navigation, statuses, roles and label maps. */

export const PUBLIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Trainers', href: '/trainers' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_LINKS = {
  Explore: [
    { label: 'All Courses', href: '/courses' },
    { label: 'Our Trainers', href: '/trainers' },
    { label: 'Upcoming Events', href: '/events' },
    { label: 'Student Gallery', href: '/gallery' },
    { label: 'Testimonials', href: '/testimonials' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Apply Now', href: '/apply' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Student Login', href: '/login' },
    { label: 'Register', href: '/register' },
  ],
};

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const COURSE_MODES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'New', tone: 'info' },
  { value: 'under_review', label: 'Under Review', tone: 'warning' },
  { value: 'contacted', label: 'Contacted', tone: 'brand' },
  { value: 'approved', label: 'Approved', tone: 'success' },
  { value: 'enrolled', label: 'Enrolled', tone: 'success' },
  { value: 'rejected', label: 'Rejected', tone: 'danger' },
];

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', tone: 'info' },
  { value: 'in_progress', label: 'In Progress', tone: 'warning' },
  { value: 'resolved', label: 'Resolved', tone: 'success' },
  { value: 'closed', label: 'Closed', tone: 'neutral' },
];

export const BATCH_STATUSES = [
  { value: 'upcoming', label: 'Upcoming', tone: 'info' },
  { value: 'ongoing', label: 'Ongoing', tone: 'success' },
  { value: 'completed', label: 'Completed', tone: 'neutral' },
  { value: 'cancelled', label: 'Cancelled', tone: 'danger' },
];

export const PAYMENT_STATUSES = [
  { value: 'created', label: 'Created', tone: 'neutral' },
  { value: 'authorized', label: 'Authorized', tone: 'info' },
  { value: 'paid', label: 'Paid', tone: 'success' },
  { value: 'failed', label: 'Failed', tone: 'danger' },
  { value: 'refunded', label: 'Refunded', tone: 'warning' },
  { value: 'partially_refunded', label: 'Partially Refunded', tone: 'warning' },
  { value: 'expired', label: 'Expired', tone: 'neutral' },
];

export const ENROLLMENT_STATUSES = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'completed', label: 'Completed', tone: 'brand' },
  { value: 'dropped', label: 'Dropped', tone: 'danger' },
  { value: 'cancelled', label: 'Cancelled', tone: 'neutral' },
];

export const TESTIMONIAL_STATUSES = [
  { value: 'approved', label: 'Approved', tone: 'success' },
  { value: 'pending', label: 'Pending', tone: 'warning' },
];

export const EVENT_CATEGORIES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'exam', label: 'Exam' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'other', label: 'Other' },
];

export const GALLERY_CATEGORIES = [
  { value: 'campus', label: 'Campus' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'event', label: 'Event' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'other', label: 'Other' },
];

export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'courses', label: 'Courses' },
  { value: 'payments', label: 'Payments' },
  { value: 'certificates', label: 'Certificates' },
];

export const ANNOUNCEMENT_AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'Students' },
  { value: 'staff', label: 'Staff' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
];

export const WEEKDAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

export const USER_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'student', label: 'Student' },
];

export const getStatusMeta = (list, value) =>
  list.find((item) => item.value === value) || { value, label: value, tone: 'neutral' };

export const ENQUIRY_TYPES = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'course', label: 'Course Information' },
  { value: 'admission', label: 'Admission' },
  { value: 'event', label: 'Events' },
  { value: 'other', label: 'Other' },
];

export const ADMIN_NAV = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    ],
  },
  {
    group: 'Admissions',
    items: [
      { label: 'Applications', href: '/admin/applications', icon: 'ClipboardList' },
      { label: 'Enquiries', href: '/admin/enquiries', icon: 'MessageSquare' },
      { label: 'Enrollments', href: '/admin/enrollments', icon: 'GraduationCap' },
      { label: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
    ],
  },
  {
    group: 'Academy',
    items: [
      { label: 'Courses', href: '/admin/courses', icon: 'BookOpen' },
      { label: 'Categories', href: '/admin/categories', icon: 'FolderTree' },
      { label: 'Trainers', href: '/admin/trainers', icon: 'UserCog' },
      { label: 'Batches', href: '/admin/batches', icon: 'CalendarClock' },
      { label: 'Students', href: '/admin/students', icon: 'Users' },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Testimonials', href: '/admin/testimonials', icon: 'Quote' },
      { label: 'Events', href: '/admin/events', icon: 'CalendarDays' },
      { label: 'Gallery', href: '/admin/gallery', icon: 'Images' },
      { label: 'FAQs', href: '/admin/faqs', icon: 'HelpCircle' },
      { label: 'Announcements', href: '/admin/announcements', icon: 'Megaphone' },
      { label: 'Newsletter', href: '/admin/newsletter', icon: 'Mail' },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'ShieldCheck' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'ScrollText' },
    ],
  },
];

export const STUDENT_NAV = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Applications', href: '/dashboard/applications', icon: 'ClipboardList' },
  { label: 'My Courses', href: '/dashboard/enrollments', icon: 'GraduationCap' },
  { label: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'UserCircle' },
];

/**
 * Removes demo student accounts (and everything that belongs to them).
 *
 * Use this after seeding the demo catalogue on a production/staging server:
 *   npm run seed            # or: node src/seeders/runSeeder.js --demo
 *   npm run clear:demo-users
 *
 * Demo admins are never touched; course/trainer/gallery content stays.
 */
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const CourseApplication = require('../models/CourseApplication');
const Enquiry = require('../models/Enquiry');

async function clearDemoUsers() {
  const demoUsers = await User.find({ isDemo: true, role: 'student' }).select('_id email').lean();
  if (!demoUsers.length) {
    console.log('ℹ No demo student accounts found.');
    return;
  }

  const ids = demoUsers.map((u) => u._id);
  const emails = demoUsers.map((u) => u.email);

  const [profiles, enrollments, payments, applications, enquiries, users] = await Promise.all([
    StudentProfile.deleteMany({ user: { $in: ids } }),
    Enrollment.deleteMany({ student: { $in: ids } }),
    Payment.deleteMany({ student: { $in: ids } }),
    CourseApplication.deleteMany({ user: { $in: ids } }),
    Enquiry.deleteMany({ email: { $in: emails } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);

  console.log(`✓ removed ${users.deletedCount} demo students (and ${enrollments.deletedCount} enrollments, ${payments.deletedCount} payments, ${applications.deletedCount} applications, ${enquiries.deletedCount} enquiries, ${profiles.deletedCount} profiles)`);
}

if (require.main === module) {
  (async () => {
    await connectDB();
    await clearDemoUsers();
    await disconnectDB();
    process.exit(0);
  })().catch(async (err) => {
    console.error('✗ clearDemoUsers failed:', err.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  });
}

module.exports = { clearDemoUsers };

/**
 * Runs the requested seeders.
 *   node src/seeders/runSeeder.js            -> settings + demo data + super admin (if env set)
 *   node src/seeders/runSeeder.js --demo     -> demo content only
 *   node src/seeders/runSeeder.js --superadmin
 */
const { connectDB, disconnectDB } = require('../config/db');
const { seedDemo } = require('./seedDemo');
const { seedSuperAdmin } = require('./seedSuperAdmin');
const env = require('../config/env');

const args = process.argv.slice(2);
const onlyDemo = args.includes('--demo');
const onlySuper = args.includes('--superadmin');

(async () => {
  await connectDB();

  if (args.includes('--clear-demo')) {
    const models = ['Course', 'CourseCategory', 'Trainer', 'Batch', 'Testimonial', 'Event', 'GalleryItem', 'Faq', 'Announcement', 'Enquiry', 'CourseApplication', 'Enrollment', 'Payment', 'User'];
    const mongoose = require('mongoose');
    for (const name of models) {
      const model = mongoose.model(name);
      const res = await model.deleteMany({ isDemo: true });
      if (res.deletedCount) console.log(`✓ removed ${res.deletedCount} demo ${name} document(s)`);
    }
    await disconnectDB();
    process.exit(0);
  }

  if (onlyDemo) {
    await seedDemo();
  } else if (onlySuper) {
    await seedSuperAdmin();
  } else {
    await seedDemo();
    if (env.SUPER_ADMIN_EMAIL && env.SUPER_ADMIN_PASSWORD) {
      await seedSuperAdmin();
    } else {
      console.log('ℹ Skipping super admin creation (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set).');
    }
  }

  await disconnectDB();
  process.exit(0);
})().catch(async (err) => {
  console.error('✗ Seeder run failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});

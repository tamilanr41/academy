/**
 * Creates (or repairs) the first Super Admin from environment variables.
 * Usage: npm run seed:superadmin
 * Never hardcode credentials — set SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.
 */
const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

async function seedSuperAdmin() {
  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
    console.error('✗ SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in the environment.');
    console.error('  Example: SUPER_ADMIN_EMAIL=admin@academy.com SUPER_ADMIN_PASSWORD=ChangeMe123 npm run seed:superadmin');
    process.exitCode = 1;
    return null;
  }
  if (env.SUPER_ADMIN_PASSWORD.length < 8) {
    console.error('✗ SUPER_ADMIN_PASSWORD must be at least 8 characters.');
    process.exitCode = 1;
    return null;
  }

  const email = env.SUPER_ADMIN_EMAIL.toLowerCase();
  let user = await User.findOne({ email }).select('+password');

  if (user) {
    user.role = 'super_admin';
    user.isActive = true;
    user.isEmailVerified = true;
    user.name = env.SUPER_ADMIN_NAME;
    user.password = env.SUPER_ADMIN_PASSWORD;
    await user.save();
    console.log(`✓ Existing account upgraded to Super Admin: ${email}`);
  } else {
    user = await User.create({
      name: env.SUPER_ADMIN_NAME,
      email,
      password: env.SUPER_ADMIN_PASSWORD,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`✓ Super Admin created: ${email}`);
  }
  return user;
}

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedSuperAdmin();
    await disconnectDB();
    process.exit(process.exitCode || 0);
  })().catch(async (err) => {
    console.error('✗ Seeder failed:', err.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  });
}

module.exports = { seedSuperAdmin };

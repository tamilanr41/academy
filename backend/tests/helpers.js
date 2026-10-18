/**
 * Shared test helpers. Tests run against a dedicated local database
 * (MONGODB_URI=mongodb://127.0.0.1:27017/academy_test) so development
 * data is never touched.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const createApp = require('../src/app');
const User = require('../src/models/User');
const CourseCategory = require('../src/models/CourseCategory');
const Course = require('../src/models/Course');
const Trainer = require('../src/models/Trainer');
const Batch = require('../src/models/Batch');

const DEFAULT_TEST_URI = 'mongodb://127.0.0.1:27017/academy_test';

/**
 * Resolve the URI tests may use. Deliberately strict: if anything (an .env
 * leak, a stray shell export) points MONGODB_URI at a development database,
 * we fall back to `academy_test` instead. Tests must never touch dev data.
 */
function resolveTestUri() {
  const raw = process.env.MONGODB_URI || DEFAULT_TEST_URI;
  try {
    const url = new URL(raw);
    const name = url.pathname.replace(/^\//, '');
    if (!name.endsWith('_test')) {
      url.pathname = '/academy_test';
      return url.toString();
    }
    return raw;
  } catch {
    return DEFAULT_TEST_URI;
  }
}

function assertTestDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Test database is not connected. connectTestDB() must run before clearing.');
  }
  const name = mongoose.connection.name || '';
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run tests against the non-test database "${name}". Use: npm test`
    );
  }
}

async function connectTestDB() {
  if (mongoose.connection.readyState === 1) {
    assertTestDatabase();
    return;
  }
  await mongoose.connect(resolveTestUri());
}

async function clearDatabase() {
  assertTestDatabase();
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

async function closeTestDB() {
  await mongoose.connection.close();
}

function makeApp() {
  return createApp();
}

async function createUser({ name = 'Test User', email, password = 'Password@123', role = 'student', isActive = true } = {}) {
  return User.create({ name, email: email || `${role}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@test.dev`, password, role, isActive, isEmailVerified: true });
}

async function loginAgent(app, email, password) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.data.user };
}

async function createCategory(name = 'Test Category') {
  return CourseCategory.create({ name: `${name} ${Math.random().toString(36).slice(2, 6)}` });
}

async function createCourse({ category, title = 'Test Course', fee = 1000, isPublished = true, seats = 30 } = {}) {
  const cat = category || (await createCategory());
  return Course.create({
    title: `${title} ${Math.random().toString(36).slice(2, 6)}`,
    category: cat._id,
    description: 'A course created by the automated test suite to verify API behaviour thoroughly.',
    fee,
    isPublished,
    status: isPublished ? 'published' : 'draft',
    seats,
    curriculum: [{ title: 'Module One' }, { title: 'Module Two' }],
  });
}

async function createTrainer() {
  return Trainer.create({ name: `Trainer ${Math.random().toString(36).slice(2, 6)}`, designation: 'Faculty' });
}

async function createBatch({ course, capacity = 2, status = 'upcoming' } = {}) {
  const start = new Date(Date.now() + 7 * 86400000);
  const end = new Date(Date.now() + 60 * 86400000);
  return Batch.create({
    name: `Batch ${Math.random().toString(36).slice(2, 6)}`,
    course: course._id,
    startDate: start,
    endDate: end,
    capacity,
    status,
  });
}

module.exports = {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
  loginAgent,
  createCategory,
  createCourse,
  createTrainer,
  createBatch,
  request,
};

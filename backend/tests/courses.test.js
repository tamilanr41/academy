const {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
  loginAgent,
  createCourse,
  createCategory,
  request,
} = require('./helpers');

const app = makeApp();

beforeAll(async () => {
  await connectTestDB();
});
afterEach(async () => {
  await clearDatabase();
});
afterAll(async () => {
  await closeTestDB();
});

async function adminAgent() {
  const admin = await createUser({ email: `admin.${Date.now()}@test.dev`, password: 'Password@123', role: 'super_admin' });
  const { agent } = await loginAgent(app, admin.email, 'Password@123');
  return { agent, admin };
}

describe('Courses API', () => {
  test('public listing only returns published courses with pagination meta', async () => {
    await createCourse({ title: 'Published', isPublished: true });
    await createCourse({ title: 'Draft', isPublished: false });

    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1 });
    expect(res.body.data[0].title).toContain('Published');
  });

  test('filters by level, mode and fee range', async () => {
    const cheap = await createCourse({ title: 'Cheap Online', isPublished: true, fee: 500 });
    cheap.mode = 'online';
    cheap.level = 'beginner';
    await cheap.save();

    const advanced = await createCourse({ title: 'Advanced Offline', isPublished: true, fee: 9000 });
    advanced.level = 'advanced';
    advanced.mode = 'offline';
    await advanced.save();

    const byLevel = await request(app).get('/api/courses?level=advanced');
    expect(byLevel.body.data).toHaveLength(1);

    const byFee = await request(app).get('/api/courses?maxFee=1000');
    expect(byFee.body.data).toHaveLength(1);

    const byMode = await request(app).get('/api/courses?mode=offline');
    expect(byMode.body.data).toHaveLength(1);
  });

  test('course detail is available by slug and increments views', async () => {
    const course = await createCourse({ title: 'Slug Course', isPublished: true });
    const first = await request(app).get(`/api/courses/${course.slug}`);
    expect(first.status).toBe(200);
    expect(first.body.data.course.slug).toBe(course.slug);

    await new Promise((r) => setTimeout(r, 100));
    const Course = require('../src/models/Course');
    const updated = await Course.findById(course._id);
    expect(updated.views).toBeGreaterThanOrEqual(1);
  });

  test('unknown slug returns 404', async () => {
    const res = await request(app).get('/api/courses/does-not-exist-xyz');
    expect(res.status).toBe(404);
  });

  test('admin CRUD: create, update, archive, permanent delete', async () => {
    const { agent } = await adminAgent();
    const category = await createCategory();

    const create = await agent.post('/api/admin/courses').send({
      title: 'Admin Created Course',
      category: category._id.toString(),
      description: 'Created through the admin API by the automated test suite for CRUD coverage.',
      fee: 2500,
      isPublished: true,
      curriculum: [{ title: 'Intro' }],
    });
    expect(create.status).toBe(201);
    expect(create.body.data.slug).toBeTruthy();

    const id = create.body.data._id;

    const update = await agent.patch(`/api/admin/courses/${id}`).send({ fee: 3000, title: 'Admin Updated Course' });
    expect(update.status).toBe(200);
    expect(update.body.data.fee).toBe(3000);
    // partial update must not wipe unrelated nested fields
    expect(update.body.data.image).toMatchObject({ url: '' });
    expect(update.body.data.curriculum).toHaveLength(1);

    const archive = await agent.delete(`/api/admin/courses/${id}`);
    expect(archive.status).toBe(200);
    expect(archive.body.data.status).toBe('archived');

    const remove = await agent.delete(`/api/admin/courses/${id}/permanent`);
    expect(remove.status).toBe(200);
  });

  test('course validation rejects missing required fields', async () => {
    const { agent } = await adminAgent();
    const res = await agent.post('/api/admin/courses').send({ title: 'x', fee: -5, description: 'short' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'category' || e.field === 'title' || e.field === 'description' || e.field === 'fee')).toBe(true);
  });

  test('reviews are stored as pending moderation', async () => {
    const course = await createCourse({ title: 'Reviewed Course', isPublished: true });
    const res = await request(app).post(`/api/courses/${course._id}/reviews`).send({ name: 'A Learner', rating: 5, comment: 'Really practical sessions and great mentors.' });
    expect(res.status).toBe(201);

    const Course = require('../src/models/Course');
    const stored = await Course.findById(course._id);
    expect(stored.reviews).toHaveLength(1);
    expect(stored.reviews[0].isApproved).toBe(false);
  });

  test('categories listing includes published course counts', async () => {
    const category = await createCategory('Counted');
    await createCourse({ category, title: 'Counted Course', isPublished: true });

    const res = await request(app).get('/api/categories');
    const found = res.body.data.find((c) => c.slug === category.slug);
    expect(found.courseCount).toBe(1);
  });
});

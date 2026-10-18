const {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
  loginAgent,
  createCourse,
  createBatch,
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

async function staffAgent(role = 'admin') {
  const user = await createUser({ role, email: `${role}.${Date.now()}@test.dev`, password: 'Password@123' });
  const { agent } = await loginAgent(app, user.email, 'Password@123');
  return { agent, user };
}

const validApplication = (courseId, overrides = {}) => ({
  name: 'Applicant One',
  email: `applicant.${Date.now()}@test.dev`,
  phone: '9876543210',
  course: courseId.toString(),
  mode: 'offline',
  message: 'I would like to join the upcoming batch.',
  ...overrides,
});

describe('Applications API', () => {
  test('accepts a valid application with a generated reference number', async () => {
    const course = await createCourse({ isPublished: true });
    const res = await request(app).post('/api/applications').send(validApplication(course._id));

    expect(res.status).toBe(201);
    expect(res.body.data.application.referenceNumber).toMatch(/^APP-\d{4}-[A-Z0-9]{5}$/);
    expect(res.body.data.application.status).toBe('new');
  });

  test('validates required fields server-side', async () => {
    const res = await request(app).post('/api/applications').send({ name: 'A', email: 'not-an-email', phone: '1' });
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('rejects duplicate applications within 24 hours', async () => {
    const course = await createCourse({ isPublished: true });
    const payload = validApplication(course._id, { email: 'dupe@test.dev' });

    expect((await request(app).post('/api/applications').send(payload)).status).toBe(201);
    const second = await request(app).post('/api/applications').send(payload);
    expect(second.status).toBe(409);
  });

  test('rejects applications for unpublished courses', async () => {
    const course = await createCourse({ isPublished: false });
    const res = await request(app).post('/api/applications').send(validApplication(course._id));
    expect(res.status).toBe(400);
  });

  test('honeypot submissions are rejected', async () => {
    const course = await createCourse({ isPublished: true });
    const res = await request(app).post('/api/applications').send(validApplication(course._id, { honeypot: 'bot-filled-this' }));
    expect(res.status).toBe(422);
  });

  test('enforces batch capacity', async () => {
    const course = await createCourse({ isPublished: true });
    const batch = await createBatch({ course, capacity: 1 });

    const first = await request(app).post('/api/applications').send(validApplication(course._id, { batch: batch._id.toString(), email: 'first@test.dev' }));
    expect(first.status).toBe(201);

    const Batch = require('../src/models/Batch');
    await Batch.updateOne({ _id: batch._id }, { $set: { enrolledCount: 1 } });

    const second = await request(app).post('/api/applications').send(validApplication(course._id, { batch: batch._id.toString(), email: 'second@test.dev' }));
    expect(second.status).toBe(409);
  });

  test('admin can list, filter and update application status with an audit trail', async () => {
    const course = await createCourse({ isPublished: true });
    await request(app).post('/api/applications').send(validApplication(course._id, { email: 'track@test.dev' }));

    const { agent } = await staffAgent('admin');
    const list = await agent.get('/api/admin/applications?status=new&search=track@test.dev');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const id = list.body.data[0]._id;
    const updated = await agent.patch(`/api/admin/applications/${id}/status`).send({ status: 'under_review', note: 'Called the applicant' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe('under_review');
    expect(updated.body.data.statusHistory.at(-1).note).toBe('Called the applicant');

    const note = await agent.post(`/api/admin/applications/${id}/notes`).send({ note: 'Follow up on Monday' });
    expect(note.status).toBe(200);
    expect(note.body.data.staffNotes).toHaveLength(1);
  });

  test('CSV export streams an attachment', async () => {
    const course = await createCourse({ isPublished: true });
    await request(app).post('/api/applications').send(validApplication(course._id, { email: 'csv@test.dev' }));

    const { agent } = await staffAgent('admin');
    const res = await agent.get('/api/admin/applications?export=csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Reference');
    expect(res.text).toContain('csv@test.dev');
  });

  test('students only see their own applications', async () => {
    const course = await createCourse({ isPublished: true });
    await request(app).post('/api/applications').send(validApplication(course._id, { email: 'student.a@test.dev' }));
    await request(app).post('/api/applications').send(validApplication(course._id, { email: 'student.b@test.dev' }));

    const studentA = await createUser({ email: 'student.a@test.dev', role: 'student', password: 'Password@123' });
    const { agent } = await loginAgent(app, studentA.email, 'Password@123');

    const res = await agent.get('/api/student/applications/my');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe('student.a@test.dev');
  });
});

describe('Enquiries API', () => {
  test('public submission is stored and visible to staff', async () => {
    const res = await request(app).post('/api/enquiries').send({
      name: 'Enquirer',
      email: 'enquiry@test.dev',
      subject: 'Batch timings',
      message: 'Could you share details about the upcoming weekend batch timings?',
      type: 'course',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('new');

    const { agent } = await staffAgent('staff');
    const list = await agent.get('/api/admin/enquiries?search=enquiry@test.dev');
    expect(list.body.data).toHaveLength(1);

    const id = list.body.data[0]._id;
    const update = await agent.patch(`/api/admin/enquiries/${id}`).send({ status: 'resolved', note: 'Shared timings over email' });
    expect(update.status).toBe(200);
    expect(update.body.data.status).toBe('resolved');
    expect(update.body.data.resolvedAt).toBeTruthy();
  });
});

describe('Batch enrolment capacity', () => {
  test('admin enrolment respects batch capacity', async () => {
    const course = await createCourse({ isPublished: true });
    const batch = await createBatch({ course, capacity: 1 });
    const studentA = await createUser({ email: 'a@test.dev', role: 'student' });
    const studentB = await createUser({ email: 'b@test.dev', role: 'student' });

    const { agent } = await staffAgent('admin');

    const first = await agent.post('/api/admin/enrollments').send({ studentId: studentA._id.toString(), course: course._id.toString(), batch: batch._id.toString() });
    expect(first.status).toBe(201);

    const second = await agent.post('/api/admin/enrollments').send({ studentId: studentB._id.toString(), course: course._id.toString(), batch: batch._id.toString() });
    expect(second.status).toBe(409);

    const Batch = require('../src/models/Batch');
    const stored = await Batch.findById(batch._id);
    expect(stored.enrolledCount).toBe(1);
  });

  test('duplicate enrolment in the same batch is rejected', async () => {
    const course = await createCourse({ isPublished: true });
    const batch = await createBatch({ course, capacity: 5 });
    const student = await createUser({ email: 'dupe.enrol@test.dev', role: 'student' });
    const { agent } = await staffAgent('admin');

    const payload = { studentId: student._id.toString(), course: course._id.toString(), batch: batch._id.toString() };
    expect((await agent.post('/api/admin/enrollments').send(payload)).status).toBe(201);
    expect((await agent.post('/api/admin/enrollments').send(payload)).status).toBe(409);
  });
});

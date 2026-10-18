const {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
  loginAgent,
  createCourse,
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

async function agentFor(role) {
  const user = await createUser({ role, email: `${role}.${Math.random().toString(36).slice(2, 8)}@test.dev`, password: 'Password@123' });
  const { agent } = await loginAgent(app, user.email, 'Password@123');
  return { agent, user };
}

describe('Authorization (RBAC)', () => {
  test('anonymous users cannot reach admin endpoints', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });

  test('students cannot reach admin endpoints', async () => {
    const { agent } = await agentFor('student');
    const stats = await agent.get('/api/admin/dashboard/stats');
    expect(stats.status).toBe(403);
    const students = await agent.get('/api/admin/students');
    expect(students.status).toBe(403);
  });

  test('staff can manage applications but not site settings', async () => {
    const { agent } = await agentFor('staff');
    expect((await agent.get('/api/admin/applications')).status).toBe(200);
    expect((await agent.get('/api/admin/settings')).status).toBe(200);

    const patch = await agent.patch('/api/admin/settings').send({ academyName: 'Hacked Academy' });
    expect(patch.status).toBe(403);
  });

  test('only super admin can create administrative accounts', async () => {
    const { agent: adminAgent } = await agentFor('admin');
    const attempt = await adminAgent.post('/api/admin/users').send({
      name: 'Sneaky Admin',
      email: 'sneaky@test.dev',
      password: 'Password@123',
      role: 'admin',
    });
    expect(attempt.status).toBe(403);

    const staffAttempt = await adminAgent.post('/api/admin/users').send({
      name: 'Fine Staff',
      email: 'fine.staff@test.dev',
      password: 'Password@123',
      role: 'staff',
    });
    expect(staffAttempt.status).toBe(200);

    const { agent: superAgent } = await agentFor('super_admin');
    const ok = await superAgent.post('/api/admin/users').send({
      name: 'Real Admin',
      email: 'real.admin@test.dev',
      password: 'Password@123',
      role: 'admin',
    });
    expect(ok.status).toBe(200);
  });

  test('the last active super admin cannot be deactivated', async () => {
    const { agent, user } = await agentFor('super_admin');
    const res = await agent.patch(`/api/admin/users/${user._id}`).send({ isActive: false });
    expect(res.status).toBe(400);
  });

  test('dashboard exposes only aggregated, real data', async () => {
    const course = await createCourse({ isPublished: true });
    await createUser({ role: 'student', email: 's1@test.dev' });
    await createUser({ role: 'student', email: 's2@test.dev' });
    const applied = await request(app).post('/api/applications').send({ name: 'Applicant', email: 'x@test.dev', phone: '9876543210', course: course._id.toString(), mode: 'offline', message: 'Testing dashboard counters.' });
    expect(applied.status).toBe(201);

    const { agent } = await agentFor('super_admin');
    const res = await agent.get('/api/admin/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalStudents).toBe(2);
    expect(res.body.data.activeCourses).toBe(1);
    expect(res.body.data.totalApplications).toBe(1);
    expect(res.body.data.totalStudents).not.toBe(1234); // no hardcoded demo numbers
  });

  test('audit log records administrative actions', async () => {
    const course = await createCourse({ isPublished: true });
    const { agent } = await agentFor('super_admin');

    await agent.delete(`/api/admin/courses/${course._id}`);
    const logs = await agent.get('/api/admin/audit-logs?action=course.archive');
    expect(logs.status).toBe(200);
    expect(logs.body.data.length).toBeGreaterThanOrEqual(1);
    expect(logs.body.data[0].actorEmail).toBeTruthy();
  });

  test('upload endpoints require an image file', async () => {
    const { agent } = await agentFor('admin');
    const res = await agent.post('/api/admin/uploads');
    expect(res.status).toBe(400);
  });

  test('public settings never expose secrets', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/api[_-]?secret/i);
    expect(body).not.toMatch(/jwt/i);
    expect(body).not.toMatch(/smtp_pass/i);
  });
});

const {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
  loginAgent,
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

async function studentAgent(extra = {}) {
  const user = await createUser({
    role: 'student',
    email: `student.${Math.random().toString(36).slice(2, 8)}@test.dev`,
    password: 'Password@123',
    ...extra,
  });
  const { agent } = await loginAgent(app, user.email, 'Password@123');
  return { agent, user };
}

describe('Student profile', () => {
  test('a fresh student profile starts empty and incomplete', async () => {
    const { agent } = await studentAgent({ name: 'Fresh Student' });

    const res = await agent.get('/api/student/profile');
    expect(res.status).toBe(200);
    expect(res.body.data.isComplete).toBe(false);
    expect(res.body.data.missing).toContain('dateOfBirth');
    expect(res.body.data.missing).toContain('guardian.phone');
  });

  test('saving every required field marks the profile complete', async () => {
    const { agent } = await studentAgent({ name: 'Complete Student' });

    const payload = {
      name: 'Complete Student',
      phone: '+91 98765 43210',
      dateOfBirth: '2004-05-12',
      gender: 'female',
      qualification: 'B.Sc Computer Science',
      college: 'Madras University',
      yearOfStudy: '3',
      address: { line1: '12 MG Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
      guardian: { name: 'Ravi Kumar', phone: '+91 98765 11111', relation: 'Father' },
      source: 'friend',
      preferredMode: 'online',
    };

    const res = await agent.patch('/api/student/profile').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.data.isComplete).toBe(true);
    expect(res.body.data.missing).toEqual([]);
    expect(res.body.data.profile.completedAt).toBeTruthy();
    expect(res.body.data.profile.address.city).toBe('Chennai');
    expect(res.body.data.profile.guardian.relation).toBe('Father');
    expect(res.body.data.user.phone).toBe('+91 98765 43210');

    const again = await agent.get('/api/student/profile');
    expect(again.body.data.isComplete).toBe(true);
  });

  test('unknown fields are ignored and invalid values are rejected', async () => {
    const { agent } = await studentAgent();

    const bad = await agent.patch('/api/student/profile').send({ dateOfBirth: 'not-a-date' });
    expect(bad.status).toBe(422);

    const scrubbed = await agent.patch('/api/student/profile').send({ occupation: 'Student', role: 'super_admin', isActive: false });
    expect(scrubbed.status).toBe(200);
    expect(scrubbed.body.data.profile.occupation).toBe('Student');
    expect(scrubbed.body.data.user.role).toBe('student');
    expect(scrubbed.body.data.user.isActive).toBe(true);
  });

  test('non-students cannot use the student profile endpoints', async () => {
    const user = await createUser({ role: 'admin', email: `admin.${Math.random().toString(36).slice(2, 8)}@test.dev`, password: 'Password@123' });
    const { agent } = await loginAgent(app, user.email, 'Password@123');

    const res = await agent.get('/api/student/profile');
    expect(res.status).toBe(403);
  });

  test('admin student list exposes completeness and profile details', async () => {
    const { agent: student } = await studentAgent({ name: 'Listed Student' });
    await student.patch('/api/student/profile').send({ qualification: 'B.Com', address: { city: 'Coimbatore' } });

    const admin = await createUser({ role: 'admin', email: `admin.${Math.random().toString(36).slice(2, 8)}@test.dev`, password: 'Password@123' });
    const { agent: adminAgent } = await loginAgent(app, admin.email, 'Password@123');

    const res = await adminAgent.get('/api/admin/students');
    expect(res.status).toBe(200);
    const listed = res.body.data.find((s) => s.name === 'Listed Student');
    expect(listed).toBeTruthy();
    expect(listed.profileComplete).toBe(false);
    expect(listed.profile.address.city).toBe('Coimbatore');
    expect(listed.profileMissing).toContain('guardian.name');
  });
});

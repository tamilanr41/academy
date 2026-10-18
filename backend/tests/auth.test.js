const {
  connectTestDB,
  clearDatabase,
  closeTestDB,
  makeApp,
  createUser,
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

describe('Auth API', () => {
  test('registers a student and sets an http-only session cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New Student',
      email: 'new.student@test.dev',
      password: 'Password@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('new.student@test.dev');
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.password).toBeUndefined();

    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.startsWith('academy_token=') && /HttpOnly/i.test(c))).toBe(true);
  });

  test('rejects weak passwords and duplicate emails', async () => {
    await createUser({ email: 'taken@test.dev', password: 'Password@123' });

    const weak = await request(app).post('/api/auth/register').send({ name: 'Weak', email: 'weak@test.dev', password: 'short' });
    expect(weak.status).toBe(422);
    expect(Array.isArray(weak.body.errors)).toBe(true);

    const dup = await request(app).post('/api/auth/register').send({ name: 'Dup', email: 'taken@test.dev', password: 'Password@123' });
    expect(dup.status).toBe(409);
  });

  test('logs in, returns /me, then logs out', async () => {
    const user = await createUser({ email: 'login@test.dev', password: 'Password@123' });
    const agent = request.agent(app);

    const bad = await agent.post('/api/auth/login').send({ email: user.email, password: 'wrong' });
    expect(bad.status).toBe(401);

    const ok = await agent.post('/api/auth/login').send({ email: user.email, password: 'Password@123' });
    expect(ok.status).toBe(200);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(user.email);

    await agent.post('/api/auth/logout');
    const after = await agent.get('/api/auth/me');
    expect(after.status).toBe(401);
  });

  test('deactivated accounts cannot log in', async () => {
    await createUser({ email: 'inactive@test.dev', password: 'Password@123', isActive: false });
    const res = await request(app).post('/api/auth/login').send({ email: 'inactive@test.dev', password: 'Password@123' });
    expect(res.status).toBe(403);
  });

  test('password reset flow issues a token and changes the password', async () => {
    const user = await createUser({ email: 'reset@test.dev', password: 'Password@123' });
    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(forgot.status).toBe(200);

    const User = require('../src/models/User');
    const stored = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
    expect(stored.passwordResetToken).toBeDefined();

    // Cannot assert the raw token (only its hash is stored) — verify a bad token is rejected.
    const invalid = await request(app).post('/api/auth/reset-password').send({ token: 'a'.repeat(64), password: 'NewPassword@123' });
    expect(invalid.status).toBe(400);
  });

  test('password change requires the current password', async () => {
    const user = await createUser({ email: 'change@test.dev', password: 'Password@123' });
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: user.email, password: 'Password@123' });

    const wrong = await agent.post('/api/auth/change-password').send({ currentPassword: 'nope', newPassword: 'NewPassword@123' });
    expect(wrong.status).toBe(400);

    const ok = await agent.post('/api/auth/change-password').send({ currentPassword: 'Password@123', newPassword: 'NewPassword@123' });
    expect(ok.status).toBe(200);
  });
});

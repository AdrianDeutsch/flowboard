import request from 'supertest';
import { createApp } from '../src/app';
import { prismaMock } from './helpers/prismaMock';
import { authCookie, buildUser, PLAIN_PASSWORD } from './helpers/fixtures';
import { AUTH_COOKIE_NAME } from '../src/modules/auth/auth.cookies';

const app = createApp();

describe('POST /api/auth/register', () => {
  const validBody = { email: 'jane@example.com', password: 'supersecret1', name: 'Jane Doe' };

  it('creates a user, sets an httpOnly cookie and returns the public profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(buildUser());

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 'user-1', email: 'jane@example.com', name: 'Jane Doe' });
    // The password hash must never leak to the client.
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookie = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(cookie).toContain('HttpOnly');
  });

  it('stores a bcrypt hash, never the plain password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(buildUser());

    await request(app).post('/api/auth/register').send(validBody);

    const createArgs = prismaMock.user.create.mock.calls[0]?.[0];
    expect(createArgs?.data.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(createArgs?.data).not.toHaveProperty('password');
  });

  it('returns 409 when the email is already registered', async () => {
    prismaMock.user.findUnique.mockResolvedValue(buildUser());

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(409);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it.each([
    ['invalid email', { ...validBody, email: 'not-an-email' }],
    ['short password', { ...validBody, password: 'short' }],
    ['missing name', { ...validBody, name: '' }],
  ])('returns 400 with validation details for %s', async (_label, body) => {
    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  it('returns the user and sets the auth cookie for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(buildUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: PLAIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.headers['set-cookie']?.[0]).toContain('HttpOnly');
  });

  it('returns 401 for a wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(buildUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('returns the same 401 for an unknown email (no account enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: PLAIN_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without a session cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${AUTH_COOKIE_NAME}=not-a-real-jwt`);
    expect(res.status).toBe(401);
  });

  it('returns the profile for a valid session', async () => {
    prismaMock.user.findUnique.mockResolvedValue(buildUser());

    const res = await request(app).get('/api/auth/me').set('Cookie', authCookie());

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'user-1', email: 'jane@example.com', name: 'Jane Doe' });
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the auth cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(204);
    expect(res.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=;`);
  });
});

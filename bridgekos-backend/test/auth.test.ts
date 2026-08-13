import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { cleanDatabase } from './helpers.js';
import { hashToken } from '../src/utils/token.js';

const app = createApp();

const uniqueEmail = () => `user_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;

interface RegisterOverrides {
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'OWNER' | 'TENANT';
}

async function registerUser(overrides: RegisterOverrides = {}) {
  const payload = {
    email: uniqueEmail(),
    password: 'Password123',
    fullName: 'Test User',
    role: 'TENANT' as const,
    ...overrides,
  };
  const res = await request(app).post('/api/v1/auth/register').send(payload);
  return { res, payload };
}

beforeEach(async () => {
  await cleanDatabase();
});

describe('POST /api/v1/auth/register', () => {
  it('creates a tenant account and returns tokens', async () => {
    const { res, payload } = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(payload.email);
    expect(res.body.data.user.role).toBe('TENANT');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    expect(res.body.data.tokens.refreshToken).toBeTruthy();
  });

  it('creates an owner profile when role is OWNER', async () => {
    const { res } = await registerUser({ role: 'OWNER' });

    expect(res.status).toBe(201);
    const owner = await prisma.owner.findUnique({
      where: { userId: res.body.data.user.id },
    });
    expect(owner).not.toBeNull();
  });

  it('rejects a duplicate email with 409', async () => {
    const { payload } = await registerUser();
    const second = await request(app).post('/api/v1/auth/register').send(payload);

    expect(second.status).toBe(409);
    expect(second.body.success).toBe(false);
    expect(second.body.code).toBe('CONFLICT');
  });

  it('rejects a weak password with 422 and field errors', async () => {
    const { res } = await registerUser({ password: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: payload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeTruthy();
  });

  it('rejects a wrong password with 401', async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: 'WrongPass123' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects login for unknown email without leaking existence', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail(), password: 'WrongPass123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns the authenticated user profile', async () => {
    const { res } = await registerUser();
    const { accessToken } = res.body.data.tokens;

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.data.auth.email).toBe(res.body.data.user.email);
    expect(me.body.data.profile.fullName).toBe('Test User');
  });

  it('rejects requests without a token', async () => {
    const me = await request(app).get('/api/v1/auth/me');

    expect(me.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');

    expect(me.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('rotates the refresh token', async () => {
    const { res } = await registerUser();
    const { refreshToken } = res.body.data.tokens;

    const first = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

    expect(first.status).toBe(200);
    expect(first.body.data.refreshToken).toBeTruthy();
    expect(first.body.data.accessToken).toBeTruthy();

    // Replaying the old token is detected and invalidates the session.
    const replay = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(replay.status).toBe(401);
  });

  it('rejects a garbage refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'garbage-token' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('revokes the session so the refresh token stops working', async () => {
    const { res } = await registerUser();
    const { accessToken, refreshToken } = res.body.data.tokens;

    const out = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(out.status).toBe(200);

    const refreshAfter = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(refreshAfter.status).toBe(401);
  });
});

describe('POST /api/v1/auth/verify-email', () => {
  it('verifies a valid email token', async () => {
    const { res } = await registerUser();
    const userId = res.body.data.user.id;

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashToken('known-verify-token'),
        type: 'EMAIL',
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    const verify = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'known-verify-token' });

    expect(verify.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.isEmailVerified).toBe(true);
  });

  it('rejects an invalid email token', async () => {
    const verify = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'unknown-token' });

    expect(verify.status).toBe(400);
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  it('resets the password and invalidates old sessions', async () => {
    const { res, payload } = await registerUser();
    const userId = res.body.data.user.id;

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashToken('known-reset-token'),
        type: 'FORGOT_PASSWORD',
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    const reset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'known-reset-token', newPassword: 'NewPassword123' });
    expect(reset.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: payload.password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: 'NewPassword123' });
    expect(newLogin.status).toBe(200);
  });
});

describe('POST /api/v1/auth/change-password', () => {
  it('changes the password when the current password is correct', async () => {
    const { res, payload } = await registerUser();
    const { accessToken } = res.body.data.tokens;

    const change = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: payload.password, newPassword: 'ChangedPass123' });
    expect(change.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: payload.password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: payload.email, password: 'ChangedPass123' });
    expect(newLogin.status).toBe(200);
  });

  it('rejects a wrong current password', async () => {
    const { res } = await registerUser();
    const { accessToken } = res.body.data.tokens;

    const change = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongPass123', newPassword: 'ChangedPass123' });

    expect(change.status).toBe(400);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('always responds 200 and does not leak account existence', async () => {
    const known = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: uniqueEmail() });

    expect(known.status).toBe(200);
    expect(known.body.success).toBe(true);
  });
});

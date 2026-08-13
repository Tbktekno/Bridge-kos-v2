import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('App smoke tests', () => {
  const app = createApp();

  it('returns healthy status on GET /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Health check passed',
      data: {
        database: 'up',
      },
    });
  });

  it('returns consistent error envelope for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Route not found',
    });
  });
});

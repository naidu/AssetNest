process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');

describe('API health endpoint', () => {
  it('returns healthy status payload', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });
});


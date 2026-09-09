import request from 'supertest';
import app from '../../app.js'; // Adjust path if your main Express app export is in src/server.js or src/app.js

describe('GET /api/health Endpoint', () => {
  it('should return 200 OK with server status and connected state', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('database');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
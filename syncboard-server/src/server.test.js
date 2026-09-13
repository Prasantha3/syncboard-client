import request from 'supertest';

import app from './server.js';

import { users } from './controllers/authController.js';

describe('SyncBoard Server API', () => {
  beforeEach(() => {
    users.length = 0;
  });

  test('GET /api/health returns server health status', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);

    expect(response.body.status).toBe('OK');

    expect(response.body.message).toBe(
      'SyncBoard Server active'
    );

    expect(response.body.timestamp).toBeDefined();
  });

  test('POST /api/auth/register rejects missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      'Validation Error'
    );

    expect(response.body.message).toBe(
      'All fields are required'
    );
  });

  test('POST /api/auth/register and POST /api/auth/login work correctly', async () => {
    const email = 'testuser@example.com';
    const password = 'Password123!';

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'Test User',
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    expect(
      registerResponse.body.message
    ).toBe('User registered successfully');

    expect(
      registerResponse.body.user.email
    ).toBe(email);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    expect(
      loginResponse.body.message
    ).toBe('Login successful');

    expect(loginResponse.body.token).toBeDefined();

    expect(
      loginResponse.body.user.email
    ).toBe(email);
  });
});
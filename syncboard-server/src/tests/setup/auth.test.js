import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app.js';
import { User } from '../../models/User.js';
import { connectTestDb, clearTestDb, closeTestDb } from './db.js';

describe('POST /api/auth/login', () => {

  beforeAll(async () => {
    await connectTestDb();
  }, 180000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
    
    const hashedPassword = await bcrypt.hash('password1', 10);
    await User.create({
      name: 'Test User',
      email: 'user1@nsbm.lk',
      passwordHash: hashedPassword
    });
  });

  // Test Case 1: Invalid Email Format
  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password1' });

    // Expects either 400 (validation check) or 401 (not found check)
    expect([400, 401]).toContain(res.status);
    expect(res.body).toBeDefined();
  });

  // Test Case 2: Missing Credentials
  it('returns 400 when credentials are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@nsbm.lk' });

    expect(res.status).toBe(400);
    // Asserts that an error message key exists (code, error, or message)
    expect(res.body.code || res.body.error || res.body.message).toBeDefined();
  });

  // Test Case 3: Unauthorized Access
  it('returns 401 for unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nsbm.lk', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.code || res.body.error || res.body.message).toBeDefined();
  });

  // Test Case 4: Valid Credentials
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@nsbm.lk', password: 'password1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

});
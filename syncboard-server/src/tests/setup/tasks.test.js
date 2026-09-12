import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../app.js';
import { Task } from '../../models/Task.js';
import { connectTestDb, clearTestDb, closeTestDb } from './db.js';

describe('Task API Integration Suite', () => {

  const dummyBoardId = new mongoose.Types.ObjectId().toString();

  // Helper for generating valid authorization headers
  const getAuthHeader = (userId = '507f1f77bcf86cd799439011') => {
    const token = jwt.sign(
      { id: userId, email: 'peiris@nsbm.lk' },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '1h' }
    );
    return `Bearer ${token}`;
  };

  beforeAll(async () => {
    await connectTestDb();
  }, 180000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  // 1. Auth Guard Testing (Using POST /api/tasks without token)
  describe('Auth Guard Testing', () => {
    it('returns 401 NO_TOKEN when no authorization header is attached', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthenticated Task Creation' });

      // Expects HTTP 401 or 403 status code
      expect([401, 403]).toContain(res.status);
      expect(res.body.code || res.body.error || res.body.message).toBeDefined();
    });
  });

  // 2. Task Creation & Persistence Tests
  describe('POST /api/tasks (Creation & Versioning)', () => {
    it('creates document in memory and defaults version to 0', async () => {
      const taskData = {
        title: 'Peiris Integration Task',
        description: 'Testing task persistence and versioning',
        boardId: dummyBoardId
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', getAuthHeader())
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(taskData.title);
      expect(res.body.version !== undefined ? res.body.version : res.body.__v).toBe(0);
    });
  });

  // 3. 409 Concurrency Conflict Test
  describe('PATCH /api/tasks/:id (Optimistic Concurrency)', () => {
    it('returns 409 Conflict payload when sending a stale baseVersion', async () => {
      const initialTask = await Task.create({
        title: 'Initial Title',
        description: 'Concurrency Test',
        boardId: dummyBoardId,
        version: 1
      });

      const res = await request(app)
        .patch(`/api/tasks/${initialTask._id}`)
        .set('Authorization', getAuthHeader())
        .send({
          title: 'Stale Update Attempt',
          baseVersion: 0
        });

      expect(res.status).toBe(409);
      expect(res.body.error || res.body.message).toBeDefined();

      const payload = res.body.payload || res.body;
      const currentVersion = payload.current ? payload.current.version : payload.currentVersion;
      const staleVersion = payload.yourVersion !== undefined ? payload.yourVersion : payload.staleVersion;

      expect(currentVersion).toBe(1);
      expect(staleVersion).toBe(0);
    });
  });

});
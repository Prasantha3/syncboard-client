import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getOverdueTaskStats,
} from '../controllers/taskController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// --- PUBLIC READ ENDPOINTS ---

// GET /api/tasks - Fetch all tasks
router.get('/', getTasks);

// GET /api/tasks/stats/overdue - Aggregation stats per assignee
// MUST be registered BEFORE '/:id' to avoid route matching conflicts
router.get('/stats/overdue', getOverdueTaskStats);

// GET /api/tasks/:id - Fetch single task by ID
router.get('/:id', validateObjectId('id'), getTaskById);

// --- PROTECTED MUTATION ENDPOINTS ---

// POST /api/tasks - Create new task
router.post('/', requireAuth, createTask);

// PATCH /api/tasks/:id - Update task (supports optimistic concurrency)
router.patch('/:id', requireAuth, validateObjectId('id'), updateTask);

// DELETE /api/tasks/:id - Delete task from MongoDB
router.delete('/:id', requireAuth, validateObjectId('id'), deleteTask);

export default router;
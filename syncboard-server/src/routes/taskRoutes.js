import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getOverdueTaskStats,
} from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// Public read endpoints
router.get('/', getTasks);

// Step 2 (K G K Jayawardhana): Aggregation route MUST be registered BEFORE '/:id'
// to prevent express from treating 'stats' as a task ID parameter
router.get('/stats/overdue', getOverdueTaskStats);

router.get('/:id', validateObjectId('id'), getTaskById);

// Re-verified auth guards — protected mutation endpoints (JWT Bearer token required)
router.post('/', verifyToken, createTask);
router.patch('/:id', verifyToken, validateObjectId('id'), updateTask);
router.delete('/:id', verifyToken, validateObjectId('id'), deleteTask);

export default router;
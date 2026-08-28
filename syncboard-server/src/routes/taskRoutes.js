import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public read endpoints
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Protected mutation endpoints (requires valid JWT Bearer token)
router.post('/', verifyToken, createTask);
router.patch('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

export default router;
import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// Public read endpoints
router.get('/', getTasks);
router.get('/:id', validateObjectId('id'), getTaskById);

//  Re-verified auth guards — protected mutation endpoints (JWT Bearer token required)
router.post('/', verifyToken, createTask);
router.patch('/:id', verifyToken, validateObjectId('id'), updateTask);
router.delete('/:id', verifyToken, validateObjectId('id'), deleteTask);

export default router;
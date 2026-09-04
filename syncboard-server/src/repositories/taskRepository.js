import { Task } from '../models/Task.js';

export async function findTaskById(id) {
  return await Task.findById(id);
}

export async function findTasksByBoardId(boardId, status = null) {
  const query = { boardId };
  if (status) query.status = status;

  return await Task.find(query).sort({ position: 1 });
}

export async function findTasksByAssignee(assigneeId, status = null) {
  const query = { assigneeId };
  if (status) query.status = status;

  return await Task.find(query).sort({ dueDate: 1 });
}

export async function findOverdueTasks(boardId) {
  return await Task.find({
    boardId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
  }).sort({ dueDate: 1 });
}

export async function createTask(taskData) {
  return await Task.create(taskData);
}

export async function updateTask(id, updates) {
  return await Task.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

export async function deleteTask(id) {
  return await Task.findByIdAndDelete(id);
}
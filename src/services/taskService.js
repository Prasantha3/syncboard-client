import { Task } from '../models/Task.js';

export async function updateTask(id, changes, baseVersion, userId) {
  // Single atomic read-and-write operation matching exact version
  const updatedTask = await Task.findOneAndUpdate(
    { _id: id, version: baseVersion },
    { $set: changes, $inc: { version: 1 } },
    { new: true, runValidators: true }
  );

  // If no document matched, a conflict occurred or task doesn't exist
  if (!updatedTask) {
    const currentTask = await Task.findById(id).lean();

    if (!currentTask) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    // Throw 409 Conflict with both current server state and client stale version
    const conflictError = new Error('Task was modified by another user');
    conflictError.status = 409;
    conflictError.payload = {
      current: currentTask,
      yourVersion: baseVersion,
    };
    throw conflictError;
  }

  return updatedTask;
}
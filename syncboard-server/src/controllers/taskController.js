import { Task } from '../models/Task.js';

// GET /api/tasks - Returns full array of tasks from MongoDB
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id - Finds task by ID or returns 404
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks - Validates title and persists new task
export const createTask = async (req, res, next) => {
  try {
    const { title, assignee, status, dueDate, boardId } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title is required and must be at least 3 characters long',
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      assignee: assignee || 'Unassigned',
      status: status || 'todo', // Fixed: lowercase 'todo' to match Mongoose schema enum
      boardId: boardId || '65d8a9b2c3e1f40012a3b400', // Captures boardId from body
      dueDate: dueDate || new Date(),
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id - Optimistic concurrency update handling
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { changes, baseVersion, status, title, assignee, dueDate } = req.body;

    // Support both wrapped changes object or direct payload fields
    const updatePayload = changes || {
      ...(title && { title: title.trim() }),
      ...(assignee && { assignee }),
      ...(status && { status }),
      ...(dueDate && { dueDate }),
    };

    if (updatePayload.title && updatePayload.title.trim().length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title must be at least 3 characters long',
      });
    }

    // Atomic version match update
    const filter = { _id: id };
    if (typeof baseVersion === 'number') {
      filter.version = baseVersion;
    }

    const updatedTask = await Task.findOneAndUpdate(
      filter,
      { $set: updatePayload, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );

    // If update failed, check if task exists to report 409 Conflict vs 404 Not Found
    if (!updatedTask) {
      const currentTask = await Task.findById(id);

      if (!currentTask) {
        return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      }

      return res.status(409).json({
        error: 'Conflict',
        message: 'Task was modified by another user',
        payload: {
          current: currentTask,
          yourVersion: baseVersion,
        },
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id - Deletes task from MongoDB
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/stats/overdue - Aggregation Pipeline endpoint
export const getOverdueTaskStats = async (req, res, next) => {
  try {
    const { boardId } = req.query;

    const stats = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: new Date() },
          status: { $ne: 'DONE' },
          ...(boardId ? { boardId } : {}),
        },
      },
      {
        $group: {
          _id: '$assignee',
          overdueCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          assignee: '$_id',
          overdueCount: 1,
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
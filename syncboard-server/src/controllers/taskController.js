import { tasks } from '../data/mockTasks.js';

// GET /api/tasks
export const getTasks = (req, res) => {
  // Make sure every existing task has a version
  tasks.forEach((task) => {
    if (typeof task.version !== 'number') {
      task.version = 1;
    }
  });

  res.status(200).json(tasks);
};

// GET /api/tasks/:id
export const getTaskById = (req, res) => {
  const { id } = req.params;

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found',
    });
  }

  // Make sure the task has a version
  if (typeof task.version !== 'number') {
    task.version = 1;
  }

  res.status(200).json(task);
};

// POST /api/tasks
export const createTask = (req, res) => {
  const {
    title,
    assignee,
    status,
    dueDate,
  } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      error: 'Validation Error',
      message:
        'Title is required and must be at least 3 characters long',
    });
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    assignee: assignee || 'Unassigned',
    status: status || 'Pending',
    dueDate:
      dueDate ||
      new Date().toISOString().split('T')[0],

    // First version of a new task
    version: 1,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
};

// PATCH /api/tasks/:id
// Supports optimistic concurrency using baseVersion
export const updateTask = (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex(
    (t) => t.id === id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found',
    });
  }

  const task = tasks[taskIndex];

  // Make sure old tasks have a version
  if (typeof task.version !== 'number') {
    task.version = 1;
  }

  const {
    title,
    assignee,
    status,
    dueDate,
    baseVersion,
  } = req.body;

  // Validate title
  if (
    title &&
    title.trim().length < 3
  ) {
    return res.status(400).json({
      error: 'Validation Error',
      message:
        'Title must be at least 3 characters long',
    });
  }

  /*
   * OPTIMISTIC CONCURRENCY CHECK
   *
   * The frontend sends the version it originally read.
   *
   * Example:
   *
   * Frontend has version 1
   * Server has version 2
   *
   * 1 !== 2
   * Therefore a conflict exists.
   */
  if (
    typeof baseVersion === 'number' &&
    baseVersion !== task.version
  ) {
    return res.status(409).json({
      error: 'Conflict',
      message:
        'Task was modified by another user',

      payload: {
        // Current version on the server
        current: task,

        // Version the user attempted to update
        yourVersion: baseVersion,
      },
    });
  }

  // Update the task
  const updatedTask = {
    ...task,

    ...(title && {
      title: title.trim(),
    }),

    ...(assignee && {
      assignee,
    }),

    ...(status && {
      status,
    }),

    ...(dueDate && {
      dueDate,
    }),

    // Increase version after successful update
    version: task.version + 1,

    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  res.status(200).json(updatedTask);
};

// DELETE /api/tasks/:id
export const deleteTask = (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex(
    (t) => t.id === id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found',
    });
  }

  tasks.splice(taskIndex, 1);

  res.status(204).send();
};
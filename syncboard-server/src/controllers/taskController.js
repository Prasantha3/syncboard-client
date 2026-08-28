import { tasks } from '../data/mockTasks.js';

// GET /api/tasks - Returns full array of tasks
export const getTasks = (req, res) => {
  res.status(200).json(tasks);
};

// GET /api/tasks/:id - Finds task by ID or returns 404
export const getTaskById = (req, res) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
  }

  res.status(200).json(task);
};

// POST /api/tasks - Validates title (min 3 chars), generates UUID, returns 201
export const createTask = (req, res) => {
  const { title, assignee, status, dueDate } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title is required and must be at least 3 characters long',
    });
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    assignee: assignee || 'Unassigned',
    status: status || 'Pending',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

// PATCH /api/tasks/:id - Updates fields or status of an existing task
export const updateTask = (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
  }

  const { title, assignee, status, dueDate } = req.body;

  if (title && title.trim().length < 3) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title must be at least 3 characters long',
    });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title && { title: title.trim() }),
    ...(assignee && { assignee }),
    ...(status && { status }),
    ...(dueDate && { dueDate }),
  };

  res.status(200).json(tasks[taskIndex]);
};

// DELETE /api/tasks/:id - Filters out task by ID and returns 204
export const deleteTask = (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
};
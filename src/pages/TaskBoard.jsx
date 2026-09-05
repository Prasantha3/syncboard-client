import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '../api/tasks';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form input states
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      const list = Array.isArray(data) ? data : data?.tasks || data?.data || [];
      setTasks(list);
    } catch (err) {
      setTasks([]);
      setError(err.message || 'Failed to connect to SyncBoard server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Send the raw assignee input directly to the API
    const taskPayload = {
      title: title.trim(),
      assignee: assignee.trim(),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'todo',
      boardId: '65d8a9b2c3e1f40012a3b400',
    };

    try {
      const newTask = await createTask(taskPayload);
      const createdItem = newTask?.task || newTask?.data || newTask;
      
      setTasks((prev) => [...prev, createdItem]);
      
      // Reset form fields
      setTitle('');
      setAssignee('');
      setDueDate('');
    } catch (err) {
      alert(`Error adding task: ${err.message}`);
    }
  };

  const handleMove = async (task, newStatus) => {
    const taskId = task.id || task._id;
    try {
      const updated = await updateTaskStatus(taskId, newStatus, task.version || 0);
      const updatedItem = updated?.task || updated?.data || updated;
      
      setTasks((prev) =>
        prev.map((t) => ((t.id || t._id) === taskId ? { ...t, ...updatedItem, status: newStatus } : t))
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== id));
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  const formatDate = (rawDate) => {
    if (!rawDate) return 'No due date';
    const parsed = new Date(rawDate);
    return isNaN(parsed.getTime()) ? rawDate : parsed.toLocaleDateString();
  };

  // Safe and clean resolution order for rendering assignee names
  const getAssigneeName = (t) => {
    if (t.assignee && typeof t.assignee === 'string' && t.assignee.trim() !== '') {
      return t.assignee;
    }
    if (t.assigneeId && typeof t.assigneeId === 'object' && t.assigneeId.name) {
      return t.assigneeId.name;
    }
    if (t.assignedTo) return t.assignedTo;
    return 'Unassigned';
  };

  // Column grouping rules
  const todoTasks = tasks.filter((t) => t.status?.toLowerCase().replace(/\s+/g, '') === 'todo');
  const inProgressTasks = tasks.filter((t) => {
    const s = t.status?.toLowerCase().replace(/\s+/g, '');
    return s === 'inprogress' || s === 'doing';
  });
  const doneTasks = tasks.filter((t) => {
    const s = t.status?.toLowerCase().replace(/\s+/g, '');
    return s === 'done' || s === 'completed';
  });

  return (
    <div className="board-wrapper">
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit" className="btn">
          Add Task
        </button>
      </form>

      {loading && <Spinner />}

      {error && !loading && <ErrorBanner message={error} onRetry={loadTasks} />}

      {!loading && !error && tasks.length === 0 && (
        <EmptyState message="No tasks match current filters or search terms." />
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="board">
          {/* TO DO */}
          <div className="column">
            <h3 className="column-title">TO DO ({todoTasks.length})</h3>
            <div className="column-content">
              {todoTasks.map((t) => (
                <div key={t.id || t._id} className="task-card">
                  <h4 className="task-card-title">{t.title}</h4>
                  <p className="task-card-assignee">👤 {getAssigneeName(t)}</p>
                  <div className="task-card-footer">
                    <span className="task-card-due">📅 {formatDate(t.dueDate || t.date)}</span>
                  </div>
                  <div className="task-card-actions">
                    <button type="button" className="btn" onClick={() => handleMove(t, 'doing')}>
                      Move right →
                    </button>
                    <button type="button" className="btn btn-delete" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="column">
            <h3 className="column-title">IN PROGRESS ({inProgressTasks.length})</h3>
            <div className="column-content">
              {inProgressTasks.map((t) => (
                <div key={t.id || t._id} className="task-card">
                  <h4 className="task-card-title">{t.title}</h4>
                  <p className="task-card-assignee">👤 {getAssigneeName(t)}</p>
                  <div className="task-card-footer">
                    <span className="task-card-due">📅 {formatDate(t.dueDate || t.date)}</span>
                  </div>
                  <div className="task-card-actions">
                    <button type="button" className="btn" onClick={() => handleMove(t, 'todo')}>
                      ← Move left
                    </button>
                    <button type="button" className="btn" onClick={() => handleMove(t, 'done')}>
                      Move right →
                    </button>
                    <button type="button" className="btn btn-delete" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DONE */}
          <div className="column">
            <h3 className="column-title">DONE ({doneTasks.length})</h3>
            <div className="column-content">
              {doneTasks.map((t) => (
                <div key={t.id || t._id} className="task-card">
                  <h4 className="task-card-title">{t.title}</h4>
                  <p className="task-card-assignee">👤 {getAssigneeName(t)}</p>
                  <div className="task-card-footer">
                    <span className="task-card-due">📅 {formatDate(t.dueDate || t.date)}</span>
                  </div>
                  <div className="task-card-actions">
                    <button type="button" className="btn" onClick={() => handleMove(t, 'doing')}>
                      ← Move left
                    </button>
                    <button type="button" className="btn btn-delete" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

  // Step 1: Asynchronous State Updating
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      const list = Array.isArray(data) ? data : data?.tasks || data?.data || [];
      setTasks(list);
    } catch (err) {
      setTasks([]); // Clears task state so ErrorBanner displays without fallback data
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

    try {
      const newTask = await createTask({
        title,
        assignee: assignee || 'Unassigned',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status: 'To Do',
      });
      const createdItem = newTask?.task || newTask?.data || newTask;
      setTasks((prev) => [...prev, createdItem]);
      setTitle('');
      setAssignee('');
      setDueDate('');
    } catch (err) {
      alert(`Error adding task: ${err.message}`);
    }
  };

  const handleMove = async (id, newStatus) => {
    try {
      const updated = await updateTaskStatus(id, newStatus);
      const updatedItem = updated?.task || updated?.data || updated;
      setTasks((prev) =>
        prev.map((t) => ((t.id || t._id) === id ? { ...t, ...updatedItem, status: newStatus } : t))
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

  const todoTasks = tasks.filter((t) => t.status?.toLowerCase().replace(/\s+/g, '') === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status?.toLowerCase().replace(/\s+/g, '') === 'inprogress');
  const doneTasks = tasks.filter((t) => {
    const s = t.status?.toLowerCase().replace(/\s+/g, '');
    return s === 'done' || s === 'completed';
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <input type="text" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" style={{ backgroundColor: '#4F46E5', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
          Add Task
        </button>
      </form>

      {/* 1. Loading State */}
      {loading && <Spinner />}

      {/* 2. Error State */}
      {error && !loading && <ErrorBanner message={error} onRetry={loadTasks} />}

      {/* 3. Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState message="No tasks match current filters or search terms." />
      )}

      {/* 4. Success State */}
      {!loading && !error && tasks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {/* TO DO */}
          <div style={{ background: '#f4f5f7', padding: '1rem', borderRadius: '8px', color: '#000' }}>
            <h3>TO DO ({todoTasks.length})</h3>
            {todoTasks.map((t) => (
              <div key={t.id || t._id} style={{ background: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '6px' }}>
                <h4>{t.title}</h4>
                <p style={{ color: '#666' }}>{t.assignee}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => handleMove(t.id || t._id, 'In Progress')}>Move right →</button>
                  <button type="button" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* IN PROGRESS */}
          <div style={{ background: '#f4f5f7', padding: '1rem', borderRadius: '8px', color: '#000' }}>
            <h3>IN PROGRESS ({inProgressTasks.length})</h3>
            {inProgressTasks.map((t) => (
              <div key={t.id || t._id} style={{ background: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '6px' }}>
                <h4>{t.title}</h4>
                <p style={{ color: '#666' }}>{t.assignee}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => handleMove(t.id || t._id, 'To Do')}>← Move left</button>
                  <button type="button" onClick={() => handleMove(t.id || t._id, 'Done')}>Move right →</button>
                  <button type="button" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* DONE */}
          <div style={{ background: '#f4f5f7', padding: '1rem', borderRadius: '8px', color: '#000' }}>
            <h3>DONE ({doneTasks.length})</h3>
            {doneTasks.map((t) => (
              <div key={t.id || t._id} style={{ background: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '6px' }}>
                <h4>{t.title}</h4>
                <p style={{ color: '#666' }}>{t.assignee}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => handleMove(t.id || t._id, 'In Progress')}>← Move left</button>
                  <button type="button" onClick={() => handleDelete(t.id || t._id)} style={{ color: 'red' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
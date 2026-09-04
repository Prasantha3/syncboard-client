import React, { useState, useEffect } from 'react';
import {
getTasks,
createTask,
updateTaskStatus,
deleteTask,
} from '../api/tasks';
import localDb from '../db/localDb';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

let localSaveQueue = Promise.resolve();

const saveTasksLocally = (taskList) => {
localSaveQueue = localSaveQueue.then(async () => {
for (const task of taskList) {
const taskId = String(task.id || task._id || '');

  if (!taskId || taskId === 'undefined') {
    continue;
  }

  const documentId = `task:${taskId}`;

  let existingDoc = null;

  try {
    existingDoc = await localDb.get(documentId);
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }

  const localDocument = {
    ...task,
    _id: documentId,
    id: taskId,
  };

  if (existingDoc?._rev) {
    localDocument._rev = existingDoc._rev;
  }

  try {
    await localDb.put(localDocument);
  } catch (err) {
    if (err.status === 409) {
      const latestDoc = await localDb.get(documentId);

      await localDb.put({
        ...localDocument,
        _rev: latestDoc._rev,
      });
    } else {
      throw err;
    }
  }
}

console.log('✅ Tasks saved to PouchDB');

});

return localSaveQueue;
};

async function loadTasksFromLocalDb() {
try {
const result = await localDb.allDocs({
include_docs: true,
});

const localTasks = result.rows
  .map((row) => row.doc)
  .filter(
    (doc) => doc && doc._id && doc._id.startsWith('task:')
  )
  .map((doc) => {
    const { _id, _rev, ...task } = doc;

    return {
      ...task,
      id: task.id || _id.replace('task:', ''),
    };
  });

console.log(
  '📦 Tasks loaded from PouchDB:',
  localTasks
);

return localTasks;

} catch (err) {
console.error(
'❌ Failed to read tasks from PouchDB:',
err
);

return [];

}
}

export default function TaskBoard() {
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [isOffline, setIsOffline] = useState(false);

const [title, setTitle] = useState('');
const [assignee, setAssignee] = useState('');
const [dueDate, setDueDate] = useState('');

const loadTasks = async () => {
setError(null);

const localTasks = await loadTasksFromLocalDb();

if (localTasks.length > 0) {
  setTasks(localTasks);
  setLoading(false);
}

try {
  const data = await getTasks();

  const serverTasks = Array.isArray(data)
    ? data
    : data?.tasks || data?.data || [];

  setTasks(serverTasks);

  await saveTasksLocally(serverTasks);

  setIsOffline(false);
  setError(null);
} catch (err) {
  console.error(
    '❌ Server unavailable:',
    err
  );

  setIsOffline(true);

  if (localTasks.length > 0) {
    setTasks(localTasks);
    setError(null);
  } else {
    setTasks([]);
    setError(
      err.message ||
        'Failed to connect to SyncBoard server'
    );
  }
} finally {
  setLoading(false);
}

};

useEffect(() => {
loadTasks();
}, []);

const handleAddTask = async (e) => {
e.preventDefault();

if (!title.trim()) {
  return;
}

const taskData = {
  title: title.trim(),
  assignee: assignee || 'Unassigned',
  dueDate:
    dueDate ||
    new Date().toISOString().split('T')[0],
  status: 'To Do',
};

try {
  const newTask = await createTask(taskData);

  const createdItem =
    newTask?.task ||
    newTask?.data ||
    newTask;

  const taskId = String(
    createdItem.id || createdItem._id
  );

  const taskWithId = {
    ...createdItem,
    id: taskId,
  };

  setTasks((prev) => [
    ...prev,
    taskWithId,
  ]);

  await saveTasksLocally([taskWithId]);

  setIsOffline(false);

  setTitle('');
  setAssignee('');
  setDueDate('');
} catch (err) {
  console.log(
    '📴 Server unavailable. Saving task locally.'
  );

  const offlineTask = {
    ...taskData,
    id: `offline-${Date.now()}`,
  };

  try {
    await saveTasksLocally([offlineTask]);

    setTasks((prev) => [
      ...prev,
      offlineTask,
    ]);

    setIsOffline(true);

    setTitle('');
    setAssignee('');
    setDueDate('');

    console.log(
      '✅ Task saved locally while offline'
    );
  } catch (localError) {
    console.error(
      '❌ Failed to save offline task:',
      localError
    );

    alert(
      `Error adding task: ${localError.message}`
    );
  }
}

};

const handleMove = async (id, newStatus) => {
const taskId = String(id);

try {
  const updated = await updateTaskStatus(
    taskId,
    newStatus
  );

  const updatedItem =
    updated?.task ||
    updated?.data ||
    updated;

  const updatedTask = {
    ...updatedItem,
    id: String(
      updatedItem.id ||
        updatedItem._id ||
        taskId
    ),
    status: newStatus,
  };

  setTasks((prev) =>
    prev.map((task) =>
      String(task.id || task._id) === taskId
        ? {
            ...task,
            ...updatedTask,
          }
        : task
    )
  );

  await saveTasksLocally([updatedTask]);

  setIsOffline(false);
} catch (err) {
  console.log(
    '📴 Server unavailable. Updating task locally.'
  );

  const currentTask = tasks.find(
    (task) =>
      String(task.id || task._id) === taskId
  );

  if (!currentTask) {
    alert(
      `Error updating task: ${err.message}`
    );
    return;
  }

  const offlineUpdatedTask = {
    ...currentTask,
    id: taskId,
    status: newStatus,
  };

  try {
    await saveTasksLocally([
      offlineUpdatedTask,
    ]);

    setTasks((prev) =>
      prev.map((task) =>
        String(task.id || task._id) === taskId
          ? offlineUpdatedTask
          : task
      )
    );

    setIsOffline(true);

    console.log(
      '✅ Task status updated locally while offline'
    );
  } catch (localError) {
    alert(
      `Error updating local task: ${localError.message}`
    );
  }
}

};

const handleDelete = async (id) => {
const taskId = String(id);

try {
  await deleteTask(taskId);

  setTasks((prev) =>
    prev.filter(
      (task) =>
        String(task.id || task._id) !== taskId
    )
  );

  try {
    const localTask = await localDb.get(
      `task:${taskId}`
    );

    await localDb.remove(localTask);

    console.log(
      '🗑️ Task removed from PouchDB'
    );
  } catch (localError) {
    if (localError.status !== 404) {
      console.error(
        '❌ Failed to remove local task:',
        localError
      );
    }
  }

  setIsOffline(false);
} catch (err) {
  console.log(
    '📴 Server unavailable. Deleting task locally.'
  );

  try {
    const localTask = await localDb.get(
      `task:${taskId}`
    );

    await localDb.remove(localTask);

    setTasks((prev) =>
      prev.filter(
        (task) =>
          String(task.id || task._id) !==
          taskId
      )
    );

    setIsOffline(true);

    console.log(
      '✅ Task deleted locally while offline'
    );
  } catch (localError) {
    if (localError.status === 404) {
      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(task.id || task._id) !==
            taskId
        )
      );

      setIsOffline(true);
    } else {
      alert(
        `Error deleting task: ${localError.message}`
      );
    }
  }
}

};

const getStatus = (task) =>
task.status
?.toLowerCase()
.replace(/\s+/g, '');

const todoTasks = tasks.filter((task) => {
const status = getStatus(task);

return (
  status === 'todo' ||
  status === 'pending'
);

});

const inProgressTasks = tasks.filter(
(task) =>
getStatus(task) === 'inprogress'
);

const doneTasks = tasks.filter((task) => {
const status = getStatus(task);

return (
  status === 'done' ||
  status === 'completed'
);

});

const renderTask = (
task,
buttons
) => {
const taskId = String(
task.id || task._id
);

return (
  <div
    key={taskId}
    style={{
      background: '#fff',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '6px',
      boxShadow:
        '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}
  >
    <h4>{task.title}</h4>

    <p style={{ color: '#666' }}>
      {task.assignee}
    </p>

    {task.dueDate && (
      <p
        style={{
          color: '#777',
          fontSize: '0.9rem',
        }}
      >
        Due: {task.dueDate}
      </p>
    )}

    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      {buttons}
    </div>
  </div>
);

};

return (
<div
style={{
padding: '2rem',
fontFamily: 'sans-serif',
}}
>
{isOffline && (
<div
style={{
backgroundColor: '#fff3cd',
color: '#856404',
padding: '0.75rem 1rem',
borderRadius: '6px',
marginBottom: '1rem',
textAlign: 'center',
border:
'1px solid #ffeeba',
}}
>
📴 You are offline. Showing locally
saved tasks.
</div>
)}

  <form
    onSubmit={handleAddTask}
    style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    }}
  >
    <input
      type="text"
      placeholder="Task title"
      value={title}
      onChange={(e) =>
        setTitle(e.target.value)
      }
      required
    />

    <input
      type="text"
      placeholder="Assignee"
      value={assignee}
      onChange={(e) =>
        setAssignee(e.target.value)
      }
    />

    <input
      type="date"
      value={dueDate}
      onChange={(e) =>
        setDueDate(e.target.value)
      }
    />

    <button
      type="submit"
      style={{
        backgroundColor: '#4F46E5',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
      }}
    >
      Add Task
    </button>
  </form>

  {loading && <Spinner />}

  {error && !loading && (
    <ErrorBanner
      message={error}
      onRetry={loadTasks}
    />
  )}

  {!loading &&
    !error &&
    tasks.length === 0 && (
      <EmptyState
        message="No tasks match current filters or search terms."
      />
    )}

  {!loading &&
    !error &&
    tasks.length > 0 && (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            background: '#f4f5f7',
            padding: '1rem',
            borderRadius: '8px',
            color: '#000',
          }}
        >
          <h3>
            TO DO ({todoTasks.length})
          </h3>

          {todoTasks.map((task) =>
            renderTask(
              task,
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleMove(
                      task.id || task._id,
                      'In Progress'
                    )
                  }
                >
                  Move right →
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      task.id || task._id
                    )
                  }
                  style={{
                    color: 'red',
                  }}
                >
                  Delete
                </button>
              </>
            )
          )}
        </div>

        <div
          style={{
            background: '#f4f5f7',
            padding: '1rem',
            borderRadius: '8px',
            color: '#000',
          }}
        >
          <h3>
            IN PROGRESS (
            {inProgressTasks.length})
          </h3>

          {inProgressTasks.map((task) =>
            renderTask(
              task,
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleMove(
                      task.id || task._id,
                      'To Do'
                    )
                  }
                >
                  ← Move left
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMove(
                      task.id || task._id,
                      'Done'
                    )
                  }
                >
                  Move right →
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      task.id || task._id
                    )
                  }
                  style={{
                    color: 'red',
                  }}
                >
                  Delete
                </button>
              </>
            )
          )}
        </div>

        <div
          style={{
            background: '#f4f5f7',
            padding: '1rem',
            borderRadius: '8px',
            color: '#000',
          }}
        >
          <h3>
            DONE ({doneTasks.length})
          </h3>

          {doneTasks.map((task) =>
            renderTask(
              task,
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleMove(
                      task.id || task._id,
                      'In Progress'
                    )
                  }
                >
                  ← Move left
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      task.id || task._id
                    )
                  }
                  style={{
                    color: 'red',
                  }}
                >
                  Delete
                </button>
              </>
            )
          )}
        </div>
      </div>
    )}
</div>

);
}
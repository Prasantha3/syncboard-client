import React, { useEffect, useState } from 'react';

import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from '../api/tasks';

import localDb from '../db/localDb';

import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
} from '../db/syncQueue';

import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

let localSaveQueue = Promise.resolve();

const saveTasksLocally = async (taskList) => {
  localSaveQueue = localSaveQueue.then(async () => {
    for (const task of taskList) {
      const taskId = String(task.id || task._id);

      if (!taskId) {
        continue;
      }

      const localDocument = {
        ...task,
        _id: `task:${taskId}`,
      };

      try {
        const existing = await localDb.get(`task:${taskId}`);
        localDocument._rev = existing._rev;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      try {
        await localDb.put(localDocument);
      } catch (error) {
        if (error.status === 409) {
          try {
            const latest = await localDb.get(`task:${taskId}`);

            localDocument._rev = latest._rev;

            await localDb.put(localDocument);
          } catch (retryError) {
            console.error(
              '❌ Failed to update local task:',
              retryError
            );
          }
        } else {
          console.error(
            '❌ Failed to save task locally:',
            error
          );
        }
      }
    }
  });

  return localSaveQueue;
};

const loadTasksFromLocalDb = async () => {
  const result = await localDb.allDocs({
    include_docs: true,
    startkey: 'task:',
    endkey: 'task:\uffff',
  });

  return result.rows
    .map((row) => row.doc)
    .filter(Boolean)
    .map((task) => {
      const { _id, _rev, ...cleanTask } = task;

      return {
        ...cleanTask,
        id: String(
          cleanTask.id ||
            cleanTask._id ||
            _id.replace('task:', '')
        ),
      };
    });
};

const makeOfflineTask = ({
  title,
  assignee,
  dueDate,
}) => {
  const now = new Date().toISOString();

  return {
    id: `local-${Date.now()}`,
    title,
    assignee,
    status: 'To Do',
    dueDate:
      dueDate ||
      new Date().toISOString().slice(0, 10),
    isLocalOnly: true,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
};

function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOffline, setIsOffline] = useState(
    !navigator.onLine
  );

  const [syncing, setSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] =
    useState(0);

  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [conflict, setConflict] = useState(null);

  const updatePendingSyncCount = async () => {
    try {
      const queue = await getSyncQueue();

      setPendingSyncCount(queue.length);
    } catch (error) {
      console.error(
        '❌ Failed to read sync queue:',
        error
      );
    }
  };

  const syncPendingChanges = async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }

    try {
      const queue = await getSyncQueue();

      if (queue.length === 0) {
        setPendingSyncCount(0);
        return;
      }

      setSyncing(true);

      let remainingQueue = queue.length;

      for (const change of queue) {
        try {
          if (change.type === 'create') {
            const created = await createTask(change.data);

            const createdTask = {
              ...(created?.task ||
                created?.data ||
                created),

              id: String(
                created?.id ||
                  created?._id ||
                  created?.task?.id ||
                  created?.task?._id ||
                  created?.data?.id ||
                  created?.data?._id ||
                  change.taskId
              ),
            };

            try {
              const localTask = await localDb.get(
                `task:${change.taskId}`
              );

              await localDb.remove(localTask);
            } catch (localError) {
              if (localError.status !== 404) {
                console.error(
                  '❌ Failed to remove old local task:',
                  localError
                );
              }
            }

            await saveTasksLocally([createdTask]);

            setTasks((prev) =>
              prev.map((task) =>
                String(task.id || task._id) ===
                String(change.taskId)
                  ? createdTask
                  : task
              )
            );

            await removeFromSyncQueue(change._id);

            remainingQueue -= 1;

            setPendingSyncCount(remainingQueue);

            continue;
          }

          if (change.type === 'update') {
            const updated = await updateTaskStatus(
              change.taskId,
              change.data.status,
              typeof change.data.baseVersion === 'number'
                ? change.data.baseVersion
                : undefined
            );

            const updatedItem =
              updated?.task ||
              updated?.data ||
              updated;

            const updatedTask = {
              ...change.data.task,
              ...updatedItem,

              id: String(
                updatedItem?.id ||
                  updatedItem?._id ||
                  change.taskId
              ),

              status: change.data.status,
            };

            await saveTasksLocally([updatedTask]);

            setTasks((prev) =>
              prev.map((task) =>
                String(task.id || task._id) ===
                String(change.taskId)
                  ? updatedTask
                  : task
              )
            );

            await removeFromSyncQueue(change._id);

            remainingQueue -= 1;

            setPendingSyncCount(remainingQueue);

            continue;
          }

          if (change.type === 'delete') {
            await deleteTask(change.taskId);

            await removeFromSyncQueue(change._id);

            remainingQueue -= 1;

            setPendingSyncCount(remainingQueue);

            continue;
          }
        } catch (syncError) {
          if (syncError.status === 409) {
            console.log(
              '⚠️ Offline change caused a conflict:',
              syncError
            );

            setConflict({
              taskId: change.taskId,

              attempted:
                change.data?.task ||
                change.data,

              current:
                syncError.conflict?.current ||
                syncError.data?.payload?.current ||
                null,

              yourVersion:
                syncError.conflict?.yourVersion ??
                syncError.data?.payload?.yourVersion ??
                change.data?.baseVersion ??
                null,

              message:
                syncError.data?.message ||
                syncError.message ||
                'An offline change conflicts with the current server version.',
            });

            continue;
          }

          console.error(
            '❌ Failed to sync ' +
              change.type +
              ' for task ' +
              change.taskId +
              ':',
            syncError
          );
        }
      }

      await updatePendingSyncCount();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initialiseBoard = async () => {
      try {
        const localTasks =
          await loadTasksFromLocalDb();

        if (localTasks.length > 0) {
          setTasks(localTasks);
          setLoading(false);
        }

        await updatePendingSyncCount();

        if (!navigator.onLine) {
          setIsOffline(true);

          if (localTasks.length === 0) {
            setLoading(false);
          }

          return;
        }

        await syncPendingChanges();

        try {
          const serverTasks = await getTasks();

          const normalizedTasks = (
            Array.isArray(serverTasks)
              ? serverTasks
              : serverTasks?.tasks || []
          ).map((task) => ({
            ...task,
            id: String(task.id || task._id),
          }));

          setTasks(normalizedTasks);

          await saveTasksLocally(normalizedTasks);

          setIsOffline(false);
        } catch (serverError) {
          console.error(
            '❌ Background server refresh failed:',
            serverError
          );

          setIsOffline(true);
        }
      } catch (initialError) {
        console.error(
          '❌ Failed to initialise board:',
          initialError
        );

        setError(
          'Unable to load tasks from local storage.'
        );
      } finally {
        setLoading(false);
      }
    };

    initialiseBoard();

    const handleOnline = async () => {
      setIsOffline(false);

      await syncPendingChanges();

      try {
        const serverTasks = await getTasks();

        const normalizedTasks = (
          Array.isArray(serverTasks)
            ? serverTasks
            : serverTasks?.tasks || []
        ).map((task) => ({
          ...task,
          id: String(task.id || task._id),
        }));

        setTasks(normalizedTasks);

        await saveTasksLocally(normalizedTasks);

        setIsOffline(false);
      } catch (error) {
        console.error(
          '❌ Failed to refresh after coming online:',
          error
        );

        setIsOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener(
      'online',
      handleOnline
    );

    window.addEventListener(
      'offline',
      handleOffline
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, []);

  const handleAddTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const taskData = {
      title: title.trim(),
      assignee:
        assignee.trim() || 'Team Member',
      dueDate:
        dueDate ||
        new Date().toISOString().slice(0, 10),
    };

    if (!navigator.onLine) {
      const offlineTask =
        makeOfflineTask(taskData);

      setTasks((prev) => [
        ...prev,
        offlineTask,
      ]);

      await saveTasksLocally([offlineTask]);

      await addToSyncQueue({
        type: 'create',
        taskId: offlineTask.id,
        data: taskData,
      });

      await updatePendingSyncCount();

      setIsOffline(true);

      setTitle('');
      setAssignee('');
      setDueDate('');

      return;
    }

    try {
      const created =
        await createTask(taskData);

      const createdTask = {
        ...(created?.task ||
          created?.data ||
          created),

        id: String(
          created?.id ||
            created?._id ||
            created?.task?.id ||
            created?.task?._id ||
            created?.data?.id ||
            created?.data?._id
        ),
      };

      setTasks((prev) => [
        ...prev,
        createdTask,
      ]);

      await saveTasksLocally([
        createdTask,
      ]);

      setIsOffline(false);

      setTitle('');
      setAssignee('');
      setDueDate('');
    } catch (err) {
      console.error(
        '❌ Failed to create task:',
        err
      );

      if (
        !navigator.onLine ||
        err.name === 'TypeError'
      ) {
        const offlineTask =
          makeOfflineTask(taskData);

        setTasks((prev) => [
          ...prev,
          offlineTask,
        ]);

        await saveTasksLocally([
          offlineTask,
        ]);

        await addToSyncQueue({
          type: 'create',
          taskId: offlineTask.id,
          data: taskData,
        });

        await updatePendingSyncCount();

        setIsOffline(true);

        setTitle('');
        setAssignee('');
        setDueDate('');

        return;
      }

      setError(
        err.message ||
          'Failed to create task.'
      );
    }
  };

  const handleMove = async (
    id,
    newStatus
  ) => {
    const taskId = String(id);

    const currentTask =
      tasks.find(
        (task) =>
          String(
            task.id || task._id
          ) === taskId
      );

    if (!currentTask) {
      return;
    }

    const attemptedChange = {
      ...currentTask,
      id: taskId,
      status: newStatus,
    };

    if (currentTask.isLocalOnly) {
      const localUpdatedTask = {
        ...currentTask,
        status: newStatus,
        updatedAt:
          new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((task) =>
          String(
            task.id || task._id
          ) === taskId
            ? localUpdatedTask
            : task
        )
      );

      await saveTasksLocally([
        localUpdatedTask,
      ]);

      await addToSyncQueue({
        type: 'create',
        taskId,
        data: {
          title:
            localUpdatedTask.title,
          assignee:
            localUpdatedTask.assignee,
          dueDate:
            localUpdatedTask.dueDate,
          status:
            localUpdatedTask.status,
        },
      });

      await updatePendingSyncCount();

      setIsOffline(true);

      return;
    }

    /*
     * IMPORTANT:
     * If the user is offline, do not call the server.
     * Update the local task and put the change
     * into the sync queue.
     */
    if (!navigator.onLine) {
      const localUpdatedTask = {
        ...currentTask,
        status: newStatus,
        updatedAt:
          new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((task) =>
          String(
            task.id || task._id
          ) === taskId
            ? localUpdatedTask
            : task
        )
      );

      await saveTasksLocally([
        localUpdatedTask,
      ]);

      await addToSyncQueue({
        type: 'update',
        taskId,
        data: {
          task: localUpdatedTask,
          status: newStatus,
          baseVersion:
            typeof currentTask.version ===
            'number'
              ? currentTask.version
              : undefined,
        },
      });

      await updatePendingSyncCount();

      setIsOffline(true);

      return;
    }

    try {
      const updated =
        await updateTaskStatus(
          taskId,
          newStatus,
          typeof currentTask.version ===
            'number'
            ? currentTask.version
            : undefined
        );

      const updatedItem =
        updated?.task ||
        updated?.data ||
        updated;

      const updatedTask = {
        ...currentTask,
        ...updatedItem,

        id: String(
          updatedItem?.id ||
            updatedItem?._id ||
            taskId
        ),

        status: newStatus,
      };

      setTasks((prev) =>
        prev.map((task) =>
          String(
            task.id || task._id
          ) === taskId
            ? updatedTask
            : task
        )
      );

      await saveTasksLocally([
        updatedTask,
      ]);

      setIsOffline(false);
      setConflict(null);
    } catch (err) {
      if (err.status === 409) {
        console.log(
          '⚠️ Task update conflict:',
          err
        );

        setConflict({
          taskId,
          attempted: attemptedChange,

          current:
            err.conflict?.current ||
            err.data?.payload?.current ||
            null,

          yourVersion:
            err.conflict?.yourVersion ??
            err.data?.payload?.yourVersion ??
            currentTask.version,

          message:
            err.data?.message ||
            err.message ||
            'Task was modified by another user.',
        });

        return;
      }

      console.log(
        '📴 Server unavailable. Updating task locally.'
      );

      const localUpdatedTask = {
        ...currentTask,
        status: newStatus,
        updatedAt:
          new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((task) =>
          String(
            task.id || task._id
          ) === taskId
            ? localUpdatedTask
            : task
        )
      );

      await saveTasksLocally([
        localUpdatedTask,
      ]);

      await addToSyncQueue({
        type: 'update',
        taskId,
        data: {
          task: localUpdatedTask,
          status: newStatus,
          baseVersion:
            typeof currentTask.version ===
            'number'
              ? currentTask.version
              : undefined,
        },
      });

      await updatePendingSyncCount();

      setIsOffline(true);
    }
  };

  const handleDelete = async (id) => {
    const taskId = String(id);

    const currentTask =
      tasks.find(
        (task) =>
          String(
            task.id || task._id
          ) === taskId
      );

    if (!currentTask) {
      return;
    }

    if (currentTask.isLocalOnly) {
      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(
              task.id || task._id
            ) !== taskId
        )
      );

      try {
        const localTask =
          await localDb.get(
            `task:${taskId}`
          );

        await localDb.remove(
          localTask
        );
      } catch (error) {
        if (error.status !== 404) {
          console.error(
            '❌ Failed to delete local task:',
            error
          );
        }
      }

      const queue =
        await getSyncQueue();

      const createChange =
        queue.find(
          (item) =>
            item.type === 'create' &&
            String(item.taskId) === taskId
        );

      if (createChange) {
        await removeFromSyncQueue(
          createChange._id
        );
      }

      await updatePendingSyncCount();

      setIsOffline(true);

      return;
    }

    if (!navigator.onLine) {
      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(
              task.id || task._id
            ) !== taskId
        )
      );

      try {
        const localTask =
          await localDb.get(
            `task:${taskId}`
          );

        await localDb.remove(
          localTask
        );
      } catch (error) {
        if (error.status !== 404) {
          console.error(
            '❌ Failed to delete local task:',
            error
          );
        }
      }

      await addToSyncQueue({
        type: 'delete',
        taskId,
        data: {
          task: currentTask,
        },
      });

      await updatePendingSyncCount();

      setIsOffline(true);

      return;
    }

    try {
      await deleteTask(taskId);

      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(
              task.id || task._id
            ) !== taskId
        )
      );

      try {
        const localTask =
          await localDb.get(
            `task:${taskId}`
          );

        await localDb.remove(
          localTask
        );
      } catch (localError) {
        if (localError.status !== 404) {
          console.error(
            '❌ Failed to remove task locally:',
            localError
          );
        }
      }

      setIsOffline(false);
    } catch (err) {
      console.log(
        '📴 Server unavailable. Deleting task locally.'
      );

      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(
              task.id || task._id
            ) !== taskId
        )
      );

      try {
        const localTask =
          await localDb.get(
            `task:${taskId}`
          );

        await localDb.remove(
          localTask
        );
      } catch (localError) {
        if (localError.status !== 404) {
          console.error(
            '❌ Failed to remove task locally:',
            localError
          );
        }
      }

      await addToSyncQueue({
        type: 'delete',
        taskId,
        data: {
          task: currentTask,
        },
      });

      await updatePendingSyncCount();

      setIsOffline(true);
    }
  };

  const handleKeepServerVersion =
    async () => {
      if (!conflict?.current) {
        setConflict(null);
        return;
      }

      const serverTask = {
        ...conflict.current,
        id: String(
          conflict.current.id ||
            conflict.current._id ||
            conflict.taskId
        ),
      };

      setTasks((prev) =>
        prev.map((task) =>
          String(
            task.id || task._id
          ) === conflict.taskId
            ? serverTask
            : task
        )
      );

      try {
        await saveTasksLocally([
          serverTask,
        ]);
      } catch (err) {
        console.error(
          '❌ Failed to save server version locally:',
          err
        );
      }

      try {
        const queue =
          await getSyncQueue();

        for (const item of queue) {
          if (
            String(item.taskId) ===
              String(conflict.taskId) &&
            item.type === 'update'
          ) {
            await removeFromSyncQueue(
              item._id
            );
          }
        }

        await updatePendingSyncCount();
      } catch (queueError) {
        console.error(
          '❌ Failed to clear conflict queue:',
          queueError
        );
      }

      setConflict(null);

      console.log(
        '✅ Conflict resolved using server version'
      );
    };

  const handleRetryMyChange =
    async () => {
      if (
        !conflict?.attempted ||
        !conflict?.current
      ) {
        return;
      }

      const taskId =
        conflict.taskId;

      const attemptedStatus =
        conflict.attempted.status;

      const latestVersion =
        conflict.current.version;

      try {
        const updated =
          await updateTaskStatus(
            taskId,
            attemptedStatus,
            typeof latestVersion ===
              'number'
              ? latestVersion
              : undefined
          );

        const updatedItem =
          updated?.task ||
          updated?.data ||
          updated;

        const updatedTask = {
          ...updatedItem,

          id: String(
            updatedItem?.id ||
              updatedItem?._id ||
              taskId
          ),

          status: attemptedStatus,
        };

        setTasks((prev) =>
          prev.map((task) =>
            String(
              task.id || task._id
            ) === taskId
              ? {
                  ...task,
                  ...updatedTask,
                }
              : task
          )
        );

        await saveTasksLocally([
          updatedTask,
        ]);

        try {
          const queue =
            await getSyncQueue();

          for (const item of queue) {
            if (
              String(item.taskId) ===
                taskId &&
              item.type === 'update'
            ) {
              await removeFromSyncQueue(
                item._id
              );
            }
          }
        } catch (queueError) {
          console.error(
            '❌ Failed to clear retry queue:',
            queueError
          );
        }

        await updatePendingSyncCount();

        setConflict(null);
        setIsOffline(false);

        console.log(
          '✅ Conflict resolved by retrying your change'
        );
      } catch (err) {
        if (err.status === 409) {
          setConflict({
            taskId,

            attempted: {
              ...conflict.attempted,
              status: attemptedStatus,
            },

            current:
              err.conflict?.current ||
              err.data?.payload?.current ||
              conflict.current,

            yourVersion:
              err.conflict?.yourVersion ??
              err.data?.payload?.yourVersion ??
              latestVersion,

            message:
              err.data?.message ||
              err.message ||
              'The task changed again. Please review the conflict.',
          });

          return;
        }

        alert(
          'Unable to retry your change: ' +
            err.message
        );
      }
    };

  const renderTask = (task) => {
    return (
      <div
        key={String(
          task.id || task._id
        )}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow:
            '0 2px 5px rgba(0,0,0,0.08)',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '0.5rem',
          }}
        >
          {task.title}
        </h3>

        {task.description && (
          <p
            style={{
              color: '#555',
            }}
          >
            {task.description}
          </p>
        )}

        <p>
          <strong>Assignee:</strong>{' '}
          {task.assignee ||
            task.assigneeId ||
            'Team Member'}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          {task.status}
        </p>

        {task.dueDate && (
          <p>
            <strong>Due:</strong>{' '}
            {new Date(
              task.dueDate
            ).toLocaleDateString()}
          </p>
        )}

        {typeof task.version ===
          'number' && (
          <p
            style={{
              color: '#777',
              fontSize: '0.85rem',
            }}
          >
            Version: {task.version}
          </p>
        )}

        {task.isLocalOnly && (
          <p
            style={{
              color: '#856404',
              backgroundColor: '#fff3cd',
              padding: '0.4rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
            }}
          >
            📴 Local-only task
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginTop: '0.75rem',
          }}
        >
          {task.status !== 'To Do' &&
            task.status !== 'Pending' &&
            task.status !== 'pending' && (
              <button
                type="button"
                onClick={() =>
                  handleMove(
                    task.id ||
                      task._id,
                    'To Do'
                  )
                }
              >
                Move to To Do
              </button>
            )}

          {task.status !==
            'In Progress' &&
            task.status !==
              'in-progress' && (
              <button
                type="button"
                onClick={() =>
                  handleMove(
                    task.id ||
                      task._id,
                    'In Progress'
                  )
                }
              >
                Move to In Progress
              </button>
            )}

          {task.status !==
            'Completed' &&
            task.status !==
              'completed' && (
              <button
                type="button"
                onClick={() =>
                  handleMove(
                    task.id ||
                      task._id,
                    'Completed'
                  )
                }
              >
                Move to Completed
              </button>
            )}

          <button
            type="button"
            onClick={() =>
              handleDelete(
                task.id ||
                  task._id
              )
            }
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const todoTasks = tasks.filter(
    (task) =>
      task.status === 'To Do' ||
      task.status === 'todo' ||
      task.status === 'Pending' ||
      task.status === 'pending'
  );

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
          'In Progress' ||
        task.status ===
          'in-progress'
    );

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
          'Completed' ||
        task.status ===
          'completed'
    );

  if (loading) {
    return (
      <div
        style={{
          padding: '2rem',
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <h1>SyncBoard</h1>

      {isOffline && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #ffeeba',
          }}
        >
          📴 You are offline. Showing locally
          saved tasks.
        </div>
      )}

      {syncing && (
        <div
          style={{
            backgroundColor: '#e7f1ff',
            color: '#123',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #b8d4ff',
          }}
        >
          🔄 Syncing offline changes with the
          server...
        </div>
      )}

      {!syncing &&
        pendingSyncCount > 0 && (
          <div
            style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: '1px solid #ffeeba',
            }}
          >
            ⏳ {pendingSyncCount} change
            {pendingSyncCount === 1
              ? ''
              : 's'}{' '}
            waiting to synchronize.
          </div>
        )}

      {error && (
        <ErrorBanner message={error} />
      )}

      {conflict && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #f5c6cb',
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            ⚠️ Conflict detected
          </h3>

          <p>{conflict.message}</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                background: '#e7f1ff',
                padding: '1rem',
                borderRadius: '6px',
                color: '#123',
              }}
            >
              <h4>Your attempted change</h4>

              <p>
                <strong>Version:</strong>{' '}
                {conflict.yourVersion ??
                  conflict.attempted
                    ?.version ??
                  'Unknown'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {conflict.attempted
                  ?.status ||
                  'Unknown'}
              </p>

              <p>
                <strong>Title:</strong>{' '}
                {conflict.attempted
                  ?.title ||
                  'Unknown'}
              </p>
            </div>

            <div
              style={{
                background: '#fff3cd',
                padding: '1rem',
                borderRadius: '6px',
                color: '#533f03',
              }}
            >
              <h4>Current server version</h4>

              <p>
                <strong>Version:</strong>{' '}
                {conflict.current
                  ?.version ??
                  'Unknown'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {conflict.current
                  ?.status ||
                  'Unknown'}
              </p>

              <p>
                <strong>Title:</strong>{' '}
                {conflict.current
                  ?.title ||
                  'Unknown'}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={
                handleKeepServerVersion
              }
            >
              Keep Server Version
            </button>

            <button
              type="button"
              onClick={
                handleRetryMyChange
              }
            >
              Retry My Change
            </button>

            <button
              type="button"
              onClick={() =>
                setConflict(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleAddTask}
        style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2>Add Task</h2>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={(event) =>
              setAssignee(
                event.target.value
              )
            }
          />

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value
              )
            }
          />

          <button type="submit">
            Add Task
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <EmptyState
          message="No tasks available."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          <section>
            <h2>
              To Do ({todoTasks.length})
            </h2>

            {todoTasks.length === 0 ? (
              <p
                style={{
                  color: '#777',
                }}
              >
                No tasks
              </p>
            ) : (
              todoTasks.map(renderTask)
            )}
          </section>

          <section>
            <h2>
              In Progress (
              {inProgressTasks.length}
              )
            </h2>

            {inProgressTasks.length === 0 ? (
              <p
                style={{
                  color: '#777',
                }}
              >
                No tasks
              </p>
            ) : (
              inProgressTasks.map(
                renderTask
              )
            )}
          </section>

          <section>
            <h2>
              Completed (
              {completedTasks.length}
              )
            </h2>

            {completedTasks.length === 0 ? (
              <p
                style={{
                  color: '#777',
                }}
              >
                No tasks
              </p>
            ) : (
              completedTasks.map(
                renderTask
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default TaskBoard;
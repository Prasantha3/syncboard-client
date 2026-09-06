import { useState, useEffect } from 'react';
import { getTasks } from '../api/tasks';
import { getLocalTasks, syncLocalTasks } from '../db/pouch';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [conflictData, setConflictData] = useState(null);

  useEffect(() => {
    async function loadData() {
      // Step 2: Read from local PouchDB first for instant UI rendering
      const localData = await getLocalTasks();
      if (localData.length > 0) {
        setTasks(localData);
        setLoading(false);
      }

      // Sync with server in background
      try {
        const remoteTasks = await getTasks();
        setTasks(remoteTasks);
        await syncLocalTasks(remoteTasks);
        setIsOffline(false);
      } catch (error) {
        if (!navigator.onLine || error.message.includes('Fetch')) {
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { tasks, loading, isOffline, conflictData, setConflictData };
}
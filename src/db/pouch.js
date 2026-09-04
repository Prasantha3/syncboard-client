import PouchDB from 'pouchdb';
import PouchDBAdapterIDB from 'pouchdb-adapter-idb';

// Plugin the IndexedDB adapter explicitly for modern bundlers like Vite
PouchDB.plugin(PouchDBAdapterIDB);

export const localDB = new PouchDB('syncboard_local_tasks', { adapter: 'idb' });

export async function syncLocalTasks(tasks) {
  if (!tasks || !Array.isArray(tasks)) return;

  const docs = tasks.map((task) => ({
    _id: String(task.id || task._id),
    ...task,
  }));

  try {
    const existing = await localDB.allDocs({ include_docs: true });
    const existingMap = new Map(existing.rows.map((r) => [r.id, r.doc._rev]));

    const docsWithRev = docs.map((doc) => ({
      ...doc,
      ...(existingMap.has(doc._id) ? { _rev: existingMap.get(doc._id) } : {}),
    }));

    await localDB.bulkDocs(docsWithRev);
  } catch (err) {
    console.error('Failed to update PouchDB locally:', err);
  }
}

export async function getLocalTasks() {
  try {
    const result = await localDB.allDocs({ include_docs: true });
    return result.rows.map((row) => row.doc);
  } catch (err) {
    console.error('Failed to read from PouchDB:', err);
    return [];
  }
}
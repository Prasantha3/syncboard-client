import localDb from "./localDb";

const QUEUE_PREFIX = "queue:";

export async function addToSyncQueue(change) {
  const id = `${QUEUE_PREFIX}${change.type}:${change.taskId}`;

  const queueItem = {
    _id: id,
    type: change.type,
    taskId: change.taskId,
    data: change.data || null,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = await localDb.get(id);

    await localDb.put({
      ...queueItem,
      _rev: existing._rev,
    });
  } catch (error) {
    if (error.status === 404) {
      await localDb.put(queueItem);
    } else {
      throw error;
    }
  }
}

export async function getSyncQueue() {
  const result = await localDb.allDocs({
    include_docs: true,
    startkey: QUEUE_PREFIX,
    endkey: `${QUEUE_PREFIX}\uffff`,
  });

  return result.rows.map((row) => row.doc);
}

export async function removeFromSyncQueue(id) {
  try {
    const item = await localDb.get(id);
    await localDb.remove(item);
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }
}
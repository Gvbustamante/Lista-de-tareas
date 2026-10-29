import { openDB } from 'idb';

// IndexedDB: accesible también desde el service worker (para marcar "Hecho" desde la notificación).
const dbPromise = openDB('habitos', 1, {
  upgrade(db) {
    db.createObjectStore('habits', { keyPath: 'id' });
    const logs = db.createObjectStore('logs', { keyPath: 'id' });
    logs.createIndex('habitId', 'habitId');
    logs.createIndex('date', 'date');
  },
});

export const getAll = async () => {
  const db = await dbPromise;
  const [habits, logs] = await Promise.all([db.getAll('habits'), db.getAll('logs')]);
  return { habits, logs };
};

export const putHabit = async (h) => (await dbPromise).put('habits', h);

export const deleteHabit = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction(['habits', 'logs'], 'readwrite');
  await tx.objectStore('habits').delete(id);
  let cursor = await tx.objectStore('logs').index('habitId').openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
};

export const putLog = async (log) => (await dbPromise).put('logs', log);
export const deleteLog = async (id) => (await dbPromise).delete('logs', id);

export const replaceAll = async ({ habits, logs }) => {
  const db = await dbPromise;
  const tx = db.transaction(['habits', 'logs'], 'readwrite');
  await Promise.all([tx.objectStore('habits').clear(), tx.objectStore('logs').clear()]);
  for (const h of habits) tx.objectStore('habits').put(h);
  for (const l of logs) tx.objectStore('logs').put(l);
  await tx.done;
};

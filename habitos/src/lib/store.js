import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as db from './db.js';
import { logKey } from './schedule.js';

export const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);

export function useStore() {
  const [habits, setHabits] = useState([]);
  const [logList, setLogList] = useState([]);
  const [ready, setReady] = useState(false);
  const logRef = useRef([]);
  logRef.current = logList;

  const reload = useCallback(async () => {
    const data = await db.getAll();
    setHabits(data.habits.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setLogList(data.logs);
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
    // Recargar al volver a la app (p. ej. tras marcar desde una notificación).
    const onVis = () => document.visibilityState === 'visible' && reload();
    document.addEventListener('visibilitychange', onVis);
    const bc = 'BroadcastChannel' in self ? new BroadcastChannel('habitos') : null;
    if (bc) bc.onmessage = reload;
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      bc?.close();
    };
  }, [reload]);

  const logs = useMemo(() => Object.fromEntries(logList.map((l) => [l.id, l])), [logList]);

  const saveHabit = useCallback(async (h) => {
    const habit = { ...h, updatedAt: Date.now() };
    await db.putHabit(habit);
    setHabits((prev) => {
      const i = prev.findIndex((x) => x.id === habit.id);
      return i === -1 ? [...prev, habit] : prev.map((x) => (x.id === habit.id ? habit : x));
    });
  }, []);

  const removeHabit = useCallback(async (id) => {
    await db.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogList((prev) => prev.filter((l) => l.habitId !== id));
  }, []);

  // patch = null borra el registro del día.
  const setLog = useCallback(async (habitId, date, patch) => {
    const id = logKey(habitId, date);
    if (patch === null) {
      logRef.current = logRef.current.filter((l) => l.id !== id);
      setLogList(logRef.current);
      await db.deleteLog(id);
      return;
    }
    const cur = logRef.current.find((l) => l.id === id);
    const log = { ...(cur || { id, habitId, date, status: 'done', value: 0 }), ...patch, updatedAt: Date.now() };
    logRef.current = cur ? logRef.current.map((l) => (l.id === id ? log : l)) : [...logRef.current, log];
    setLogList(logRef.current);
    await db.putLog(log);
  }, []);

  const reorder = useCallback(async (ids) => {
    const next = ids.map((id, i) => ({ ...habits.find((h) => h.id === id), order: i }));
    await Promise.all(next.map(db.putHabit));
    setHabits(next.concat(habits.filter((h) => !ids.includes(h.id))));
  }, [habits]);

  const exportData = useCallback(
    () => ({ app: 'habitos', version: 1, exportedAt: new Date().toISOString(), habits, logs: logList }),
    [habits, logList],
  );

  const importData = useCallback(async (data) => {
    if (data?.app !== 'habitos' || !Array.isArray(data.habits) || !Array.isArray(data.logs))
      throw new Error('Archivo no válido');
    await db.replaceAll(data);
    await reload();
  }, [reload]);

  return { ready, habits, logs, saveHabit, removeHabit, setLog, reorder, exportData, importData };
}

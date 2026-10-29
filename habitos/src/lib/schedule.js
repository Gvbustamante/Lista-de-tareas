import { diffDays, weekdayMon, weekStart, addDays, fromKey } from './dates.js';

export const FREQ = {
  daily: 'Todos los días',
  weekdays: 'Días específicos',
  timesPerWeek: 'Veces por semana',
  everyNDays: 'Cada N días',
  monthly: 'Días del mes',
};

export const logKey = (habitId, date) => `${habitId}_${date}`;

export const isComplete = (habit, log) =>
  !!log && log.status === 'done' && (log.value ?? 1) >= (habit.target || 1);

// Cantidad de días completos de un hábito en la semana de `date` (excluyendo `excludeDate`).
const doneInWeek = (habit, date, logs, excludeDate) => {
  const start = weekStart(date);
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (d === excludeDate) continue;
    if (isComplete(habit, logs[logKey(habit.id, d)])) count++;
  }
  return count;
};

// ¿Toca este hábito en `date`?
export function isDue(habit, date, logs = {}) {
  if (habit.archived) return false;
  if (habit.startDate && date < habit.startDate) return false;
  if (habit.pausedUntil && date <= habit.pausedUntil) return false;
  const f = habit.frequency || { type: 'daily' };
  switch (f.type) {
    case 'weekdays':
      return (f.days || []).includes(weekdayMon(date));
    case 'everyNDays': {
      const n = Math.max(1, f.interval || 1);
      const d = diffDays(habit.startDate || date, date);
      return d >= 0 && d % n === 0;
    }
    case 'monthly': {
      const day = fromKey(date).getDate();
      const lastDay = new Date(fromKey(date).getFullYear(), fromKey(date).getMonth() + 1, 0).getDate();
      // Si eligió 31 y el mes tiene 30, toca el último día.
      return (f.monthDays || []).some((m) => m === day || (m > lastDay && day === lastDay));
    }
    case 'timesPerWeek': {
      // Se muestra mientras falten veces en la semana; si ya se hizo hoy, sigue visible.
      if (logs[logKey(habit.id, date)]) return true;
      return doneInWeek(habit, date, logs, date) < (f.times || 1);
    }
    case 'daily':
    default:
      return true;
  }
}

export const describeFrequency = (habit) => {
  const f = habit.frequency || { type: 'daily' };
  const L = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  switch (f.type) {
    case 'weekdays':
      return (f.days || []).length === 7 ? 'Todos los días' : [...(f.days || [])].sort().map((d) => L[d]).join(' ');
    case 'everyNDays':
      return f.interval === 1 ? 'Todos los días' : `Cada ${f.interval} días`;
    case 'monthly':
      return `Días ${[...(f.monthDays || [])].sort((a, b) => a - b).join(', ')} del mes`;
    case 'timesPerWeek':
      return `${f.times} ${f.times === 1 ? 'vez' : 'veces'} por semana`;
    default:
      return 'Todos los días';
  }
};

export const weekProgress = (habit, date, logs) => doneInWeek(habit, date, logs, null);

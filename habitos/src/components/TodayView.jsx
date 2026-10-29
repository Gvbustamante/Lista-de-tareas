import { useMemo, useState } from 'react';
import ProgressRing from './ProgressRing.jsx';
import { addDays, formatLong, fromKey, todayKey, weekStart, WEEKDAYS_SHORT } from '../lib/dates.js';
import { isComplete, isDue, logKey, weekProgress } from '../lib/schedule.js';

export default function TodayView({ habits, logs, setLog, onNew }) {
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [menuFor, setMenuFor] = useState(null);

  const due = useMemo(() => habits.filter((h) => isDue(h, date, logs)), [habits, logs, date]);
  const counted = due.filter((h) => logs[logKey(h.id, date)]?.status !== 'skipped');
  const doneCount = counted.filter((h) => isComplete(h, logs[logKey(h.id, date)])).length;
  const pct = counted.length ? doneCount / counted.length : 0;

  const ws = weekStart(date);
  const week = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  const tap = (h) => {
    const log = logs[logKey(h.id, date)];
    const target = h.target || 1;
    if (log?.status === 'skipped') return setLog(h.id, date, null);
    if (target === 1) return setLog(h.id, date, log ? null : { status: 'done', value: 1 });
    const value = (log?.value || 0) + 1;
    if (value > target) return setLog(h.id, date, null);
    setLog(h.id, date, { status: 'done', value });
    navigator.vibrate?.(15);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 first-letter:uppercase">{formatLong(date)}</p>
          <h1 className="text-2xl font-bold">{date === today ? 'Hoy' : date < today ? 'Día pasado' : 'Próximo'}</h1>
        </div>
        <ProgressRing value={pct} size={64}>
          <span className="text-sm font-semibold">{doneCount}/{counted.length}</span>
        </ProgressRing>
      </header>

      <div className="mb-5 flex items-center gap-1">
        <button onClick={() => setDate(addDays(date, -7))} className="px-2 text-xl text-slate-500" aria-label="Semana anterior">‹</button>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {week.map((d, i) => (
            <button key={d} onClick={() => setDate(d)}
              className={`flex flex-col items-center rounded-xl py-2 text-xs ${d === date ? 'bg-emerald-500 text-slate-950' : d === today ? 'bg-slate-800 text-emerald-300' : 'text-slate-400'}`}>
              <span>{WEEKDAYS_SHORT[i]}</span>
              <span className="text-base font-semibold">{fromKey(d).getDate()}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setDate(addDays(date, 7))} className="px-2 text-xl text-slate-500" aria-label="Semana siguiente">›</button>
      </div>
      {date !== today && (
        <button onClick={() => setDate(today)} className="mb-4 w-full rounded-xl bg-slate-800 py-2 text-sm text-emerald-300">Volver a hoy</button>
      )}

      {!habits.length ? (
        <Empty onNew={onNew} />
      ) : !due.length ? (
        <p className="py-16 text-center text-slate-500">Nada programado para este día. 🌿</p>
      ) : (
        <ul className="space-y-3">
          {due.map((h) => {
            const log = logs[logKey(h.id, date)];
            const target = h.target || 1;
            const value = log?.status === 'done' ? log.value || 0 : 0;
            const done = isComplete(h, log);
            const skipped = log?.status === 'skipped';
            const f = h.frequency || {};
            return (
              <li key={h.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition ${done ? 'border-transparent' : 'border-slate-800 bg-slate-900'} ${skipped ? 'opacity-50' : ''}`}
                style={done ? { background: `${h.color}22` } : undefined}>
                <button onClick={() => tap(h)} className="flex flex-1 items-center gap-3 text-left" disabled={date > today}>
                  <ProgressRing value={skipped ? 0 : value / target} size={48} stroke={5} color={h.color}>
                    <span className="text-xl">{done ? '✓' : h.emoji}</span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${done ? 'text-slate-300 line-through decoration-2' : ''}`}>{h.name}</p>
                    <p className="text-xs text-slate-400">
                      {skipped ? 'Saltado' : target > 1 ? `${value} / ${target} ${h.unit}` : done ? 'Hecho' : h.reminders?.[0] ? `⏰ ${h.reminders.join(' · ')}` : 'Pendiente'}
                      {f.type === 'timesPerWeek' && ` · semana ${weekProgress(h, date, logs)}/${f.times}`}
                    </p>
                  </div>
                </button>
                {date <= today && (
                  <button onClick={() => setMenuFor(menuFor === h.id ? null : h.id)} className="px-2 text-xl text-slate-500" aria-label="Opciones">⋯</button>
                )}
                {menuFor === h.id && (
                  <DayMenu
                    habit={h} log={log}
                    onClose={() => setMenuFor(null)}
                    onSet={(patch) => { setLog(h.id, date, patch); setMenuFor(null); }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {date > today && due.length > 0 && <p className="mt-4 text-center text-xs text-slate-500">Podrás marcarlos ese día.</p>}
    </div>
  );
}

function DayMenu({ habit, log, onSet, onClose }) {
  const target = habit.target || 1;
  const item = 'w-full rounded-xl px-4 py-3 text-left hover:bg-slate-800';
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="safe-bottom w-full max-w-lg rounded-t-3xl bg-slate-900 p-3" onClick={(e) => e.stopPropagation()}>
        <p className="px-4 py-2 font-semibold">{habit.emoji} {habit.name}</p>
        {target > 1 && log?.status === 'done' && log.value > 0 && (
          <button className={item} onClick={() => onSet(log.value - 1 > 0 ? { value: log.value - 1 } : null)}>➖ Restar 1</button>
        )}
        {target > 1 && (
          <button className={item} onClick={() => onSet({ status: 'done', value: target })}>✅ Completar meta</button>
        )}
        {log?.status !== 'skipped' ? (
          <button className={item} onClick={() => onSet({ status: 'skipped', value: 0 })}>⏭️ Saltar este día (no rompe la racha)</button>
        ) : (
          <button className={item} onClick={() => onSet(null)}>↩️ Quitar salto</button>
        )}
        {log && <button className={`${item} text-red-400`} onClick={() => onSet(null)}>🗑️ Borrar registro del día</button>}
        <button className={`${item} text-slate-400`} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

function Empty({ onNew }) {
  return (
    <div className="py-16 text-center">
      <p className="mb-2 text-5xl">🌱</p>
      <p className="mb-6 text-slate-400">Aún no tienes hábitos.</p>
      <button onClick={onNew} className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950">Crear el primero</button>
    </div>
  );
}

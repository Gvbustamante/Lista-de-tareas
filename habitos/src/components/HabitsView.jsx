import { CATEGORIES } from '../lib/constants.js';
import { describeFrequency } from '../lib/schedule.js';
import { todayKey, addDays } from '../lib/dates.js';

export default function HabitsView({ habits, onEdit, onNew, saveHabit, reorder }) {
  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);
  const today = todayKey();

  const move = (i, dir) => {
    const ids = active.map((h) => h.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorder(ids);
  };

  const pause = (h) => {
    if (h.pausedUntil && h.pausedUntil >= today) return saveHabit({ ...h, pausedUntil: null });
    const days = Number(prompt('¿Cuántos días quieres pausarlo?', '7'));
    if (days > 0) saveHabit({ ...h, pausedUntil: addDays(today, days - 1) });
  };

  const row = (h, i) => {
    const cat = CATEGORIES.find((c) => c.id === h.category);
    const paused = h.pausedUntil && h.pausedUntil >= today;
    return (
      <li key={h.id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
        {!h.archived && (
          <div className="flex flex-col text-slate-500">
            <button onClick={() => move(i, -1)} className="px-1 leading-none disabled:opacity-20" disabled={i === 0} aria-label="Subir">▲</button>
            <button onClick={() => move(i, 1)} className="px-1 leading-none disabled:opacity-20" disabled={i === active.length - 1} aria-label="Bajar">▼</button>
          </div>
        )}
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `${h.color}26` }}>{h.emoji}</span>
        <button onClick={() => onEdit(h)} className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium">{h.name}</p>
          <p className="truncate text-xs text-slate-400">
            {paused ? `⏸️ Pausado hasta ${h.pausedUntil}` : describeFrequency(h)} · {cat?.label}
          </p>
        </button>
        {!h.archived && (
          <button onClick={() => pause(h)} className="px-2 text-lg" aria-label={paused ? 'Reanudar' : 'Pausar'}>{paused ? '▶️' : '⏸️'}</button>
        )}
        <button onClick={() => saveHabit({ ...h, archived: !h.archived })} className="px-2 text-lg" aria-label={h.archived ? 'Restaurar' : 'Archivar'}>
          {h.archived ? '♻️' : '🗄️'}
        </button>
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis hábitos</h1>
        <span className="text-sm text-slate-400">{active.length} activos</span>
      </header>
      {!active.length && <p className="py-10 text-center text-slate-500">Toca + para crear tu primer hábito.</p>}
      <ul className="space-y-3">{active.map(row)}</ul>
      {archived.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-medium text-slate-400">Archivados</h2>
          <ul className="space-y-3 opacity-60">{archived.map(row)}</ul>
        </>
      )}
      <button onClick={onNew} aria-label="Nuevo hábito"
        className="fixed bottom-24 right-5 z-10 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-3xl text-slate-950 shadow-lg shadow-emerald-500/30">
        +
      </button>
    </div>
  );
}

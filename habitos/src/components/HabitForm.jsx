import { useState } from 'react';
import Sheet from './Sheet.jsx';
import { CATEGORIES, COLORS, EMOJIS } from '../lib/constants.js';
import { FREQ } from '../lib/schedule.js';
import { WEEKDAYS_SHORT, todayKey } from '../lib/dates.js';
import { uid } from '../lib/store.js';

const emptyHabit = () => ({
  id: uid(),
  name: '',
  emoji: '⭐',
  color: COLORS[0],
  category: 'otro',
  frequency: { type: 'daily', days: [0, 1, 2, 3, 4], times: 3, interval: 2, monthDays: [1] },
  target: 1,
  unit: '',
  reminders: ['08:00'],
  startDate: todayKey(),
  archived: false,
  createdAt: Date.now(),
  order: Date.now(),
});

const Label = ({ children }) => <p className="mb-2 mt-5 text-sm font-medium text-slate-400 first:mt-0">{children}</p>;
const input = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-base outline-none focus:border-emerald-400';
const chip = (on) => `rounded-full border px-3 py-1.5 text-sm ${on ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300' : 'border-slate-700 text-slate-300'}`;

export default function HabitForm({ habit, onSave, onDelete, onClose }) {
  const [h, setH] = useState(() => {
    const base = emptyHabit();
    return habit ? { ...base, ...habit, frequency: { ...base.frequency, ...habit.frequency } } : base;
  });
  const [error, setError] = useState('');
  const set = (patch) => setH((p) => ({ ...p, ...patch }));
  const setF = (patch) => setH((p) => ({ ...p, frequency: { ...p.frequency, ...patch } }));
  const f = h.frequency;

  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    if (!h.name.trim()) return setError('Escribe un nombre.');
    if (f.type === 'weekdays' && !f.days.length) return setError('Elige al menos un día.');
    if (f.type === 'monthly' && !f.monthDays.length) return setError('Elige al menos un día del mes.');
    const reminders = [...new Set(h.reminders.filter(Boolean))].sort();
    onSave({ ...h, name: h.name.trim(), unit: h.unit.trim(), target: Math.max(1, Number(h.target) || 1), reminders });
  };

  return (
    <Sheet
      title={habit ? 'Editar hábito' : 'Nuevo hábito'}
      onClose={onClose}
      footer={
        <div className="flex gap-3 pb-1">
          {habit && (
            <button
              onClick={() => confirm(`¿Borrar "${habit.name}" y todo su historial?`) && onDelete(habit.id)}
              className="rounded-xl border border-red-500/40 px-4 py-3 text-red-400"
            >
              Borrar
            </button>
          )}
          <button onClick={submit} className="flex-1 rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950">
            Guardar
          </button>
        </div>
      }
    >
      <Label>Nombre</Label>
      <input className={input} value={h.name} maxLength={60} placeholder="Ej: Tomar sol 15 min"
        onChange={(e) => { set({ name: e.target.value }); setError(''); }} autoFocus={!habit} />

      <Label>Ícono</Label>
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => set({ emoji: e })}
            className={`grid h-11 w-11 place-items-center rounded-xl text-2xl ${h.emoji === e ? 'bg-slate-700 ring-2 ring-emerald-400' : 'bg-slate-800'}`}>
            {e}
          </button>
        ))}
      </div>

      <Label>Color</Label>
      <div className="flex gap-3">
        {COLORS.map((c) => (
          <button key={c} onClick={() => set({ color: c })} aria-label={c}
            className={`h-9 w-9 rounded-full ${h.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ background: c }} />
        ))}
      </div>

      <Label>Categoría</Label>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => set({ category: c.id })} className={chip(h.category === c.id)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <Label>Frecuencia</Label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(FREQ).map(([k, v]) => (
          <button key={k} onClick={() => setF({ type: k })} className={chip(f.type === k)}>{v}</button>
        ))}
      </div>

      {f.type === 'weekdays' && (
        <div className="mt-3 flex justify-between">
          {WEEKDAYS_SHORT.map((d, i) => (
            <button key={i} onClick={() => setF({ days: toggleIn(f.days, i) })}
              className={`h-10 w-10 rounded-full font-semibold ${f.days.includes(i) ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {d}
            </button>
          ))}
        </div>
      )}
      {f.type === 'timesPerWeek' && (
        <Stepper value={f.times} min={1} max={7} onChange={(v) => setF({ times: v })} suffix="veces por semana" />
      )}
      {f.type === 'everyNDays' && (
        <Stepper value={f.interval} min={1} max={60} onChange={(v) => setF({ interval: v })} prefix="Cada" suffix="días" />
      )}
      {f.type === 'monthly' && (
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <button key={d} onClick={() => setF({ monthDays: toggleIn(f.monthDays, d) })}
              className={`h-9 rounded-lg text-sm ${f.monthDays.includes(d) ? 'bg-emerald-500 font-semibold text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {d}
            </button>
          ))}
        </div>
      )}

      <Label>Meta por día</Label>
      <div className="flex items-center gap-3">
        <Stepper value={Number(h.target) || 1} min={1} max={999} onChange={(v) => set({ target: v })} inline />
        <input className={`${input} flex-1`} value={h.unit} maxLength={20} placeholder="unidad (vasos, min…)"
          onChange={(e) => set({ unit: e.target.value })} />
      </div>
      <p className="mt-1 text-xs text-slate-500">Deja 1 para hábitos de sí/no.</p>

      <Label>Recordatorios</Label>
      <div className="space-y-2">
        {h.reminders.map((t, i) => (
          <div key={i} className="flex gap-2">
            <input type="time" className={input} value={t}
              onChange={(e) => set({ reminders: h.reminders.map((x, j) => (j === i ? e.target.value : x)) })} />
            <button onClick={() => set({ reminders: h.reminders.filter((_, j) => j !== i) })}
              className="rounded-xl bg-slate-800 px-4 text-slate-400" aria-label="Quitar">✕</button>
          </div>
        ))}
        <button onClick={() => set({ reminders: [...h.reminders, '12:00'] })}
          className="w-full rounded-xl border border-dashed border-slate-700 py-2.5 text-slate-400">
          + Agregar hora
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Las notificaciones se activan en la próxima actualización.</p>

      <Label>Empieza el</Label>
      <input type="date" className={input} value={h.startDate} onChange={(e) => set({ startDate: e.target.value || todayKey() })} />

      {error && <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-red-300">{error}</p>}
      <div className="h-4" />
    </Sheet>
  );
}

function Stepper({ value, min, max, onChange, prefix, suffix, inline }) {
  const btn = 'h-10 w-10 rounded-full bg-slate-800 text-xl';
  return (
    <div className={`flex items-center gap-3 ${inline ? '' : 'mt-3'}`}>
      {prefix && <span className="text-slate-300">{prefix}</span>}
      <button className={btn} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="w-8 text-center text-lg font-semibold">{value}</span>
      <button className={btn} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      {suffix && <span className="text-slate-300">{suffix}</span>}
    </div>
  );
}

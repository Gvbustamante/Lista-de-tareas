const TABS = [
  { id: 'today', label: 'Hoy', icon: '✅' },
  { id: 'habits', label: 'Hábitos', icon: '📋' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-0.5 pt-2 text-xs ${tab === t.id ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { useStore } from './lib/store.js';
import BottomNav from './components/BottomNav.jsx';
import TodayView from './components/TodayView.jsx';
import HabitsView from './components/HabitsView.jsx';
import SettingsView from './components/SettingsView.jsx';
import HabitForm from './components/HabitForm.jsx';

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState('today');
  const [editing, setEditing] = useState(undefined); // undefined = cerrado, null = nuevo, objeto = editar

  if (!store.ready) return <div className="grid h-full place-items-center text-slate-500">Cargando…</div>;

  const openNew = () => setEditing(null);

  return (
    <>
      {tab === 'today' && <TodayView habits={store.habits} logs={store.logs} setLog={store.setLog} onNew={openNew} />}
      {tab === 'habits' && (
        <HabitsView habits={store.habits} onEdit={setEditing} onNew={openNew} saveHabit={store.saveHabit} reorder={store.reorder} />
      )}
      {tab === 'settings' && <SettingsView exportData={store.exportData} importData={store.importData} />}
      <BottomNav tab={tab} onChange={setTab} />
      {editing !== undefined && (
        <HabitForm
          habit={editing}
          onClose={() => setEditing(undefined)}
          onSave={async (h) => { await store.saveHabit(h); setEditing(undefined); }}
          onDelete={async (id) => { await store.removeHabit(id); setEditing(undefined); }}
        />
      )}
    </>
  );
}

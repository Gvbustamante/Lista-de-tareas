import { useEffect, useRef, useState } from 'react';

export default function SettingsView({ exportData, importData }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [installEvt, setInstallEvt] = useState(null);
  const standalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `habitos-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('✅ Respaldo descargado.');
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Esto reemplaza TODOS tus datos actuales. ¿Continuar?')) return;
    try {
      await importData(JSON.parse(await file.text()));
      setMsg('✅ Datos restaurados.');
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const card = 'rounded-2xl border border-slate-800 bg-slate-900 p-4';
  const btn = 'w-full rounded-xl bg-slate-800 py-3 font-medium';

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {!standalone && (
        <section className={card}>
          <h2 className="mb-1 font-semibold">📲 Instalar en el celular</h2>
          {installEvt ? (
            <button className={`${btn} mt-2 bg-emerald-500 text-slate-950`} onClick={async () => { installEvt.prompt(); await installEvt.userChoice; setInstallEvt(null); }}>
              Instalar app
            </button>
          ) : (
            <p className="text-sm text-slate-400">En Chrome: menú ⋮ → <b>Instalar aplicación</b> (o “Agregar a pantalla principal”).</p>
          )}
        </section>
      )}

      <section className={card}>
        <h2 className="mb-1 font-semibold">💾 Respaldo</h2>
        <p className="mb-3 text-sm text-slate-400">Tus datos viven en este celular. Descarga un respaldo de vez en cuando.</p>
        <div className="space-y-2">
          <button className={btn} onClick={doExport}>Descargar respaldo</button>
          <button className={btn} onClick={() => fileRef.current?.click()}>Restaurar respaldo</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
        </div>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </section>

      <section className={card}>
        <h2 className="mb-1 font-semibold">🔔 Notificaciones</h2>
        <p className="text-sm text-slate-400">Próxima actualización (Fase 2): avisos a la hora de cada recordatorio con botones “Hecho” y “Recordar en 15 min”.</p>
      </section>

      <p className="pt-4 text-center text-xs text-slate-600">Mis Hábitos · v1.0</p>
    </div>
  );
}

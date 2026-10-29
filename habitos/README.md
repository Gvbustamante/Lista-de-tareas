# Mis Hábitos (PWA)

App personal de hábitos instalable en Android.

## Desarrollo
```bash
cd habitos
npm install
npm run dev     # local
npm test        # pruebas de frecuencias
npm run build   # genera dist/
```

## Fases
- [x] **1** Hábitos con frecuencias (diario, días específicos, X por semana, cada N días, mensual), pantalla Hoy, metas con cantidad, saltar día, pausar, archivar, ordenar, respaldo, instalable.
- [ ] **2** Notificaciones push (Supabase + Web Push) con botones Hecho / Recordar en 15 min.
- [ ] **3** Rachas, calendario mapa de calor, estadísticas.
- [ ] **4** Rutinas, plantillas, notas/foto, resumen semanal.

Datos: IndexedDB local (accesible desde el service worker para la fase 2).

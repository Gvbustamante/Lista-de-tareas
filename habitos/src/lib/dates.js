// Fechas locales como 'YYYY-MM-DD' (sin zona horaria) para evitar desfases.
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

// Días enteros entre dos claves (b - a).
export const diffDays = (a, b) => {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
};

// 0 = lunes ... 6 = domingo
export const weekdayMon = (key) => (fromKey(key).getDay() + 6) % 7;

export const weekStart = (key) => addDays(key, -weekdayMon(key));

export const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const formatLong = (key) =>
  fromKey(key).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

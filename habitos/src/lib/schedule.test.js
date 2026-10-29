import { describe, expect, it } from 'vitest';
import { isDue, isComplete, logKey, weekProgress } from './schedule.js';
import { addDays, diffDays, weekdayMon, weekStart } from './dates.js';

const H = (frequency, extra = {}) => ({ id: 'h', target: 1, startDate: '2026-01-01', frequency, ...extra });
const done = (date, value = 1) => ({ [logKey('h', date)]: { id: logKey('h', date), habitId: 'h', date, status: 'done', value } });

describe('dates', () => {
  it('lunes = 0', () => expect(weekdayMon('2026-10-26')).toBe(0)); // lunes
  it('domingo = 6', () => expect(weekdayMon('2026-11-01')).toBe(6));
  it('semana empieza lunes', () => expect(weekStart('2026-10-29')).toBe('2026-10-26'));
  it('cruza mes y DST', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(diffDays('2026-03-01', '2026-04-01')).toBe(31);
  });
});

describe('isDue', () => {
  it('diario', () => expect(isDue(H({ type: 'daily' }), '2026-10-29')).toBe(true));
  it('antes de empezar no toca', () => expect(isDue(H({ type: 'daily' }), '2025-12-31')).toBe(false));
  it('archivado no toca', () => expect(isDue(H({ type: 'daily' }, { archived: true }), '2026-10-29')).toBe(false));
  it('pausado', () => {
    const h = H({ type: 'daily' }, { pausedUntil: '2026-10-30' });
    expect(isDue(h, '2026-10-30')).toBe(false);
    expect(isDue(h, '2026-10-31')).toBe(true);
  });
  it('días específicos', () => {
    const h = H({ type: 'weekdays', days: [0, 2] }); // lun, mié
    expect(isDue(h, '2026-10-26')).toBe(true);
    expect(isDue(h, '2026-10-27')).toBe(false);
    expect(isDue(h, '2026-10-28')).toBe(true);
  });
  it('cada N días', () => {
    const h = H({ type: 'everyNDays', interval: 3 }, { startDate: '2026-10-01' });
    expect(isDue(h, '2026-10-01')).toBe(true);
    expect(isDue(h, '2026-10-02')).toBe(false);
    expect(isDue(h, '2026-10-04')).toBe(true);
  });
  it('mensual con día 31 en mes de 30', () => {
    const h = H({ type: 'monthly', monthDays: [31] });
    expect(isDue(h, '2026-11-30')).toBe(true);
    expect(isDue(h, '2026-11-29')).toBe(false);
    expect(isDue(h, '2026-10-31')).toBe(true);
  });
  it('veces por semana', () => {
    const h = H({ type: 'timesPerWeek', times: 2 });
    const logs = { ...done('2026-10-26'), ...done('2026-10-27') };
    expect(isDue(h, '2026-10-28', logs)).toBe(false); // ya cumplió 2
    expect(isDue(h, '2026-10-27', logs)).toBe(true); // el día marcado sigue visible
    expect(isDue(h, '2026-11-02', logs)).toBe(true); // nueva semana
    expect(weekProgress(h, '2026-10-29', logs)).toBe(2);
  });
});

describe('isComplete', () => {
  it('con meta', () => {
    const h = H({ type: 'daily' }, { target: 3 });
    expect(isComplete(h, done('2026-10-29', 2)[logKey('h', '2026-10-29')])).toBe(false);
    expect(isComplete(h, done('2026-10-29', 3)[logKey('h', '2026-10-29')])).toBe(true);
  });
  it('saltado no cuenta', () => expect(isComplete(H({}), { status: 'skipped', value: 0 })).toBe(false));
});

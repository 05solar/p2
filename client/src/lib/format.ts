import type { AttendanceStatus } from './types';

export const statusLabel = (s: AttendanceStatus): string =>
  ({ present: '출석', late: '지각', absent: '결석', pending: '미출석' })[s];

export type Tone = 'ok' | 'warn' | 'danger' | 'mute' | 'brand';

export const statusTone = (s: AttendanceStatus): Tone =>
  ({ present: 'ok', late: 'warn', absent: 'danger', pending: 'mute' } as const)[s];

// 초 → "MM:SS"
export const mmss = (totalSeconds: number): string => {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ISO → "오후 1:42"
export const clockKo = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  h = h % 12 || 12;
  return `${ampm} ${h}:${String(m).padStart(2, '0')}`;
};

// ISO → "11:05:12"
export const clock = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
};

export const todayKo = (): string => {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}  ·  ${days[d.getDay()]}요일`;
};

export const methodLabel = (m: string): string =>
  ({ auto: '자동 · BLE+GPS', qr: 'QR 인증', code: '인증번호', manual: '수동 처리' } as Record<string, string>)[m] || m || '';

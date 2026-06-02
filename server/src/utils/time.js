export const nowISO = () => new Date().toISOString();

// 'YYYY-MM-DD' (로컬 기준)
export const todayStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 'HH:MM:SS'
export const clockStr = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
};

// 두 ISO 시각 사이 경과 분 (소수)
export const minutesBetween = (fromISO, toISO = nowISO()) =>
  (new Date(toISO).getTime() - new Date(fromISO).getTime()) / 60000;

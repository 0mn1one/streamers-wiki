export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return '';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const wk = Math.round(day / 7);
  const mo = Math.round(day / 30);
  const yr = Math.round(day / 365);
  if (sec < 60) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 14) return `${day}d ago`;
  if (wk < 9) return `${wk}w ago`;
  if (mo < 18) return `${mo}mo ago`;
  return `${yr}y ago`;
}

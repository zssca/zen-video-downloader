export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function formatDurationMs(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  if (clamped < 1000) return `${clamped}ms`;

  const s = Math.round(clamped / 1000);
  if (s < 60) return `${s}s`;

  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

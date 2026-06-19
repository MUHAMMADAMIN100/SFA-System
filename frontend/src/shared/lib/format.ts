function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function fmtUSD(n: number, compact = false): string {
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function fmtDate(d: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

export function fmtDateTime(d: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

export function fmtShortDate(d: string): string {
  // "2026-03-15" → "15 Mar"
  const dt = new Date(d);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(dt);
}

export function utilizationColor(pct: number): string {
  if (pct >= 90) return 'text-red-600';
  if (pct >= 75) return 'text-orange-500';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-green-600';
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    SUCCESS:   'bg-green-100 text-green-800',
    FAILED:    'bg-red-100 text-red-800',
    PENDING:   'bg-yellow-100 text-yellow-800',
    PARTIAL:   'bg-orange-100 text-orange-800',
    REVERSED:  'bg-gray-100 text-gray-700',
    RUNNING:   'bg-blue-100 text-blue-800',
    STOPPED:   'bg-gray-100 text-gray-700',
    COMPLETED: 'bg-green-100 text-green-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

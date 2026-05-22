export function formatPrice(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChangePct(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function changeColorClass(value) {
  if (value == null || value === 0) return 'text-zinc-400';
  return value > 0 ? 'text-gain' : 'text-loss';
}

export function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function formatKrw(value, options = {}) {
  const { compact = false, signed = false } = options;
  if (value == null || Number.isNaN(value)) return '—';

  const prefix = signed && value > 0 ? '+' : '';
  const abs = Math.abs(value);

  if (compact && abs >= 100_000_000) {
    return `${prefix}${(value / 100_000_000).toFixed(2)}억`;
  }
  if (compact && abs >= 10_000) {
    return `${prefix}${(value / 10_000).toFixed(0)}만`;
  }

  return `${prefix}${Math.round(value).toLocaleString('ko-KR')}원`;
}

export function formatQuantity(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('ko-KR');
}

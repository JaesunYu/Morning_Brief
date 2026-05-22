import { changeColorClass, formatChangePct, formatPrice } from '../utils/format.js';

export default function QuoteCard({
  label,
  sublabel,
  price,
  changePct,
  unit,
  decimals = 2,
  source,
  highlight = false,
  compact = false,
}) {
  const colorClass = changeColorClass(changePct);

  return (
    <article
      className={[
        'rounded-lg border bg-panel/80 backdrop-blur-sm transition-colors',
        highlight
          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'border-border hover:border-zinc-500/60',
        compact ? 'p-3' : 'p-3.5',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </h3>
          {sublabel && (
            <p className="mt-0.5 truncate text-[10px] text-zinc-500">{sublabel}</p>
          )}
        </div>
        {source === 'fallback' && (
          <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400/90">
            DEMO
          </span>
        )}
      </div>

      <p
        className={[
          'mt-2 font-mono font-semibold tabular-nums text-zinc-50',
          compact ? 'text-lg' : 'text-xl',
        ].join(' ')}
      >
        {formatPrice(price, decimals)}
        {unit && (
          <span className="ml-1 text-[10px] font-normal text-zinc-500">{unit}</span>
        )}
      </p>

      <p className={`mt-1 font-mono text-sm font-medium tabular-nums ${colorClass}`}>
        {formatChangePct(changePct)}
        <span className="ml-1.5 text-[10px] font-normal text-zinc-500">1D</span>
      </p>
    </article>
  );
}

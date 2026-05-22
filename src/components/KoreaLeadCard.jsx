import { changeColorClass, formatChangePct, formatPrice } from '../utils/format.js';

export default function KoreaLeadCard({ quote, loading }) {
  const colorClass = changeColorClass(quote?.changePct);

  return (
    <section className="relative overflow-hidden rounded-xl border-2 border-emerald-500/35 bg-gradient-to-br from-emerald-950/40 via-panel to-zinc-900 p-4 shadow-lg shadow-emerald-950/30">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
            Pre-Market Lead
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-zinc-50 sm:text-xl">
            국장 선행 지표 (MSCI Korea)
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">EWY · iShares MSCI South Korea ETF</p>
        </div>
        {quote?.source === 'fallback' && (
          <span className="rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-300">
            Fallback data
          </span>
        )}
      </div>

      {loading && !quote ? (
        <div className="relative mt-4 h-14 animate-pulse-soft rounded-lg bg-surface" />
      ) : (
        <div className="relative mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-3xl font-bold tabular-nums text-zinc-50 sm:text-4xl">
            ${formatPrice(quote?.price, 2)}
          </span>
          <span className={`font-mono text-xl font-semibold tabular-nums sm:text-2xl ${colorClass}`}>
            {formatChangePct(quote?.changePct)}
            <span className="ml-2 text-sm font-normal text-zinc-500">1D</span>
          </span>
        </div>
      )}

      <p className="relative mt-3 text-[11px] leading-relaxed text-zinc-500">
        US-listed Korea proxy — use as overnight sentiment read before KOSPI open.
      </p>
    </section>
  );
}

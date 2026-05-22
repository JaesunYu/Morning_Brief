import { getFearGreedBand } from '../services/fearGreed.js';

export default function FearGreedCard({ data, loading }) {
  const score = data?.score ?? null;
  const band = score != null ? getFearGreedBand(score) : null;
  const isSimulated = data?.source === 'simulated';

  return (
    <section className="rounded-lg border border-border bg-panel/80 p-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            CNN Fear & Greed
          </h2>
          <p className="text-[10px] text-zinc-500">Market Sentiment</p>
        </div>
        {isSimulated && (
          <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-300">
            MODEL
          </span>
        )}
        {data?.source === 'cnn' && (
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
            LIVE
          </span>
        )}
      </div>

      {loading && score == null ? (
        <div className="mt-4 h-16 animate-pulse-soft rounded bg-surface" />
      ) : (
        <>
          <div className="mt-3 flex items-end gap-3">
            <span
              className="font-mono text-4xl font-bold tabular-nums leading-none"
              style={{ color: band?.color ?? '#a1a1aa' }}
            >
              {score ?? '—'}
            </span>
            <span
              className="mb-1 text-sm font-semibold"
              style={{ color: band?.color ?? '#a1a1aa' }}
            >
              {band?.label ?? 'Loading'}
            </span>
          </div>

          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width: `${score ?? 0}%`,
                background:
                  'linear-gradient(90deg, #fb7185 0%, #fbbf24 35%, #a1a1aa 50%, #4ade80 75%, #34d399 100%)',
                opacity: 0.35,
              }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-zinc-950 shadow-lg transition-all duration-700"
              style={{
                left: `calc(${Math.min(100, Math.max(0, score ?? 0))}% - 6px)`,
                backgroundColor: band?.color ?? '#71717a',
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[9px] text-zinc-600">
            <span>Fear</span>
            <span>Neutral</span>
            <span>Greed</span>
          </div>

          {isSimulated && data?.components && (
            <p className="mt-2 text-[10px] leading-snug text-zinc-500">
              VIX model {data.components.vixScore} · momentum{' '}
              {data.components.momentumScore}
            </p>
          )}
        </>
      )}
    </section>
  );
}

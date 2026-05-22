import { formatTime } from '../utils/format.js';

export default function Header({ lastUpdated, loading, onRefresh }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-500/80">
          Financial Morning Briefing
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Dawn Market Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right text-[11px] text-zinc-500">
          <p>Updated {formatTime(lastUpdated)}</p>
          {loading && (
            <p className="mt-0.5 animate-pulse-soft text-emerald-400/80">Refreshing…</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </header>
  );
}

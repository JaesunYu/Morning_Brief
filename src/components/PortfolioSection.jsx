import SectionTitle from './SectionTitle.jsx';
import {
  changeColorClass,
  formatChangePct,
  formatKrw,
  formatQuantity,
  formatTime,
} from '../utils/format.js';

function SummaryCard({ label, value, subValue, subColorClass, loading }) {
  return (
    <div className="rounded-xl border border-border bg-panel/90 p-4 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      {loading ? (
        <p className="mt-2 animate-pulse-soft font-mono text-2xl text-zinc-600">…</p>
      ) : (
        <>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-zinc-50 sm:text-3xl">
            {value}
          </p>
          {subValue != null && (
            <p
              className={`mt-1 font-mono text-sm font-semibold tabular-nums ${subColorClass}`}
            >
              {subValue}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function HoldingRow({ row, loading }) {
  const pnlColor = changeColorClass(row.todayPnL);
  const pctColor = changeColorClass(row.changePct);

  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-zinc-900/40">
      <td className="px-3 py-2.5">
        <p className="text-sm font-medium text-zinc-100">{row.name}</p>
        {row.isEstimate && (
          <p className="mt-0.5 text-[10px] text-amber-400/90">
            추정 · {row.proxyNote ?? '유사상품'}
          </p>
        )}
        {row.source === 'fallback' && (
          <span className="mt-0.5 inline-block rounded bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-400">
            DEMO
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-zinc-400">
        {formatQuantity(row.quantity)}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-zinc-200">
        {loading ? '…' : formatKrw(row.price, { compact: false })}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-zinc-50">
        {loading ? '…' : formatKrw(row.marketValue)}
      </td>
      <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold tabular-nums ${pnlColor}`}>
        {loading ? '…' : formatKrw(row.todayPnL, { signed: true })}
      </td>
      <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${pctColor}`}>
        {loading ? '…' : formatChangePct(row.changePct)}
      </td>
    </tr>
  );
}

function AccountTable({ account, loading }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-panel/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-zinc-900/50 px-4 py-3">
        <h3 className="text-sm font-bold text-zinc-100">{account.label}</h3>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">계좌 평가</p>
            <p className="font-mono text-sm font-semibold tabular-nums text-zinc-100">
              {loading ? '…' : formatKrw(account.accountValue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">오늘 손익</p>
            <p
              className={`font-mono text-sm font-semibold tabular-nums ${changeColorClass(account.accountPnL)}`}
            >
              {loading ? '…' : formatKrw(account.accountPnL, { signed: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-semibold">종목</th>
              <th className="px-3 py-2 text-right font-semibold">보유</th>
              <th className="px-3 py-2 text-right font-semibold">현재가</th>
              <th className="px-3 py-2 text-right font-semibold">평가금액</th>
              <th className="px-3 py-2 text-right font-semibold">오늘 손익</th>
              <th className="px-3 py-2 text-right font-semibold">등락</th>
            </tr>
          </thead>
          <tbody>
            {account.holdings.map((row) => (
              <HoldingRow key={row.id} row={row} loading={loading} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PortfolioSection({
  summary,
  accounts,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) {
  const totalColor = changeColorClass(summary?.totalTodayPnL);
  const pctColor = changeColorClass(summary?.totalChangePct);

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionTitle accent="#60a5fa">내 실시간 포트폴리오 현황</SectionTitle>
          <p className="text-[11px] text-zinc-500">
            Yahoo Finance 실시간 · 투자신탁은 유사 ETF로 추정 기준가 반영
            {lastUpdated && (
              <span className="ml-2 text-zinc-600">
                갱신 {formatTime(lastUpdated)}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
        >
          포트폴리오 새로고침
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryCard
          label="총 자산 평가액"
          value={formatKrw(summary?.totalValue)}
          subValue={
            summary?.loadedCount != null
              ? `${summary.loadedCount}/${summary.totalCount} 종목 반영`
              : null
          }
          subColorClass="text-zinc-500"
          loading={loading && !summary}
        />
        <SummaryCard
          label="오늘 총 손익 변동"
          value={formatKrw(summary?.totalTodayPnL, { signed: true })}
          subValue={
            summary?.totalChangePct != null
              ? `${formatChangePct(summary.totalChangePct)} (전일 대비)`
              : null
          }
          subColorClass={totalColor}
          loading={loading && !summary}
        />
      </div>

      {summary?.totalChangePct != null && !loading && (
        <p className={`mt-2 text-center font-mono text-xs tabular-nums ${pctColor}`}>
          포트폴리오 전체 등락 {formatChangePct(summary.totalChangePct)}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4">
        {(accounts ?? []).map((account) => (
          <AccountTable key={account.id} account={account} loading={loading} />
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-zinc-600">
        DC·연금 투자신탁 평가는{' '}
        <code className="text-zinc-500">src/services/portfolioConfig.js</code>의 baseNav를
        펀드 기준가에 맞게 주기적으로 갱신하면 정확도가 올라갑니다.
      </p>
    </section>
  );
}

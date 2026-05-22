import FearGreedCard from './components/FearGreedCard.jsx';
import Header from './components/Header.jsx';
import KoreaLeadCard from './components/KoreaLeadCard.jsx';
import PortfolioSection from './components/PortfolioSection.jsx';
import QuoteCard from './components/QuoteCard.jsx';
import SectionTitle from './components/SectionTitle.jsx';
import { useMarketData } from './hooks/useMarketData.js';
import { usePortfolioData } from './hooks/usePortfolioData.js';

const STRIP_ITEMS = [
  { key: 'ewy', label: 'EWY Korea', highlight: true },
  { key: 'sp500', label: 'S&P 500' },
  { key: 'ndx', label: 'Nasdaq' },
  { key: 'soxx', label: 'SOXX' },
  { key: 'soxl', label: 'SOXL' },
  { key: 'wti', label: 'WTI' },
];

export default function App() {
  const { quotes, fearGreed, loading, error, lastUpdated, refresh } = useMarketData();
  const portfolio = usePortfolioData();
  const q = quotes ?? {};

  const handleRefreshAll = () => {
    refresh();
    portfolio.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/80 via-zinc-950 to-zinc-950" />

      <main className="relative mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <Header
          lastUpdated={lastUpdated}
          loading={loading || portfolio.loading}
          onRefresh={handleRefreshAll}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {error}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-3">
          <div className="lg:col-span-5">
            <KoreaLeadCard quote={q.ewy} loading={loading} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-4">
            <FearGreedCard data={fearGreed} loading={loading} />
            <div className="grid grid-cols-2 gap-2">
              <QuoteCard
                label="WTI Crude"
                sublabel="Macro"
                price={q.wti?.price}
                changePct={q.wti?.changePct}
                unit="USD"
                decimals={2}
                source={q.wti?.source}
                compact
              />
              <QuoteCard
                label="USD/KRW"
                sublabel="Macro"
                price={q.usdkrw?.price}
                changePct={q.usdkrw?.changePct}
                unit="₩"
                decimals={2}
                source={q.usdkrw?.source}
                compact
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <SectionTitle accent="#34d399">US Markets</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <QuoteCard
                label="S&P 500"
                price={q.sp500?.price}
                changePct={q.sp500?.changePct}
                decimals={2}
                source={q.sp500?.source}
                compact
              />
              <QuoteCard
                label="Nasdaq 100"
                price={q.ndx?.price}
                changePct={q.ndx?.changePct}
                decimals={2}
                source={q.ndx?.source}
                compact
              />
              <QuoteCard
                label="SOXX"
                sublabel="Semi ETF"
                price={q.soxx?.price}
                changePct={q.soxx?.changePct}
                decimals={2}
                source={q.soxx?.source}
                compact
              />
              <QuoteCard
                label="SOXL"
                sublabel="3X Bull"
                price={q.soxl?.price}
                changePct={q.soxl?.changePct}
                decimals={2}
                source={q.soxl?.source}
                compact
              />
            </div>
          </div>
        </div>

        <div className="mt-3 hidden border-t border-border/50 pt-3 lg:block">
          <SectionTitle>At-a-glance strip</SectionTitle>
          <div className="grid grid-cols-6 gap-2">
            {STRIP_ITEMS.map(({ key, label, highlight }) => (
              <QuoteCard
                key={key}
                label={label}
                price={q[key]?.price}
                changePct={q[key]?.changePct}
                decimals={2}
                source={q[key]?.source}
                highlight={highlight}
                compact
              />
            ))}
          </div>
        </div>

        <PortfolioSection
          summary={portfolio.summary}
          accounts={portfolio.accounts}
          loading={portfolio.loading}
          error={portfolio.error}
          lastUpdated={portfolio.lastUpdated}
          onRefresh={portfolio.refresh}
        />

        <footer className="mt-6 border-t border-border/40 pt-3 text-center text-[10px] text-zinc-600">
          Live data via Vercel /api/market (Yahoo + CNN) · per-symbol proxy fallback ·
          portfolio auto-refresh 2m · Not investment advice
        </footer>
      </main>
    </div>
  );
}

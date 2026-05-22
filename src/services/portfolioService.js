import { fetchYahooQuote } from './yahooFinance.js';
import {
  flattenHoldings,
  getPortfolioSymbolConfigs,
  PORTFOLIO_ACCOUNTS,
} from './portfolioConfig.js';

function computeListedMetrics(holding, quote) {
  if (!quote?.price) {
    return {
      price: null,
      marketValue: null,
      todayPnL: null,
      changePct: null,
      source: null,
    };
  }

  const marketValue = quote.price * holding.quantity;
  const todayPnL = (quote.change ?? 0) * holding.quantity;

  return {
    price: quote.price,
    marketValue,
    todayPnL,
    changePct: quote.changePct,
    source: quote.source,
    isEstimate: false,
  };
}

function computeFundMetrics(holding, quote) {
  if (!quote?.price || !holding.baseNav) {
    return {
      price: null,
      marketValue: null,
      todayPnL: null,
      changePct: null,
      source: null,
      isEstimate: true,
    };
  }

  const ratio = quote.price / (quote.prevClose ?? quote.price);
  const navNow = holding.baseNav * ratio;
  const navPrev = holding.baseNav;
  const marketValue = navNow * holding.quantity;
  const todayPnL = (navNow - navPrev) * holding.quantity;

  return {
    price: navNow,
    marketValue,
    todayPnL,
    changePct: quote.changePct,
    source: quote.source,
    isEstimate: true,
    proxyNote: holding.proxyNote,
  };
}

export function enrichHolding(holding, quotesBySymbol) {
  const quote = quotesBySymbol[holding.yahooSymbol] ?? null;
  const metrics =
    holding.type === 'fund'
      ? computeFundMetrics(holding, quote)
      : computeListedMetrics(holding, quote);

  return {
    ...holding,
    ...metrics,
    quote,
  };
}

export function summarizePortfolio(rows) {
  const withValue = rows.filter((r) => r.marketValue != null);
  const totalValue = withValue.reduce((sum, r) => sum + r.marketValue, 0);
  const totalTodayPnL = withValue.reduce(
    (sum, r) => sum + (r.todayPnL ?? 0),
    0,
  );
  const prevValue = totalValue - totalTodayPnL;
  const totalChangePct =
    prevValue > 0 ? (totalTodayPnL / prevValue) * 100 : null;

  return {
    totalValue,
    totalTodayPnL,
    totalChangePct,
    loadedCount: withValue.length,
    totalCount: rows.length,
  };
}

export async function fetchPortfolioQuotes() {
  const configs = getPortfolioSymbolConfigs();
  const entries = await Promise.all(
    configs.map(async (config) => {
      const quote = await fetchYahooQuote(config.symbol, config);
      return [config.symbol, quote];
    }),
  );

  return Object.fromEntries(entries);
}

export function buildPortfolioView(quotesBySymbol) {
  const rows = flattenHoldings().map((holding) =>
    enrichHolding(holding, quotesBySymbol),
  );

  const summary = summarizePortfolio(rows);

  const accounts = PORTFOLIO_ACCOUNTS.map((account) => {
    const holdings = rows.filter((r) => r.accountId === account.id);
    const accountValue = holdings.reduce(
      (sum, r) => sum + (r.marketValue ?? 0),
      0,
    );
    const accountPnL = holdings.reduce(
      (sum, r) => sum + (r.todayPnL ?? 0),
      0,
    );

    return {
      ...account,
      holdings,
      accountValue,
      accountPnL,
    };
  });

  return { summary, accounts, rows };
}

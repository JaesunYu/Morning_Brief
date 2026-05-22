import { QUOTE_KEYS, SYMBOL_CONFIG, FALLBACK_QUOTES } from './marketConfig.js';
import { fetchFearGreed } from './fearGreed.js';
import { fetchQuoteByKey } from './yahooFinance.js';

const MARKET_API = '/api/market';
const FETCH_TIMEOUT_MS = 28_000;

function buildQuoteFromAggregate(key, row) {
  const config = SYMBOL_CONFIG[key];
  if (!row || !config) return null;

  return {
    symbol: config.symbol,
    label: config.label,
    unit: config.unit,
    decimals: config.decimals,
    price: row.price,
    change: row.change,
    changePct: row.changePct,
    prevClose: row.prevClose,
    currency: row.currency ?? (key === 'usdkrw' ? 'KRW' : 'USD'),
    marketState: row.marketState ?? 'UNKNOWN',
    source: row.source ?? 'live',
  };
}

function buildFallbackQuote(key) {
  const fallback = FALLBACK_QUOTES[key];
  const config = SYMBOL_CONFIG[key];
  if (!fallback || !config) return null;

  const changePct = fallback.changePct;
  const price = fallback.price;
  const prevClose = price / (1 + changePct / 100);

  return {
    symbol: config.symbol,
    label: config.label,
    unit: config.unit,
    decimals: config.decimals,
    price,
    change: price - prevClose,
    changePct,
    prevClose,
    currency: key === 'usdkrw' ? 'KRW' : 'USD',
    marketState: 'CLOSED',
    source: 'fallback',
  };
}

async function fetchMarketBundle() {
  const response = await fetch(MARKET_API, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const json = await response.json();
  const quotes = {};

  for (const key of QUOTE_KEYS) {
    quotes[key] =
      buildQuoteFromAggregate(key, json.quotes?.[key]) ?? buildFallbackQuote(key);
  }

  return {
    quotes,
    fearGreed: json.fearGreed ?? null,
  };
}

/**
 * Prefer Vercel /api/market (server-side fetch with browser headers).
 * Falls back to per-symbol client proxies if the bundle endpoint fails.
 */
export async function fetchMarketData() {
  try {
    const bundle = await fetchMarketBundle();
    if (bundle) {
      const fearGreed =
        bundle.fearGreed ??
        (await fetchFearGreed(bundle.quotes));

      return {
        quotes: bundle.quotes,
        fearGreed,
      };
    }
  } catch {
    // fall through to legacy per-symbol fetch
  }

  const quotes = {};
  await Promise.all(
    QUOTE_KEYS.map(async (key) => {
      quotes[key] = await fetchQuoteByKey(key);
    }),
  );

  const fearGreed = await fetchFearGreed(quotes);
  return { quotes, fearGreed };
}

import { FALLBACK_QUOTES, SYMBOL_CONFIG } from './marketConfig.js';

const YAHOO_API_BASE = '/api/yahoo/v8/finance/chart';
const CORS_PROXY_PREFIX = 'https://corsproxy.io/?';

const FETCH_TIMEOUT_MS = 12_000;

function buildSameOriginUrl(symbol) {
  const encoded = encodeURIComponent(symbol);
  return `${YAHOO_API_BASE}/${encoded}?interval=1d&range=5d`;
}

function buildCorsProxyUrl(symbol) {
  const upstream = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  return `${CORS_PROXY_PREFIX}${encodeURIComponent(upstream)}`;
}

function parseYahooChart(payload, config) {
  const result = payload?.chart?.result?.[0];
  if (!result) return null;

  const quote = result.indicators?.quote?.[0];
  const closes = quote?.close?.filter((v) => v != null) ?? [];

  let price = result.meta?.regularMarketPrice ?? closes[closes.length - 1];
  let prevClose =
    result.meta?.chartPreviousClose ?? result.meta?.previousClose;

  if (closes.length >= 2 && (price == null || prevClose == null)) {
    price = price ?? closes[closes.length - 1];
    prevClose = prevClose ?? closes[closes.length - 2];
  }

  if (price == null) return null;

  const change = prevClose != null ? price - prevClose : 0;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  return {
    symbol: config.symbol,
    label: config.label,
    unit: config.unit,
    decimals: config.decimals,
    price,
    change,
    changePct,
    prevClose: prevClose ?? price,
    currency: result.meta?.currency ?? 'USD',
    marketState: result.meta?.marketState ?? 'UNKNOWN',
    source: 'live',
  };
}

async function fetchFromUrl(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return null;

  const json = await response.json();
  return json;
}

/**
 * Tries same-origin Vercel/dev proxy first, then public CORS proxy (corsproxy.io).
 */
export async function fetchYahooQuote(symbol, config) {
  const urls = [buildSameOriginUrl(symbol), buildCorsProxyUrl(symbol)];

  for (const url of urls) {
    try {
      const json = await fetchFromUrl(url);
      const parsed = parseYahooChart(json, config);
      if (parsed) return parsed;
    } catch {
      // try next source
    }
  }

  return null;
}

export function getFallbackQuote(key) {
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

export async function fetchQuoteByKey(key) {
  const config = SYMBOL_CONFIG[key];
  if (!config) return null;

  const live = await fetchYahooQuote(config.symbol, config);
  return live ?? getFallbackQuote(key);
}

export async function fetchAllQuotes(keys) {
  const results = await Promise.all(keys.map((key) => fetchQuoteByKey(key)));
  return Object.fromEntries(keys.map((key, index) => [key, results[index]]));
}

import { buildBrowserHeaders } from './_lib/proxy.js';

const FETCH_TIMEOUT_MS = 25_000;

const YAHOO_ORIGINS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
];

const YAHOO_HEADERS = buildBrowserHeaders({
  Referer: 'https://finance.yahoo.com/',
  Origin: 'https://finance.yahoo.com',
});

const CNN_URL =
  'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';

const CNN_HEADERS = buildBrowserHeaders({
  Referer: 'https://www.cnn.com/markets/fear-and-greed',
  Origin: 'https://www.cnn.com',
});

const SYMBOLS = {
  wti: 'CL=F',
  usdkrw: 'KRW=X',
  sp500: '^GSPC',
  ndx: '^NDX',
  soxx: 'SOXX',
  soxl: 'SOXL',
  ewy: 'EWY',
  vix: '^VIX',
};

async function fetchText(url, headers) {
  const response = await fetch(url, {
    headers,
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchYahooChart(symbol) {
  const encoded = encodeURIComponent(symbol);
  const query = 'interval=1d&range=5d';
  const errors = [];

  for (const origin of YAHOO_ORIGINS) {
    const url = `${origin}/v8/finance/chart/${encoded}?${query}`;

    try {
      const body = await fetchText(url, YAHOO_HEADERS);
      const json = JSON.parse(body);
      const result = json?.chart?.result?.[0];
      if (result) return { symbol, result };
    } catch (error) {
      errors.push({ origin, message: error?.message ?? 'fetch failed' });
    }
  }

  return { symbol, error: errors };
}

function parseYahooResult(key, symbol, result) {
  const quote = result.indicators?.quote?.[0];
  const closes = quote?.close?.filter((v) => v != null) ?? [];

  let price = result.meta?.regularMarketPrice ?? closes.at(-1);
  let prevClose =
    result.meta?.chartPreviousClose ?? result.meta?.previousClose;

  if (closes.length >= 2 && (price == null || prevClose == null)) {
    price = price ?? closes.at(-1);
    prevClose = prevClose ?? closes.at(-2);
  }

  if (price == null) return null;

  const change = prevClose != null ? price - prevClose : 0;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  return {
    key,
    symbol,
    price,
    change,
    changePct,
    prevClose: prevClose ?? price,
    currency: result.meta?.currency ?? 'USD',
    marketState: result.meta?.marketState ?? 'UNKNOWN',
    source: 'live',
  };
}

async function fetchCnnFearGreed() {
  try {
    const body = await fetchText(CNN_URL, CNN_HEADERS);
    const json = JSON.parse(body);
    const raw =
      json?.fear_and_greed?.score ??
      json?.fear_and_greed_historical?.data?.at(-1)?.y;

    if (raw == null) return null;

    const score = Math.round(Number(raw));
    if (Number.isNaN(score)) return null;

    return {
      score,
      source: 'cnn',
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const entries = await Promise.all(
      Object.entries(SYMBOLS).map(async ([key, symbol]) => {
        const payload = await fetchYahooChart(symbol);
        if (payload.result) {
          const parsed = parseYahooResult(key, symbol, payload.result);
          return [key, parsed];
        }
        return [key, null];
      }),
    );

    const quotes = Object.fromEntries(entries);
    const fearGreed = await fetchCnnFearGreed();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=120');

    return res.status(200).json({
      quotes,
      fearGreed,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Market aggregate fetch failed',
      message: error?.message ?? 'Unknown error',
    });
  }
}

import { average, clamp } from '../utils/format.js';

const CNN_API_PATH = '/api/cnn-fng/index/fearandgreed/graphdata';
const CNN_UPSTREAM =
  'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
const CORS_PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(CNN_UPSTREAM)}`;

const FETCH_TIMEOUT_MS = 10_000;

const SCORE_BANDS = [
  { max: 25, label: 'Extreme Fear', color: '#fb7185' },
  { max: 45, label: 'Fear', color: '#f97316' },
  { max: 55, label: 'Neutral', color: '#a1a1aa' },
  { max: 75, label: 'Greed', color: '#4ade80' },
  { max: 100, label: 'Extreme Greed', color: '#34d399' },
];

export function getFearGreedBand(score) {
  for (const band of SCORE_BANDS) {
    if (score <= band.max) return band;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1];
}

function parseCnnPayload(payload) {
  const raw =
    payload?.fear_and_greed?.score ??
    payload?.fear_and_greed_historical?.data?.at(-1)?.y;

  if (raw == null) return null;

  const score = Math.round(Number(raw));
  if (Number.isNaN(score)) return null;

  return {
    score,
    source: 'cnn',
    updatedAt: new Date().toISOString(),
  };
}

function buildSimulatedScore({ vix, sp500, ndx }) {
  const vixScore =
    vix?.price != null ? clamp(100 - (vix.price - 10) * 4.5, 0, 100) : 50;

  const momentumInputs = [sp500?.changePct, ndx?.changePct].filter((v) => v != null);
  const momentumAvg = average(momentumInputs);
  const momentumScore = clamp(50 + momentumAvg * 12, 0, 100);

  return {
    score: Math.round(vixScore * 0.55 + momentumScore * 0.45),
    source: 'simulated',
    updatedAt: new Date().toISOString(),
    components: {
      vixScore: Math.round(vixScore),
      momentumScore: Math.round(momentumScore),
    },
  };
}

async function fetchCnnLive() {
  const urls = [CNN_API_PATH, CORS_PROXY_URL];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) continue;

      const json = await response.json();
      const parsed = parseCnnPayload(json);
      if (parsed) return parsed;
    } catch {
      // try next source
    }
  }

  return null;
}

export async function fetchFearGreed(quotes) {
  const live = await fetchCnnLive();
  if (live) return live;

  return buildSimulatedScore({
    vix: quotes?.vix,
    sp500: quotes?.sp500,
    ndx: quotes?.ndx,
  });
}

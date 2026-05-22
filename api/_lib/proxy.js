const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FETCH_TIMEOUT_MS = 25_000;

/**
 * Build upstream path with safe per-segment encoding (^GSPC, KRW=X, etc.).
 */
export function buildUpstreamPath(pathSegments) {
  const segments = Array.isArray(pathSegments)
    ? pathSegments
    : pathSegments
      ? [pathSegments]
      : [];

  return segments
    .map((segment) => {
      const raw = String(segment);
      try {
        return encodeURIComponent(decodeURIComponent(raw));
      } catch {
        return encodeURIComponent(raw);
      }
    })
    .join('/');
}

/**
 * Reconstruct query string from req.query, excluding the catch-all `path` key.
 */
export function buildUpstreamSearch(req) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (key === 'path') continue;
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else {
      params.append(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function buildUpstreamUrl(req, upstreamOrigin) {
  const path = buildUpstreamPath(req.query?.path);
  const search = buildUpstreamSearch(req);
  const base = upstreamOrigin.replace(/\/$/, '');
  return path ? `${base}/${path}${search}` : `${base}${search}`;
}

export function buildBrowserHeaders(serviceHeaders = {}) {
  return {
    'User-Agent': BROWSER_UA,
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...serviceHeaders,
  };
}

async function fetchUpstream(url, headers) {
  const response = await fetch(url, {
    headers,
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const body = await response.text();
  return { response, body };
}

/**
 * Vercel serverless proxy: forwards /api/<service>/... to upstream origin(s).
 */
export async function proxyRequest(req, res, options) {
  const {
    upstreamOrigins,
    serviceHeaders = {},
    cacheControl = 's-maxage=60, stale-while-revalidate=300',
  } = options;

  const origins = (
    Array.isArray(upstreamOrigins) ? upstreamOrigins : [upstreamOrigins]
  ).filter(Boolean);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const headers = buildBrowserHeaders(serviceHeaders);
  const errors = [];

  for (const origin of origins) {
    const targetUrl = buildUpstreamUrl(req, origin);

    try {
      const { response, body } = await fetchUpstream(targetUrl, headers);

      if (response.ok && body.length > 0) {
        const contentType =
          response.headers.get('content-type') || 'application/json';

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', cacheControl);
        res.setHeader('X-Upstream-Origin', origin);
        return res.status(response.status).send(body);
      }

      errors.push({
        origin,
        status: response.status,
        message: `Upstream HTTP ${response.status}`,
      });
    } catch (error) {
      errors.push({
        origin,
        message: error?.message ?? 'Unknown error',
      });
    }
  }

  return res.status(502).json({
    error: 'Upstream fetch failed',
    attempts: errors,
  });
}

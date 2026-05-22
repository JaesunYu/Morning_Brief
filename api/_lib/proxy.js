const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json,text/plain,*/*',
};

/**
 * Vercel serverless proxy: forwards /api/<service>/... to an upstream origin.
 */
export async function proxyRequest(req, res, upstreamOrigin) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path: pathSegments } = req.query;
  const path = Array.isArray(pathSegments)
    ? pathSegments.join('/')
    : pathSegments || '';

  const queryIndex = req.url?.indexOf('?') ?? -1;
  const search = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
  const targetUrl = `${upstreamOrigin}/${path}${search}`;

  try {
    const upstream = await fetch(targetUrl, { headers: DEFAULT_HEADERS });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(upstream.status).send(body);
  } catch (error) {
    return res.status(502).json({
      error: 'Upstream fetch failed',
      message: error?.message ?? 'Unknown error',
    });
  }
}

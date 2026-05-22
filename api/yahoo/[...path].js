import { proxyRequest } from '../_lib/proxy.js';

const YAHOO_ORIGINS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
];

const YAHOO_HEADERS = {
  Referer: 'https://finance.yahoo.com/',
  Origin: 'https://finance.yahoo.com',
};

export default function handler(req, res) {
  return proxyRequest(req, res, {
    upstreamOrigins: YAHOO_ORIGINS,
    serviceHeaders: YAHOO_HEADERS,
    cacheControl: 's-maxage=45, stale-while-revalidate=120',
  });
}

import { proxyRequest } from '../_lib/proxy.js';

const CNN_ORIGINS = ['https://production.dataviz.cnn.io'];

const CNN_HEADERS = {
  Referer: 'https://www.cnn.com/markets/fear-and-greed',
  Origin: 'https://www.cnn.com',
};

export default function handler(req, res) {
  return proxyRequest(req, res, {
    upstreamOrigins: CNN_ORIGINS,
    serviceHeaders: CNN_HEADERS,
    cacheControl: 's-maxage=120, stale-while-revalidate=600',
  });
}

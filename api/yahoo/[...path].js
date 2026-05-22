import { proxyRequest } from '../_lib/proxy.js';

export default function handler(req, res) {
  return proxyRequest(req, res, 'https://query1.finance.yahoo.com');
}

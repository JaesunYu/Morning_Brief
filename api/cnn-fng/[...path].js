import { proxyRequest } from '../_lib/proxy.js';

export default function handler(req, res) {
  return proxyRequest(req, res, 'https://production.dataviz.cnn.io');
}

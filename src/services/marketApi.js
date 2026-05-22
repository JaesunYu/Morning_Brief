import { fetchFearGreed } from './fearGreed.js';
import { QUOTE_KEYS } from './marketConfig.js';
import { fetchAllQuotes } from './yahooFinance.js';

export async function fetchMarketData() {
  const quotes = await fetchAllQuotes(QUOTE_KEYS);
  const fearGreed = await fetchFearGreed(quotes);
  return { quotes, fearGreed };
}

export const QUOTE_KEYS = ['wti', 'usdkrw', 'sp500', 'ndx', 'soxx', 'soxl', 'ewy', 'vix'];

export const SYMBOL_CONFIG = {
  wti: { symbol: 'CL=F', label: 'WTI Crude Oil', unit: 'USD/bbl', decimals: 2 },
  usdkrw: { symbol: 'KRW=X', label: 'USD/KRW', unit: 'KRW', decimals: 2 },
  sp500: { symbol: '^GSPC', label: 'S&P 500', unit: 'pts', decimals: 2 },
  ndx: { symbol: '^NDX', label: 'Nasdaq 100', unit: 'pts', decimals: 2 },
  soxx: { symbol: 'SOXX', label: 'SOXX', unit: 'USD', decimals: 2 },
  soxl: { symbol: 'SOXL', label: 'SOXL (3X)', unit: 'USD', decimals: 2 },
  ewy: { symbol: 'EWY', label: 'EWY', unit: 'USD', decimals: 2 },
  vix: { symbol: '^VIX', label: 'VIX', unit: 'pts', decimals: 2 },
};

/** Demo fallback when live Yahoo fetch fails (offline / rate limit). Updated 2026-05-22. */
export const FALLBACK_QUOTES = {
  wti: { price: 98.16, changePct: -9.66, label: 'WTI Crude Oil' },
  usdkrw: { price: 1516.61, changePct: 1.3, label: 'USD/KRW' },
  sp500: { price: 7445.72, changePct: -0.74, label: 'S&P 500' },
  ndx: { price: 29357.27, changePct: -0.75, label: 'Nasdaq 100' },
  soxx: { price: 524.71, changePct: -1.0, label: 'SOXX' },
  soxl: { price: 178.39, changePct: -4.19, label: 'SOXL (3X)' },
  ewy: { price: 186.42, changePct: -2.15, label: 'EWY' },
  vix: { price: 17.04, changePct: -4.38, label: 'VIX' },
};

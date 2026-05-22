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

/** Demo fallback when live Yahoo fetch fails (offline / rate limit). */
export const FALLBACK_QUOTES = {
  wti: { price: 78.42, changePct: 0.38, label: 'WTI Crude Oil' },
  usdkrw: { price: 1385.2, changePct: -0.12, label: 'USD/KRW' },
  sp500: { price: 5892.14, changePct: 0.24, label: 'S&P 500' },
  ndx: { price: 21456.8, changePct: 0.41, label: 'Nasdaq 100' },
  soxx: { price: 248.6, changePct: 0.67, label: 'SOXX' },
  soxl: { price: 42.18, changePct: 1.92, label: 'SOXL (3X)' },
  ewy: { price: 68.34, changePct: -0.55, label: 'EWY' },
  vix: { price: 14.2, changePct: -2.1, label: 'VIX' },
};

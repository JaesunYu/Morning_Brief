import { useCallback, useEffect, useState } from 'react';
import { fetchMarketData } from '../services/marketApi.js';

const INITIAL_STATE = {
  quotes: null,
  fearGreed: null,
  loading: true,
  error: null,
  lastUpdated: null,
};

export function useMarketData(refreshIntervalMs = 120_000) {
  const [state, setState] = useState(INITIAL_STATE);

  const refresh = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: prev.quotes == null,
      error: null,
    }));

    try {
      const { quotes, fearGreed } = await fetchMarketData();

      setState({
        quotes,
        fearGreed,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message ?? 'Failed to load market data',
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [refresh, refreshIntervalMs]);

  return { ...state, refresh };
}

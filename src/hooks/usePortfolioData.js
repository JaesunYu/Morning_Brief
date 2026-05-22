import { useCallback, useEffect, useState } from 'react';
import {
  buildPortfolioView,
  fetchPortfolioQuotes,
} from '../services/portfolioService.js';

const INITIAL_STATE = {
  summary: null,
  accounts: null,
  loading: true,
  error: null,
  lastUpdated: null,
};

export function usePortfolioData(refreshIntervalMs = 120_000) {
  const [state, setState] = useState(INITIAL_STATE);

  const refresh = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: prev.summary == null,
      error: null,
    }));

    try {
      const quotesBySymbol = await fetchPortfolioQuotes();
      const { summary, accounts } = buildPortfolioView(quotesBySymbol);

      setState({
        summary,
        accounts,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message ?? '포트폴리오 데이터를 불러오지 못했습니다',
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

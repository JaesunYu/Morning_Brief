/**
 * Portfolio holdings — quantities from user (2026-05).
 * Listed ETFs/stocks: Yahoo .KS ticker, price × quantity.
 * Pension mutual funds: no Yahoo ticker; baseNav (전일 기준가, 좌당) + proxy ETF for daily move.
 * Update baseNav periodically from your fund statement for accurate absolute amounts.
 */
export const PORTFOLIO_ACCOUNTS = [
  {
    id: 'dc',
    label: 'DC 계좌',
    holdings: [
      {
        id: 'dc-tdf2040',
        name: '미래에셋전략배분적격TDF2040혼합자산투자신탁C-P2e',
        quantity: 27572,
        type: 'fund',
        baseNav: 2044,
        yahooSymbol: '387270.KS',
        proxyNote: 'KODEX TDF2040액티브 추정',
      },
      {
        id: 'dc-samsung-kospi-bond',
        name: '삼성퇴직연금KOSPI채권혼합증권자산투자신탁제1호[채권혼합]Ce',
        quantity: 45538,
        type: 'fund',
        baseNav: 1420,
        yahooSymbol: '195980.KS',
        proxyNote: 'TIGER 코스피중형주채권혼합 추정',
      },
      {
        id: 'dc-tiger200tr',
        name: 'TIGER 200TR',
        quantity: 2309,
        type: 'listed',
        yahooSymbol: '310970.KS',
      },
      {
        id: 'dc-sol-ai',
        name: 'SOL AI반도체TOP2플러스',
        quantity: 4700,
        type: 'listed',
        yahooSymbol: '486290.KS',
      },
      {
        id: 'dc-kodex-semi',
        name: 'KODEX 반도체',
        quantity: 449,
        type: 'listed',
        yahooSymbol: '091160.KS',
      },
      {
        id: 'dc-tiger-semi10',
        name: 'TIGER 반도체TOP10',
        quantity: 720,
        type: 'listed',
        yahooSymbol: '396510.KS',
      },
      {
        id: 'dc-rise-skhynix',
        name: 'RISE 삼성전자하이닉스채권혼합50',
        quantity: 450,
        type: 'listed',
        yahooSymbol: '385720.KS',
      },
    ],
  },
  {
    id: 'pension',
    label: '퇴직연금 / 개인연금',
    holdings: [
      {
        id: 'pen-sol-ai',
        name: 'SOL AI반도체TOP2플러스',
        quantity: 7501,
        type: 'listed',
        yahooSymbol: '486290.KS',
      },
      {
        id: 'pen-tiger-ndx',
        name: 'TIGER 미국나스닥100',
        quantity: 100,
        type: 'listed',
        yahooSymbol: '133690.KS',
      },
      {
        id: 'pen-tiger-sp500',
        name: 'TIGER 미국S&P500',
        quantity: 640,
        type: 'listed',
        yahooSymbol: '360750.KS',
      },
      {
        id: 'pen-kodex-semi',
        name: 'KODEX 반도체',
        quantity: 100,
        type: 'listed',
        yahooSymbol: '091160.KS',
      },
    ],
  },
  {
    id: 'general',
    label: '일반계좌',
    holdings: [
      {
        id: 'gen-tiger200',
        name: 'TIGER 200',
        quantity: 275,
        type: 'listed',
        yahooSymbol: '102110.KS',
      },
      {
        id: 'gen-tiger-semi10',
        name: 'TIGER 반도체TOP10',
        quantity: 71,
        type: 'listed',
        yahooSymbol: '396510.KS',
      },
      {
        id: 'gen-samsung',
        name: '삼성전자',
        quantity: 632,
        type: 'listed',
        yahooSymbol: '005930.KS',
      },
      {
        id: 'gen-kodex200',
        name: 'KODEX 200',
        quantity: 12,
        type: 'listed',
        yahooSymbol: '069500.KS',
      },
      {
        id: 'gen-kodex-weekly-cc',
        name: 'KODEX 200타겟위클리커버드콜',
        quantity: 792,
        type: 'listed',
        yahooSymbol: '498400.KS',
      },
    ],
  },
];

export function getPortfolioSymbolConfigs() {
  const seen = new Set();
  const configs = [];

  for (const account of PORTFOLIO_ACCOUNTS) {
    for (const holding of account.holdings) {
      if (seen.has(holding.yahooSymbol)) continue;
      seen.add(holding.yahooSymbol);
      configs.push({
        symbol: holding.yahooSymbol,
        label: holding.name,
        unit: '₩',
        decimals: holding.type === 'fund' ? 2 : 0,
      });
    }
  }

  return configs;
}

export function flattenHoldings() {
  return PORTFOLIO_ACCOUNTS.flatMap((account) =>
    account.holdings.map((holding) => ({
      ...holding,
      accountId: account.id,
      accountLabel: account.label,
    })),
  );
}

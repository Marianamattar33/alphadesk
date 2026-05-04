export type PrincipleStatus = 'PASS' | 'CAUTION' | 'FAIL' | 'MANUAL';

export interface PrincipleResult {
  id: number;
  name: string;
  nameEs: string;
  status: PrincipleStatus;
  headline: string;
  detail: string;
}

export interface ValuationSteps {
  pe: { value: number | null; category: 'conservative' | 'sweet-spot' | 'high-risk' | 'negative' | 'na'; epsSource: 'ttm' | 'annual-fallback' };
  cashRunway: { months: number; debtToCapital: number };
  salesGrowth: { yoy: number; cagr3y: number | null; phase: string };
  avgMargin: { value: number };
  avgPE6m: { value: number | null; note: string };
  projectedNI: { revenue: number; netIncome: number };
  futureMktCap: { value: number };
  possibleReturn: { value: number };
}

export interface NewsItem {
  title: string;
  publishedDate: string;
  url: string;
  site: string;
}

export interface StockAnalysis {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry: string;
  exchange: string;
  description: string;
  website: string;
  beta: number;
  high52w: number;
  low52w: number;

  // Technicals
  sma50: number;
  sma200: number;
  ema50: number;
  rsi14: number;
  williamsR: number;
  williamsRTrend: 'rising' | 'falling' | 'flat';
  williamsRCrossing40: boolean;
  fibGoldenZoneLow: number;
  fibGoldenZoneHigh: number;
  inFibGoldenZone: boolean;

  // Fundamentals
  eps: number;
  trailingPE: number | null;
  revenueYoY: number;
  revenueCagr3y: number | null;
  netMarginAvg4y: number;
  cashRunwayMonths: number;
  debtToCapital: number;

  // Analyst
  priceTargetConsensus: number | null;
  priceTargetHigh: number | null;
  priceTargetLow: number | null;
  upsideToConsensus: number | null;

  // Framework
  principles: PrincipleResult[];
  valuation: ValuationSteps;

  // News & earnings
  news: NewsItem[];
  nextEarningsDate: string | null;
  lastEarnings: { date: string; epsActual: number | null; epsEstimated: number | null } | null;

  // Thesis (fetched separately via Suspense)
  thesis?: { structural: string; tactical: string };
}

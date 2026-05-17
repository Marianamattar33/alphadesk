const FMP_BASE = 'https://financialmodelingprep.com/stable';

function getKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error('FMP_API_KEY not configured');
  return key;
}

async function fmpGet<T>(path: string): Promise<T> {
  const url = `${FMP_BASE}/${path}&apikey=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache
  if (!res.ok) throw new Error(`FMP ${res.status}: ${path}`);
  return res.json();
}

// ---------- Raw FMP types ----------

export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercentage: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  previousClose: number;
}

export interface FMPProfile {
  companyName: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
  ceo: string;
  beta: number;
  exchange: string;
}

export interface FMPHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FMPIncomeStatement {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  weightedAverageShsOut: number;
}

export interface FMPBalanceSheet {
  date: string;
  cashAndCashEquivalents: number;
  totalDebt: number;
  totalStockholdersEquity: number;
}

export interface FMPCashFlowStatement {
  date: string;
  freeCashFlow: number;
}

export interface FMPPriceTarget {
  targetHigh: number;
  targetLow: number;
  targetConsensus: number;
  targetMedian: number;
}

export interface FMPEarnings {
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
}

export interface FMPNews {
  title: string;
  publishedDate: string;
  url: string;
  site: string;
}

export interface FMPSearchResult {
  symbol: string;
  name: string;
  exchangeFullName: string;
  exchangeShortName: string;
}

export interface FMPAnalystEstimate {
  date: string;
  revenueAvg: number;
  numAnalystsRevenue: number;
}

export interface FMPPriceTargetSummary {
  lastMonthCount: number;
}

// ---------- Fetch functions ----------

export async function fetchQuote(ticker: string): Promise<FMPQuote | null> {
  const data = await fmpGet<FMPQuote[]>(`quote?symbol=${ticker}`);
  return data[0] ?? null;
}

export async function fetchProfile(ticker: string): Promise<FMPProfile | null> {
  const data = await fmpGet<FMPProfile[]>(`profile?symbol=${ticker}`);
  return data[0] ?? null;
}

export async function fetchHistoricalPrices(ticker: string, days = 252): Promise<FMPHistoricalPrice[]> {
  // Response is newest-first; we take the most recent `days` and reverse to chronological
  const data = await fmpGet<FMPHistoricalPrice[]>(`historical-price-eod/full?symbol=${ticker}`);
  return data.slice(0, days).reverse();
}

export async function fetchIncomeStatements(ticker: string, limit = 4): Promise<FMPIncomeStatement[]> {
  return fmpGet<FMPIncomeStatement[]>(`income-statement?symbol=${ticker}&limit=${limit}`);
}

export async function fetchQuarterlyIncomeStatements(ticker: string, limit = 5): Promise<FMPIncomeStatement[]> {
  return fmpGet<FMPIncomeStatement[]>(`income-statement?symbol=${ticker}&period=quarter&limit=${limit}`);
}

export async function fetchQuarterlyCashFlowStatements(ticker: string, limit = 5): Promise<FMPCashFlowStatement[]> {
  return fmpGet<FMPCashFlowStatement[]>(`cash-flow-statement?symbol=${ticker}&period=quarter&limit=${limit}`);
}

export async function fetchBalanceSheet(ticker: string): Promise<FMPBalanceSheet | null> {
  const data = await fmpGet<FMPBalanceSheet[]>(`balance-sheet-statement?symbol=${ticker}&limit=1`);
  return data[0] ?? null;
}

export async function fetchPriceTargets(ticker: string): Promise<FMPPriceTarget | null> {
  const data = await fmpGet<FMPPriceTarget[]>(`price-target-consensus?symbol=${ticker}`);
  return data[0] ?? null;
}

export async function fetchEarnings(ticker: string): Promise<FMPEarnings[]> {
  return fmpGet<FMPEarnings[]>(`earnings?symbol=${ticker}&limit=3`);
}

export async function fetchNews(ticker: string, limit = 5): Promise<FMPNews[]> {
  const data = await fmpGet<FMPNews[]>(`news/stock?symbols=${ticker}&limit=${limit}`);
  return data;
}

export async function fetchAnalystEstimates(ticker: string, limit = 6): Promise<FMPAnalystEstimate[]> {
  return fmpGet<FMPAnalystEstimate[]>(`analyst-estimates?symbol=${ticker}&period=annual&limit=${limit}`);
}

export async function fetchPriceTargetSummary(ticker: string): Promise<FMPPriceTargetSummary | null> {
  const data = await fmpGet<FMPPriceTargetSummary[]>(`price-target-summary?symbol=${ticker}`);
  return data[0] ?? null;
}

const US_EXCHANGES = ['New York Stock Exchange', 'NASDAQ', 'NYSE'];

export async function fetchSearchResults(query: string): Promise<FMPSearchResult[]> {
  const q = encodeURIComponent(query);
  const [byName, bySymbol] = await Promise.all([
    fmpGet<FMPSearchResult[]>(`search-name?query=${q}&limit=20`),
    fmpGet<FMPSearchResult[]>(`search-symbol?query=${q}&limit=20`),
  ]);

  const seen = new Set<string>();
  const merged: FMPSearchResult[] = [];

  for (const r of [...bySymbol, ...byName]) {
    if (seen.has(r.symbol)) continue;
    const ex = r.exchangeFullName ?? r.exchangeShortName ?? '';
    if (!US_EXCHANGES.some(u => ex.includes(u))) continue;
    seen.add(r.symbol);
    merged.push(r);
  }

  return merged.slice(0, 7);
}

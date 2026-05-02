import {
  fetchQuote,
  fetchProfile,
  fetchHistoricalPrices,
  fetchIncomeStatements,
  fetchBalanceSheet,
  fetchPriceTargets,
  fetchEarnings,
  fetchNews,
} from './fmp';
import { computeTechnicals } from './technicals';
import { evaluatePrinciples, computeValuation } from './abacus';
import type { StockAnalysis } from '@/types/lookup';

export async function analyzeTicker(ticker: string): Promise<StockAnalysis> {
  const t = ticker.toUpperCase().trim();

  const [quote, profile, history, income, balance, targets, earnings, newsRaw] =
    await Promise.all([
      fetchQuote(t),
      fetchProfile(t),
      fetchHistoricalPrices(t, 252),
      fetchIncomeStatements(t, 4),
      fetchBalanceSheet(t),
      fetchPriceTargets(t),
      fetchEarnings(t),
      fetchNews(t, 5),
    ]);

  if (!quote) throw new Error(`Ticker not found: ${t}`);

  const technicals = computeTechnicals(history, quote);

  const abacusInput = { quote, technicals, income, balance, targets };
  const principles = evaluatePrinciples(abacusInput);
  const valuation = computeValuation(abacusInput);

  const eps = income[0]?.epsDiluted ?? income[0]?.eps ?? 0;
  const trailingPE = eps > 0 ? quote.price / eps : null;

  const margins = income
    .filter(s => s.revenue > 0)
    .map(s => (s.netIncome / s.revenue) * 100);
  const netMarginAvg4y =
    margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;

  const priceTargetConsensus = targets?.targetConsensus ?? null;
  const upsideToConsensus =
    priceTargetConsensus !== null
      ? ((priceTargetConsensus - quote.price) / quote.price) * 100
      : null;

  const upcoming = earnings.find(e => e.epsActual === null);
  const nextEarningsDate = upcoming?.date ?? null;

  const last = earnings.find(e => e.epsActual !== null);
  const lastEarnings = last
    ? { date: last.date, epsActual: last.epsActual, epsEstimated: last.epsEstimated }
    : null;

  return {
    ticker: t,
    name: quote.name ?? profile?.companyName ?? t,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercentage,
    volume: quote.volume,
    marketCap: quote.marketCap,
    sector: profile?.sector ?? 'Unknown',
    industry: profile?.industry ?? 'Unknown',
    exchange: quote.exchange ?? profile?.exchange ?? '',
    description: profile?.description ?? '',
    website: profile?.website ?? '',
    beta: profile?.beta ?? 1,
    high52w: quote.yearHigh,
    low52w: quote.yearLow,

    sma50: technicals.sma50,
    sma200: technicals.sma200,
    ema50: technicals.ema50,
    rsi14: technicals.rsi14,
    williamsR: technicals.williamsR,
    williamsRTrend: technicals.williamsRTrend,
    williamsRCrossing40: technicals.williamsRCrossing40,
    fibGoldenZoneLow: technicals.fibGoldenZoneLow,
    fibGoldenZoneHigh: technicals.fibGoldenZoneHigh,
    inFibGoldenZone: technicals.inFibGoldenZone,

    eps,
    trailingPE,
    revenueYoY: valuation.salesGrowth.yoy,
    revenueCagr3y: valuation.salesGrowth.cagr3y,
    netMarginAvg4y,
    cashRunwayMonths: valuation.cashRunway.months,
    debtToCapital: valuation.cashRunway.debtToCapital,

    priceTargetConsensus,
    priceTargetHigh: targets?.targetHigh ?? null,
    priceTargetLow: targets?.targetLow ?? null,
    upsideToConsensus,

    principles,
    valuation,

    news: newsRaw.map(n => ({
      title: n.title,
      publishedDate: n.publishedDate,
      url: n.url,
      site: n.site,
    })),
    nextEarningsDate,
    lastEarnings,
  };
}

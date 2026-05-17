import type { FMPQuote, FMPIncomeStatement, FMPBalanceSheet, FMPPriceTarget, FMPCashFlowStatement, FMPAnalystEstimate } from './fmp';
import type { Technicals } from './technicals';
import type { PrincipleResult, ValuationSteps } from '@/types/lookup';

interface AbacusInput {
  quote: FMPQuote;
  technicals: Technicals;
  income: FMPIncomeStatement[];               // annual, newest-first
  quarterlyIncome: FMPIncomeStatement[];      // quarterly, newest-first
  quarterlyCashFlow: FMPCashFlowStatement[];  // quarterly, newest-first
  balance: FMPBalanceSheet | null;
  targets: FMPPriceTarget | null;
  analystEstimates: FMPAnalystEstimate[];     // annual, newest-first (filtered to future in helpers)
}

// ─── Analyst estimate resolver ────────────────────────────────────────────────

function resolveEstimates(estimates: FMPAnalystEstimate[]): {
  currentYear: FMPAnalystEstimate | null;
  nextYear: FMPAnalystEstimate | null;
} {
  const today = new Date().toISOString().slice(0, 10);
  const future = estimates
    .filter(e => e.date > today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return { currentYear: future[0] ?? null, nextYear: future[1] ?? null };
}

// ─── TTM EPS helper ───────────────────────────────────────────────────────────

function resolveTTMEps(
  quarters: FMPIncomeStatement[],
  annualFallback: number,
): { eps: number; source: 'ttm' | 'annual-fallback' } {
  if (quarters.length >= 4) {
    const ttm = quarters
      .slice(0, 4)
      .reduce((sum, q) => sum + (q.epsDiluted ?? q.eps ?? 0), 0);
    return { eps: ttm, source: 'ttm' };
  }
  return { eps: annualFallback, source: 'annual-fallback' };
}

// ─── 7 PRINCIPLES ───────────────────────────────────────────────────────────

export function evaluatePrinciples(input: AbacusInput): PrincipleResult[] {
  const { quote, technicals, income, quarterlyIncome, targets } = input;
  const price = quote.price;
  const latest = income[0];
  const prev = income[1];

  // ── Principio I: Price Target ──────────────────────────────────────────
  const p1 = ((): PrincipleResult => {
    if (!targets || !targets.targetConsensus) {
      return {
        id: 1, name: 'Price Target', nameEs: 'Precio Objetivo',
        status: 'MANUAL',
        headline: 'No analyst coverage found',
        detail: 'No consensus price target available for this ticker.',
      };
    }
    const upside = ((targets.targetConsensus - price) / price) * 100;
    const status = upside >= 20 ? 'PASS' : upside >= 5 ? 'CAUTION' : 'FAIL';
    return {
      id: 1, name: 'Price Target', nameEs: 'Precio Objetivo',
      status,
      headline: `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}% upside to $${targets.targetConsensus.toFixed(0)} consensus`,
      detail: `Range: $${targets.targetLow}–$${targets.targetHigh}. Principio I requires ≥20% upside for a strong entry.`,
    };
  })();

  // ── Principio II: Sales Growth (forward: next FY estimate vs TTM) ────────────
  const p2 = ((): PrincipleResult => {
    const ttmRevenue = quarterlyIncome.length >= 4
      ? quarterlyIncome.slice(0, 4).reduce((sum, q) => sum + (q.revenue ?? 0), 0)
      : null;
    const { nextYear } = resolveEstimates(input.analystEstimates);

    if (!nextYear || !ttmRevenue) {
      return {
        id: 2, name: 'Revenue Growth Estimate', nameEs: 'Estimación de Crecimiento',
        status: 'MANUAL',
        headline: 'No analyst coverage — manual assessment required',
        detail: 'No analyst coverage available — manually assess forward revenue growth, or skip this principle for this stock.',
      };
    }

    const forwardGrowth = ((nextYear.revenueAvg - ttmRevenue) / ttmRevenue) * 100;
    let phase: string;
    let status: PrincipleResult['status'];
    if (forwardGrowth > 20)      { phase = 'Growth-Leader'; status = 'PASS'; }
    else if (forwardGrowth >= 5) { phase = 'Mature'; status = 'PASS'; }
    else if (forwardGrowth >= 0) { phase = 'Slow Growth'; status = 'CAUTION'; }
    else                          { phase = 'Declining'; status = 'FAIL'; }

    return {
      id: 2, name: 'Revenue Growth Estimate', nameEs: 'Estimación de Crecimiento',
      status,
      headline: `${forwardGrowth >= 0 ? '+' : ''}${forwardGrowth.toFixed(1)}% forward growth — ${phase} phase`,
      detail: `Next FY est. $${(nextYear.revenueAvg / 1e9).toFixed(1)}B vs TTM $${(ttmRevenue / 1e9).toFixed(1)}B (${nextYear.numAnalystsRevenue} analysts). Principio II prefers Mature or Growth-Leader phase.`,
    };
  })();

  // ── Principio III: Ley de 200 días ────────────────────────────────────
  const p3 = ((): PrincipleResult => {
    const { sma200 } = technicals;
    const pctVs200 = ((price - sma200) / sma200) * 100;
    const below = price < sma200;
    const status = below ? 'PASS' : pctVs200 < 10 ? 'CAUTION' : 'FAIL';
    return {
      id: 3, name: '200-Day Rule', nameEs: 'Ley de 200 Días',
      status,
      headline: below
        ? `${Math.abs(pctVs200).toFixed(1)}% below SMA200 — in buy territory`
        : `${pctVs200.toFixed(1)}% above SMA200 — extended`,
      detail: `Price $${price.toFixed(2)} vs 200-day SMA $${sma200.toFixed(2)}. Principio III: buy below the 200-day moving average.`,
    };
  })();

  // ── Principio IV: Conference Call ─────────────────────────────────────
  const p4: PrincipleResult = {
    id: 4, name: 'Conference Call', nameEs: 'Conference Call',
    status: 'MANUAL',
    headline: 'Manual review required',
    detail: 'Review the latest earnings call transcript on alphaspread.com for tone, guidance, and red flags. This principle cannot be automated.',
  };

  // ── Principio V: P/E Ratio (TTM EPS) ─────────────────────────────────
  const p5 = ((): PrincipleResult => {
    const annualEps = latest?.epsDiluted ?? latest?.eps ?? 0;
    const { eps } = resolveTTMEps(quarterlyIncome, annualEps);
    if (!eps || eps <= 0) {
      return {
        id: 5, name: 'P/E Ratio', nameEs: 'Ratio P/E',
        status: 'CAUTION', headline: 'No positive earnings (P/E N/A)',
        detail: 'Company is not yet profitable or EPS is unavailable. Cannot evaluate Principio V.',
      };
    }
    const pe = price / eps;
    let category: string;
    let status: PrincipleResult['status'];
    if (pe < 20) { category = 'Conservative'; status = 'CAUTION'; }
    else if (pe <= 39) { category = 'Leader Sweet Spot'; status = 'PASS'; }
    else { category = 'High Risk'; status = 'FAIL'; }
    return {
      id: 5, name: 'P/E Ratio', nameEs: 'Ratio P/E',
      status,
      headline: `P/E ${pe.toFixed(1)} — ${category} (TTM)`,
      detail: `Trailing P/E based on TTM diluted EPS $${eps.toFixed(2)}. Principio V: <20 conservative, 20–39 leader sweet spot, 40+ high risk.`,
    };
  })();

  // ── Principio VI: Support & Resistance ───────────────────────────────
  const p6: PrincipleResult = {
    id: 6, name: 'Support & Resistance', nameEs: 'Soportes y Resistencias',
    status: 'MANUAL',
    headline: 'Manual chart analysis required',
    detail: 'Identify key support/resistance levels on the price chart. Principio VI requires R:R ≥ 1:3 for portfolio entries, ≥ 1:2 for swing trades.',
  };

  // ── Principio VII: Williams %R ────────────────────────────────────────
  const p7 = ((): PrincipleResult => {
    const { williamsR, williamsRTrend, williamsRCrossing40 } = technicals;
    let status: PrincipleResult['status'];
    let headline: string;
    let detail: string;

    if (williamsR <= -90) {
      status = 'PASS';
      headline = `Williams %R ${williamsR.toFixed(0)} — Portfolio entry zone`;
      detail = 'At or below -90: Principio VII strong buy signal for portfolio (long-term) entries.';
    } else if (williamsRCrossing40) {
      status = 'PASS';
      headline = `Williams %R ${williamsR.toFixed(0)} rising through -40 — Swing trigger`;
      detail = 'Rising through -40 is the Principio VII swing momentum trigger. Watch for EMA50 break and retest.';
    } else if (williamsR <= -80) {
      status = 'PASS';
      headline = `Williams %R ${williamsR.toFixed(0)} — Oversold, ${williamsRTrend}`;
      detail = `In oversold territory (below -80). Trend is ${williamsRTrend}. Not yet at the -90 portfolio entry signal.`;
    } else if (williamsR <= -40) {
      status = 'CAUTION';
      headline = `Williams %R ${williamsR.toFixed(0)} — Neutral zone, ${williamsRTrend}`;
      detail = 'Between -40 and -80. Watch for a push toward -90 (portfolio entry) or rising through -40 (swing trigger).';
    } else if (williamsR <= -20) {
      status = 'CAUTION';
      headline = `Williams %R ${williamsR.toFixed(0)} — Neutral-bullish, ${williamsRTrend}`;
      detail = 'Between -20 and -40: not yet a Principio VII trigger. Watch for a rise through -40 or a pullback toward -80/-90.';
    } else {
      status = 'FAIL';
      headline = `Williams %R ${williamsR.toFixed(0)} — Overbought`;
      detail = 'Above -20: overbought per standard Williams %R. Not a Principio VII entry. Wait for a pullback toward -80 or -90.';
    }

    return { id: 7, name: 'Williams %R', nameEs: 'Williams %R', status, headline, detail };
  })();

  return [p1, p2, p3, p4, p5, p6, p7];
}

// ─── 8-STEP VALUATION ───────────────────────────────────────────────────────

export function computeValuation(input: AbacusInput): ValuationSteps {
  const { quote, technicals, income, quarterlyIncome, quarterlyCashFlow, balance } = input;
  const price = quote.price;
  const latest = income[0];
  const prev = income[1];

  // Step 1: P/E — use TTM EPS (sum of last 4 quarterly diluted EPS)
  const annualEps = latest?.epsDiluted ?? latest?.eps ?? 0;
  const { eps: ttmEps, source: epsSource } = resolveTTMEps(quarterlyIncome, annualEps);
  const pe = ttmEps > 0 ? price / ttmEps : null;
  const peCategory: ValuationSteps['pe']['category'] =
    ttmEps <= 0 ? (ttmEps < 0 ? 'negative' : 'na')
    : pe === null ? 'na'
    : pe < 20 ? 'conservative' : pe <= 39 ? 'sweet-spot' : 'high-risk';

  // Step 2: Cash runway + debt/capital + TTM FCF
  const cash = balance?.cashAndCashEquivalents ?? 0;
  const debt = balance?.totalDebt ?? 0;
  const equity = balance?.totalStockholdersEquity ?? 1;
  const monthlyOpEx = latest ? latest.operatingExpenses / 12 : 1;
  const cashRunwayMonths = monthlyOpEx > 0 ? cash / monthlyOpEx : 999;
  const debtToCapital = debt + equity > 0 ? (debt / (debt + equity)) * 100 : 0;
  const ttmFcf = quarterlyCashFlow.length >= 4
    ? quarterlyCashFlow.slice(0, 4).reduce((sum, q) => sum + (q.freeCashFlow ?? 0), 0)
    : null;
  const fcfPositive = ttmFcf !== null && ttmFcf > 0;

  // Step 3: Current year analyst revenue estimate (consensus avg)
  const { currentYear: currentYearEst } = resolveEstimates(input.analystEstimates);

  // Step 4: Avg profit margin (4-year annual — correct for trend)
  const margins = income
    .filter(s => s.revenue > 0)
    .map(s => (s.netIncome / s.revenue) * 100);
  const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;

  // Step 5: Avg P/E 6-month — use TTM EPS as denominator
  const avgPE6m = ttmEps > 0 ? technicals.avgClose6m / ttmEps : null;

  // Step 6: Projected Net Income = current year revenue estimate × avg margin
  const projectedRevenue = currentYearEst ? currentYearEst.revenueAvg : null;
  const projectedNI = projectedRevenue !== null ? projectedRevenue * (avgMargin / 100) : null;

  // Step 7: Future Market Cap = projected NI × avg P/E
  const peForProjection = avgPE6m ?? pe ?? 20;
  const futureMktCap = projectedNI !== null ? projectedNI * peForProjection : null;

  // Step 8: Possible Return
  const currentMktCap = quote.marketCap;
  const possibleReturn =
    futureMktCap !== null && currentMktCap > 0
      ? ((futureMktCap / currentMktCap) - 1) * 100
      : null;

  return {
    pe: { value: pe, category: peCategory, epsSource },
    cashRunway: { months: cashRunwayMonths, debtToCapital, ttmFcf, fcfPositive },
    salesGrowth: {
      currentYearRevenue: currentYearEst ? currentYearEst.revenueAvg : null,
      numAnalysts: currentYearEst?.numAnalystsRevenue ?? 0,
    },
    avgMargin: { value: avgMargin },
    avgPE6m: {
      value: avgPE6m,
      note: 'Approximated from 6-month avg price ÷ TTM EPS (YCharts recommended for precise value)',
    },
    projectedNI: { revenue: projectedRevenue, netIncome: projectedNI },
    futureMktCap: { value: futureMktCap },
    possibleReturn: { value: possibleReturn },
  };
}

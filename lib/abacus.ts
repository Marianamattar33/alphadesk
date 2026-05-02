import type { FMPQuote, FMPIncomeStatement, FMPBalanceSheet, FMPPriceTarget } from './fmp';
import type { Technicals } from './technicals';
import type { PrincipleResult, ValuationSteps } from '@/types/lookup';

interface AbacusInput {
  quote: FMPQuote;
  technicals: Technicals;
  income: FMPIncomeStatement[];
  balance: FMPBalanceSheet | null;
  targets: FMPPriceTarget | null;
}

// ─── 7 PRINCIPLES ───────────────────────────────────────────────────────────

export function evaluatePrinciples(input: AbacusInput): PrincipleResult[] {
  const { quote, technicals, income, targets } = input;
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
      detail: `Range: $${targets.targetLow}–$${targets.targetHigh}. Abacus requires ≥20% upside for a strong Principio I.`,
    };
  })();

  // ── Principio II: Sales Growth ─────────────────────────────────────────
  const p2 = ((): PrincipleResult => {
    if (!latest || !prev || prev.revenue === 0) {
      return {
        id: 2, name: 'Sales Growth', nameEs: 'Crecimiento en Ventas',
        status: 'MANUAL', headline: 'Insufficient data', detail: 'Need ≥2 annual periods.',
      };
    }
    const yoy = ((latest.revenue - prev.revenue) / prev.revenue) * 100;
    let phase: string;
    let status: PrincipleResult['status'];
    if (yoy > 20) { phase = 'Growth-Leader'; status = 'PASS'; }
    else if (yoy >= 5) { phase = 'Mature'; status = 'PASS'; }
    else if (yoy >= 0) { phase = 'Slow Growth'; status = 'CAUTION'; }
    else { phase = 'Declining'; status = 'FAIL'; }

    // 3-year CAGR if we have 4 periods
    let cagr3yStr = '';
    if (income[3] && income[3].revenue > 0) {
      const cagr3y = (Math.pow(latest.revenue / income[3].revenue, 1 / 3) - 1) * 100;
      cagr3yStr = ` | 3yr CAGR: ${cagr3y >= 0 ? '+' : ''}${cagr3y.toFixed(1)}%`;
    }
    return {
      id: 2, name: 'Sales Growth', nameEs: 'Crecimiento en Ventas',
      status,
      headline: `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}% YoY — ${phase} phase`,
      detail: `Revenue: $${(latest.revenue / 1e9).toFixed(1)}B → $${(prev.revenue / 1e9).toFixed(1)}B (prior year)${cagr3yStr}. Abacus prefers Mature or Growth-Leader.`,
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

  // ── Principio V: P/E Ratio ────────────────────────────────────────────
  const p5 = ((): PrincipleResult => {
    const eps = latest?.epsDiluted ?? latest?.eps ?? 0;
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
      headline: `P/E ${pe.toFixed(1)} — ${category}`,
      detail: `Trailing P/E based on diluted EPS $${eps.toFixed(2)}. Abacus: <20 conservative, 20–39 leader sweet spot, 40+ high risk.`,
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
      detail = 'Rising through -40 is the Abacus swing momentum trigger. Watch for EMA50 break and retest.';
    } else if (williamsR <= -80) {
      status = 'PASS';
      headline = `Williams %R ${williamsR.toFixed(0)} — Oversold, ${williamsRTrend}`;
      detail = `In oversold territory (below -80). Trend is ${williamsRTrend}. Not yet at the -90 portfolio entry signal.`;
    } else if (williamsR <= -40) {
      status = 'CAUTION';
      headline = `Williams %R ${williamsR.toFixed(0)} — Neutral zone, ${williamsRTrend}`;
      detail = 'Between -40 and -80. Watch for a push toward -90 (portfolio entry) or rising through -40 (swing trigger).';
    } else {
      status = 'FAIL';
      headline = `Williams %R ${williamsR.toFixed(0)} — Overbought`;
      detail = 'Above -40: overbought by Abacus standards. Not an entry. Wait for a pullback toward -80 or -90.';
    }

    return { id: 7, name: 'Williams %R', nameEs: 'Williams %R', status, headline, detail };
  })();

  return [p1, p2, p3, p4, p5, p6, p7];
}

// ─── 8-STEP VALUATION ───────────────────────────────────────────────────────

export function computeValuation(input: AbacusInput): ValuationSteps {
  const { quote, technicals, income, balance } = input;
  const price = quote.price;
  const latest = income[0];
  const prev = income[1];

  // Step 1: P/E
  const eps = latest?.epsDiluted ?? latest?.eps ?? 0;
  const pe = eps > 0 ? price / eps : null;
  const peCategory: ValuationSteps['pe']['category'] =
    pe === null ? 'na' : eps <= 0 ? 'negative' : pe < 20 ? 'conservative' : pe <= 39 ? 'sweet-spot' : 'high-risk';

  // Step 2: Cash runway + debt/capital
  const cash = balance?.cashAndCashEquivalents ?? 0;
  const debt = balance?.totalDebt ?? 0;
  const equity = balance?.totalStockholdersEquity ?? 1;
  const monthlyOpEx = latest ? latest.operatingExpenses / 12 : 1;
  const cashRunwayMonths = monthlyOpEx > 0 ? cash / monthlyOpEx : 999;
  const debtToCapital = debt + equity > 0 ? (debt / (debt + equity)) * 100 : 0;

  // Step 3: Sales growth
  const yoy = latest && prev && prev.revenue > 0
    ? ((latest.revenue - prev.revenue) / prev.revenue) * 100
    : 0;
  const cagr3y =
    income[3] && income[3].revenue > 0
      ? (Math.pow(latest.revenue / income[3].revenue, 1 / 3) - 1) * 100
      : null;
  const phase =
    yoy > 20 ? 'Growth-Leader' : yoy >= 5 ? 'Mature' : yoy >= 0 ? 'Slow Growth' : 'Declining';

  // Step 4: Avg profit margin (4-year)
  const margins = income
    .filter(s => s.revenue > 0)
    .map(s => (s.netIncome / s.revenue) * 100);
  const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;

  // Step 5: P/E 6-month avg (approximation: avg close over 126 days / diluted EPS)
  const avgPE6m = eps > 0 ? technicals.avgClose6m / eps : null;

  // Step 6: Projected Net Income = projected revenue × avg margin
  const growthRate = cagr3y !== null ? cagr3y / 100 : yoy / 100;
  const projectedRevenue = latest ? latest.revenue * (1 + growthRate) : 0;
  const projectedNI = projectedRevenue * (avgMargin / 100);

  // Step 7: Future Market Cap = projected NI × avg P/E
  const peForProjection = avgPE6m ?? pe ?? 20;
  const futureMktCap = projectedNI * peForProjection;

  // Step 8: Possible Return
  const currentMktCap = quote.marketCap;
  const possibleReturn =
    currentMktCap > 0 ? ((futureMktCap / currentMktCap) - 1) * 100 : 0;

  return {
    pe: { value: pe, category: peCategory },
    cashRunway: { months: cashRunwayMonths, debtToCapital },
    salesGrowth: { yoy, cagr3y, phase },
    avgMargin: { value: avgMargin },
    avgPE6m: {
      value: avgPE6m,
      note: 'Approximated from 6-month avg price ÷ trailing EPS (YCharts recommended for precise value)',
    },
    projectedNI: { revenue: projectedRevenue, netIncome: projectedNI },
    futureMktCap: { value: futureMktCap },
    possibleReturn: { value: possibleReturn },
  };
}

import type { TipContent, TipCurrent, VerdictColor } from '@/types/tips';
import type { PrincipleResult } from '@/types/lookup';

// ─── Private helpers ──────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

function statusVerdict(status: string): VerdictColor {
  if (status === 'PASS')    return 'green';
  if (status === 'CAUTION') return 'gold';
  if (status === 'FAIL')    return 'red';
  if (status === 'MANUAL')  return 'purple';
  return 'gray';
}

// ─── Hero stats ───────────────────────────────────────────────────────────────

export function marketCapTip(cap: number): TipContent {
  let interp: string;
  if (cap >= 2e11)      interp = 'mega-cap (≥ $200B)';
  else if (cap >= 1e10) interp = 'large-cap ($10B–$200B)';
  else if (cap >= 2e9)  interp = 'mid-cap ($2B–$10B)';
  else                  interp = 'small/micro-cap (< $2B)';
  return {
    title: 'Market Capitalization',
    lines: [
      { label: 'Formula', value: 'Share price × shares outstanding' },
      { label: 'Source',  value: 'FMP /quote — marketCap field (real-time)' },
    ],
    current: { text: fmtB(cap), verdict: 'gold', interpretation: interp },
  };
}

export const range52wTip: TipContent = {
  title: '52-Week Price Range',
  lines: [
    { label: 'Source',  value: 'FMP /quote — yearHigh / yearLow fields (rolling 52 weeks)' },
    { label: 'Use',     value: 'Context for Fibonacci retracement and position sizing' },
  ],
};

export const volumeTip: TipContent = {
  title: 'Volume — Shares Traded Today',
  lines: [
    { label: 'Source',  value: 'FMP /quote — volume field (intraday)' },
    { label: 'Context', value: 'Compare to 30-day avg volume to gauge conviction in price moves' },
  ],
};

export function betaTip(beta: number): TipContent {
  let verdict: VerdictColor;
  let interp: string;
  if (beta > 1.5)      { verdict = 'red';   interp = 'high volatility (β > 1.5)'; }
  else if (beta > 1.0) { verdict = 'gold';  interp = 'above-market volatility (β 1.0–1.5)'; }
  else if (beta > 0)   { verdict = 'green'; interp = 'below-market volatility (β < 1.0)'; }
  else                 { verdict = 'gray';  interp = 'inverse or near-zero market correlation'; }
  return {
    title: 'Beta — Market Volatility Coefficient',
    lines: [
      { label: 'Formula', value: 'Covariance(stock, S&P 500) ÷ Variance(S&P 500)' },
      { label: 'Source',  value: 'FMP /quote — beta field (typically 3–5 year window)' },
    ],
    verdicts: [
      { color: 'green', text: '< 1.0 — less volatile than the market' },
      { color: 'gold',  text: '1.0–1.5 — moderately more volatile' },
      { color: 'red',   text: '> 1.5 — highly volatile; large swings expected' },
    ],
    current: { text: beta.toFixed(2), verdict, interpretation: interp },
  };
}

// ─── Technicals ───────────────────────────────────────────────────────────────

export function sma50Tip(price: number, sma: number): TipContent {
  const pct   = ((price - sma) / sma) * 100;
  const above = price >= sma;
  return {
    title: 'SMA 50 — Simple Moving Average (50-day)',
    lines: [
      { label: 'Formula', value: 'Sum of last 50 closing prices ÷ 50' },
      { label: 'Source',  value: 'FMP /historical-price-full (50-day window)' },
    ],
    verdicts: [
      { color: 'green', text: 'Price above SMA50 — short-term uptrend' },
      { color: 'red',   text: 'Price below SMA50 — short-term downtrend' },
    ],
    current: {
      text: `$${sma.toFixed(2)}`,
      verdict: above ? 'green' : 'red',
      interpretation: above
        ? `price ${pct.toFixed(1)}% above — short-term uptrend`
        : `price ${Math.abs(pct).toFixed(1)}% below — short-term downtrend`,
    },
  };
}

export function sma200Tip(price: number, sma: number): TipContent {
  const pct  = ((price - sma) / sma) * 100;
  const below = price < sma;
  return {
    title: 'SMA 200 — Principio III (200-Day Rule)',
    lines: [
      { label: 'Formula', value: 'Sum of last 200 closing prices ÷ 200' },
      { label: 'Source',  value: 'FMP /historical-price-full (200-day window)' },
    ],
    verdicts: [
      { color: 'green', text: 'Price below SMA200 — buy territory (Principio III PASS)' },
      { color: 'gold',  text: 'Price 0–10% above SMA200 — near threshold, caution' },
      { color: 'red',   text: 'Price >10% above SMA200 — extended, not an entry' },
    ],
    current: {
      text: `$${sma.toFixed(2)}`,
      verdict: below ? 'green' : pct < 10 ? 'gold' : 'red',
      interpretation: below
        ? `price ${Math.abs(pct).toFixed(1)}% below — buy territory`
        : `price ${pct.toFixed(1)}% above — ${pct < 10 ? 'near threshold' : 'extended'}`,
    },
  };
}

export function ema50Tip(price: number, ema: number): TipContent {
  const pct   = ((price - ema) / ema) * 100;
  const above = price >= ema;
  return {
    title: 'EMA 50 — Exponential Moving Average (50-day)',
    lines: [
      { label: 'Formula', value: 'Weighted avg giving more weight to recent prices; 50-day span' },
      { label: 'Source',  value: 'FMP /historical-price-full (50-day window, EMA weighting)' },
      { label: 'Use',     value: 'Swing entries: look for EMA50 break + retest after %R trigger' },
    ],
    current: {
      text: `$${ema.toFixed(2)}`,
      verdict: above ? 'green' : 'gold',
      interpretation: above
        ? `price ${pct.toFixed(1)}% above EMA50`
        : `price ${Math.abs(pct).toFixed(1)}% below EMA50`,
    },
  };
}

export function rsiTip(rsi: number): TipContent {
  let verdict: VerdictColor;
  let interp: string;
  if (rsi >= 70)      { verdict = 'red';   interp = 'overbought (≥ 70)'; }
  else if (rsi <= 30) { verdict = 'green'; interp = 'oversold (≤ 30)'; }
  else if (rsi >= 50) { verdict = 'gold';  interp = 'bullish momentum (50–70)'; }
  else                { verdict = 'gold';  interp = 'neutral-bearish (30–50)'; }
  return {
    title: 'RSI 14 — Relative Strength Index',
    lines: [
      { label: 'Formula', value: '100 − (100 ÷ (1 + Avg Gain / Avg Loss)) over 14 days' },
      { label: 'Source',  value: 'FMP /historical-price-full (14-day window)' },
    ],
    verdicts: [
      { color: 'green', text: '≤ 30 — oversold; potential reversal zone' },
      { color: 'gold',  text: '30–70 — neutral range' },
      { color: 'red',   text: '≥ 70 — overbought; momentum may stall' },
    ],
    current: { text: rsi.toFixed(0), verdict, interpretation: interp },
  };
}

export function wrTip(wr: number, trend: string, crossing40: boolean): TipContent {
  let verdict: VerdictColor;
  let interp: string;
  if (crossing40)     { verdict = 'green'; interp = 'crossing −40 — swing momentum trigger'; }
  else if (wr <= -90) { verdict = 'green'; interp = 'extreme oversold — portfolio entry zone'; }
  else if (wr <= -80) { verdict = 'green'; interp = 'oversold; watch for reversal (not yet entry)'; }
  else if (wr <= -40) { verdict = 'gold';  interp = 'neutral, no entry signal yet'; }
  else if (wr <= -20) { verdict = 'gold';  interp = 'neutral-bullish, not a trigger yet'; }
  else                { verdict = 'red';   interp = 'overbought — avoid entry'; }
  return {
    title: 'Williams %R — Principio VII (14-period)',
    lines: [
      { label: 'Formula', value: '(Highest High − Close) / (Highest High − Lowest Low) × −100' },
      { label: 'Source',  value: 'FMP /historical-price-full — 14-day high / low / close' },
    ],
    verdicts: [
      { color: 'green', text: '≤ −90 — extreme oversold (rare; portfolio entry)' },
      { color: 'green', text: '≤ −80 — oversold; watch for reversal (not yet entry)' },
      { color: 'green', text: 'Rising through −40 — swing momentum trigger' },
      { color: 'gold',  text: '−40 to −80 (flat/falling) — neutral, wait for signal' },
      { color: 'gold',  text: '−20 to −40 — neutral-bullish, not yet a trigger' },
      { color: 'red',   text: '> −20 — overbought, avoid entry' },
    ],
    current: { text: `${wr.toFixed(0)} (${trend})`, verdict, interpretation: interp },
  };
}

export function fibTip(low: number, high: number, inZone: boolean): TipContent {
  return {
    title: 'Fibonacci Golden Pocket (61.8%–65%)',
    lines: [
      { label: 'Formula', value: '6-month swing high − range × 0.618 / 0.650' },
      { label: 'Zone',    value: `$${high.toFixed(2)} – $${low.toFixed(2)}` },
      { label: 'Source',  value: 'FMP /historical-price-full — highest high / lowest low, trailing 126 bars' },
      { label: 'Note',    value: '78.6% is a separate deep retracement level, not part of the golden pocket' },
    ],
    verdicts: [
      { color: 'green', text: 'Price inside zone — golden pocket, high-probability pullback entry' },
      { color: 'gold',  text: 'Price outside zone — wait for pullback toward 61.8%' },
    ],
    current: {
      text: inZone ? 'Inside zone' : 'Outside zone',
      verdict: inZone ? 'green' : 'gold',
      interpretation: inZone
        ? 'price is in the 61.8%–65% Fibonacci golden pocket'
        : 'not yet in the golden pocket; no Fib entry signal',
    },
  };
}

// ─── 8-Step Valuation ─────────────────────────────────────────────────────────

export function peTip(pe: number | null, epsSource: 'ttm' | 'annual-fallback' = 'ttm'): TipContent {
  let current: TipCurrent | undefined;
  if (pe === null) {
    current = { text: 'N/A', verdict: 'gray', interpretation: 'no positive EPS — P/E not applicable' };
  } else if (pe < 20) {
    current = { text: `${pe.toFixed(1)}×`, verdict: 'gold', interpretation: 'conservative (< 20)' };
  } else if (pe <= 39) {
    current = { text: `${pe.toFixed(1)}×`, verdict: 'green', interpretation: 'leader sweet spot (20–39)' };
  } else {
    current = { text: `${pe.toFixed(1)}×`, verdict: 'red', interpretation: 'high risk (≥ 40)' };
  }
  const isFallback = epsSource === 'annual-fallback';
  return {
    title: 'P/E Ratio — Principio V',
    lines: [
      {
        label: 'Formula',
        value: isFallback
          ? 'Current price ÷ latest annual diluted EPS (quarterly data unavailable)'
          : 'Current price ÷ sum of diluted EPS from last 4 reported quarters (TTM)',
      },
      {
        label: 'Source',
        value: isFallback
          ? 'FMP /quote (price) + /income-statement annual — quarterly fallback'
          : 'FMP /quote (price) + /income-statement?period=quarter&limit=4 (TTM EPS)',
      },
    ],
    verdicts: [
      { color: 'green', text: '20–39 — leader sweet spot' },
      { color: 'gold',  text: '< 20 — conservative; possible value but slow-growth signal' },
      { color: 'red',   text: '≥ 40 — high risk; growth expectations already priced in' },
      { color: 'gray',  text: 'Negative EPS — not yet profitable, P/E not applicable' },
    ],
    current,
  };
}

export function cashRunwayTip(months: number, debtToCapital: number): TipContent {
  const highDebt = debtToCapital > 60;
  let verdict: VerdictColor;
  let interp: string;
  if (months < 12)       { verdict = 'red';   interp = `capital risk${highDebt ? '; high debt load' : ''}`; }
  else if (months < 24)  { verdict = 'gold';  interp = `adequate runway${highDebt ? '; debt/cap elevated' : ''}`; }
  else                   { verdict = 'green'; interp = `solid runway${highDebt ? `; debt/cap ${debtToCapital.toFixed(0)}% elevated` : ''}`; }
  return {
    title: '② Cash Runway & Debt Load',
    lines: [
      { label: 'Runway',   value: 'Cash & equivalents ÷ (annual operating expenses ÷ 12)' },
      { label: 'Debt/Cap', value: 'Total debt ÷ (total debt + equity) × 100' },
      { label: 'Source',   value: 'FMP /balance-sheet-statement (latest annual)' },
    ],
    verdicts: [
      { color: 'green', text: '≥ 24 months runway — financially secure' },
      { color: 'gold',  text: '12–24 months — adequate; watch refinancing risk' },
      { color: 'red',   text: '< 12 months — capital risk; avoid unless turning profitable' },
    ],
    current: {
      text: months > 200 ? '>200 months' : `${months.toFixed(0)} months`,
      verdict,
      interpretation: interp,
    },
  };
}

export function salesGrowthTip(yoy: number, cagr3y: number | null, phase: string): TipContent {
  let verdict: VerdictColor;
  if (yoy > 20)      verdict = 'green';
  else if (yoy >= 5) verdict = 'green';
  else if (yoy >= 0) verdict = 'gold';
  else               verdict = 'red';
  const cagrStr = cagr3y !== null
    ? ` | 3yr CAGR: ${cagr3y >= 0 ? '+' : ''}${cagr3y.toFixed(1)}%`
    : '';
  return {
    title: '③ Revenue Growth — Principio II',
    lines: [
      { label: 'YoY',     value: '(Latest revenue − prior year revenue) ÷ prior year revenue' },
      { label: '3yr CAGR', value: '(Latest revenue ÷ 3-yr-ago revenue)^(1/3) − 1' },
      { label: 'Source',  value: 'FMP /income-statement (last 4 annual periods)' },
    ],
    verdicts: [
      { color: 'green', text: '> 20% YoY — Growth-Leader phase' },
      { color: 'green', text: '5–20% YoY — Mature phase (solid business)' },
      { color: 'gold',  text: '0–5% — Slow Growth; acceptable in value plays' },
      { color: 'red',   text: '< 0% — Declining; requires strong P/E discount' },
    ],
    current: {
      text: `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}% YoY${cagrStr}`,
      verdict,
      interpretation: `${phase} phase`,
    },
  };
}

export function avgMarginTip(margin: number): TipContent {
  let verdict: VerdictColor;
  let interp: string;
  if (margin >= 20)     { verdict = 'green'; interp = 'excellent margin (≥ 20%)'; }
  else if (margin >= 10) { verdict = 'green'; interp = 'solid margin (10–20%)'; }
  else if (margin >= 0)  { verdict = 'gold';  interp = 'thin margin (0–10%)'; }
  else                   { verdict = 'red';   interp = 'loss-making on average'; }
  return {
    title: '④ Avg Net Profit Margin (4-year)',
    lines: [
      { label: 'Formula', value: 'Net income ÷ revenue × 100, averaged over up to 4 annual periods' },
      { label: 'Source',  value: 'FMP /income-statement (up to 4 annual periods)' },
    ],
    verdicts: [
      { color: 'green', text: '≥ 20% — excellent; strong pricing power' },
      { color: 'green', text: '10–20% — solid; typical for profitable leaders' },
      { color: 'gold',  text: '0–10% — thin; sensitive to revenue fluctuation' },
      { color: 'red',   text: '< 0% — company burning cash on operations' },
    ],
    current: { text: `${margin.toFixed(1)}%`, verdict, interpretation: interp },
  };
}

export function avgPE6mTip(val: number | null): TipContent {
  return {
    title: '⑤ Avg P/E (6-Month)',
    lines: [
      { label: 'Formula', value: '6-month avg closing price ÷ trailing diluted EPS' },
      { label: 'Source',  value: 'FMP /historical-price-full (126 trading days) + /income-statement' },
      { label: 'Note',    value: 'Approximation — YCharts or Bloomberg for precise 6m avg P/E' },
    ],
    current: val !== null ? {
      text: `${val.toFixed(1)}×`,
      verdict: 'gold',
      interpretation: 'used as the P/E multiplier in step ⑦ (future market cap)',
    } : undefined,
  };
}

export function projectedNITip(revenue: number, ni: number): TipContent {
  return {
    title: '⑥ Projected Revenue & Net Income',
    lines: [
      { label: 'Revenue',  value: 'Latest revenue × (1 + growth rate); rate = min(YoY, 3yr CAGR) — conservative choice when the two diverge' },
      { label: 'Net Inc.', value: 'Projected revenue × 4-year avg net margin (step ④)' },
      { label: 'Source',   value: 'FMP /income-statement (last 4 annual periods)' },
    ],
    current: {
      text: `${fmtB(revenue)} rev → ${fmtB(ni)} NI`,
      verdict: ni > 0 ? 'green' : 'red',
      interpretation: ni > 0 ? 'profitable projection' : 'projected net loss',
    },
  };
}

export const futureMktCapTip: TipContent = {
  title: '⑦ Future Market Cap (1-Year Projection)',
  lines: [
    { label: 'Formula', value: 'Projected net income (step ⑥) × avg P/E 6-month (step ⑤)' },
    { label: 'Purpose', value: 'Estimates what the market might value the company at in ~1 year' },
    { label: 'Note',    value: 'Model estimate only — not a price target' },
  ],
};

export function possibleReturnTip(pct: number): TipContent {
  let verdict: VerdictColor;
  let interp: string;
  if (pct >= 50)      { verdict = 'green'; interp = 'high potential return (≥ 50%)'; }
  else if (pct >= 20) { verdict = 'green'; interp = 'strong potential return — meets Principio I threshold'; }
  else if (pct >= 0)  { verdict = 'gold';  interp = 'modest potential return (< 20%)'; }
  else                { verdict = 'red';   interp = 'model projects downside from current price'; }
  return {
    title: '⑧ Possible Return (8-Step Model)',
    lines: [
      { label: 'Formula', value: '(Future market cap ÷ current market cap) − 1' },
      { label: 'Source',  value: 'Output of steps ①–⑦; FMP /quote for current market cap' },
      { label: 'Note',    value: 'Model output only — not a price target. Verify with Principio I.' },
    ],
    verdicts: [
      { color: 'green', text: '≥ 50% — high potential; strong buy candidate' },
      { color: 'green', text: '20–50% — solid potential; meets Principio I threshold' },
      { color: 'gold',  text: '0–20% — modest; does not clear the 20% upside hurdle' },
      { color: 'red',   text: '< 0% — model projects decline from current price' },
    ],
    current: {
      text: `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`,
      verdict,
      interpretation: interp,
    },
  };
}

// ─── Analyst panel ────────────────────────────────────────────────────────────

export function consensusTargetTip(target: number, price: number): TipContent {
  const upside  = ((target - price) / price) * 100;
  const verdict: VerdictColor = upside >= 20 ? 'green' : upside >= 5 ? 'gold' : 'red';
  return {
    title: 'Analyst Consensus Price Target',
    lines: [
      { label: 'Source',      value: 'FMP /price-target-consensus — avg of all published analyst targets' },
      { label: 'Principio I', value: 'Requires ≥ 20% upside for a strong portfolio entry' },
    ],
    verdicts: [
      { color: 'green', text: '≥ 20% upside — Principio I PASS' },
      { color: 'gold',  text: '5–20% upside — some upside; below entry threshold' },
      { color: 'red',   text: '< 5% upside — limited or no consensus upside' },
    ],
    current: {
      text: `$${target.toFixed(0)} (${upside >= 0 ? '+' : ''}${upside.toFixed(1)}% upside)`,
      verdict,
      interpretation: upside >= 20
        ? 'meets Principio I entry threshold'
        : upside >= 5
        ? 'some upside; below 20% Principio I threshold'
        : 'limited consensus upside',
    },
  };
}

export const targetHighTip: TipContent = {
  title: 'Analyst Target — High',
  lines: [
    { label: 'Source', value: 'FMP /price-target-consensus — highest individual analyst price target' },
    { label: 'Use',    value: 'Bull-case scenario; defines reward side in R:R analysis (Principio VI)' },
  ],
};

export const targetLowTip: TipContent = {
  title: 'Analyst Target — Low',
  lines: [
    { label: 'Source', value: 'FMP /price-target-consensus — lowest individual analyst price target' },
    { label: 'Use',    value: 'Bear-case scenario; defines risk side in R:R analysis (Principio VI)' },
  ],
};

export function upsideTip(upside: number | null): TipContent {
  const verdict: VerdictColor = upside === null ? 'gray'
    : upside >= 20 ? 'green' : upside >= 5 ? 'gold' : 'red';
  return {
    title: 'Upside to Consensus Target',
    lines: [
      { label: 'Formula',     value: '(Consensus target − current price) ÷ current price × 100' },
      { label: 'Principio I', value: '≥ 20% required for a strong framework entry' },
    ],
    current: upside !== null ? {
      text: `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%`,
      verdict,
      interpretation: upside >= 20
        ? 'meets Principio I entry threshold'
        : upside >= 5
        ? 'some upside but below 20% threshold'
        : 'no meaningful consensus upside',
    } : undefined,
  };
}

// ─── Earnings ─────────────────────────────────────────────────────────────────

export const nextReportTip: TipContent = {
  title: 'Next Earnings Report Date',
  lines: [
    { label: 'Source', value: 'FMP /earning_calendar — upcoming event for this ticker' },
    { label: 'Use',    value: 'Avoid entering a position 1–2 weeks before earnings (binary risk)' },
  ],
};

export const lastReportTip: TipContent = {
  title: 'Last Earnings Report Date',
  lines: [
    { label: 'Source', value: 'FMP /earnings-surprises — most recent historical earnings event' },
  ],
};

export function epsActualEstTip(actual: number | null, estimated: number | null): TipContent {
  let current: TipCurrent | undefined;
  if (actual !== null) {
    if (estimated !== null && estimated !== 0) {
      const beat = actual > estimated;
      const pct  = ((actual - estimated) / Math.abs(estimated)) * 100;
      current = {
        text: `${actual.toFixed(2)} vs ${estimated.toFixed(2)}`,
        verdict: beat ? 'green' : 'red',
        interpretation: beat ? `beat by ${pct.toFixed(1)}%` : `missed by ${Math.abs(pct).toFixed(1)}%`,
      };
    } else {
      current = { text: `${actual.toFixed(2)} vs —`, verdict: 'gray', interpretation: 'no estimate available for comparison' };
    }
  }
  return {
    title: 'EPS Actual vs. Estimated',
    lines: [
      { label: 'Source', value: 'FMP /earnings-surprises — EPS actual and consensus estimate' },
      { label: 'Use',    value: 'Consistent beats signal execution quality; misses elevate risk' },
    ],
    verdicts: [
      { color: 'green', text: 'Beat — actual EPS above consensus estimate' },
      { color: 'red',   text: 'Miss — actual EPS below consensus estimate' },
    ],
    current,
  };
}

// ─── 7 Principles ─────────────────────────────────────────────────────────────

export function principleTip(p: PrincipleResult): TipContent {
  const current: TipCurrent = {
    text: p.status,
    verdict: statusVerdict(p.status),
    interpretation: p.headline,
  };

  switch (p.id) {
    case 1: return {
      title: 'Principio I — Price Target',
      lines: [
        { label: 'Formula',     value: '(Consensus target − price) ÷ price × 100' },
        { label: 'Source',      value: 'FMP /price-target-consensus' },
        { label: 'Principio I', value: 'Requires ≥ 20% upside for a strong portfolio entry' },
      ],
      verdicts: [
        { color: 'green', text: '≥ 20% upside — PASS' },
        { color: 'gold',  text: '5–20% upside — CAUTION; some upside, not ideal' },
        { color: 'red',   text: '< 5% upside — FAIL; not an entry' },
      ],
      current,
    };
    case 2: return {
      title: 'Principio II — Sales Growth',
      lines: [
        { label: 'Formula', value: '(Latest revenue − prior year revenue) ÷ prior year revenue' },
        { label: 'Source',  value: 'FMP /income-statement (last 4 annual periods)' },
      ],
      verdicts: [
        { color: 'green', text: '> 20% YoY — Growth-Leader (PASS)' },
        { color: 'green', text: '5–20% YoY — Mature phase (PASS)' },
        { color: 'gold',  text: '0–5% — Slow Growth (CAUTION)' },
        { color: 'red',   text: '< 0% — Declining (FAIL)' },
      ],
      current,
    };
    case 3: return {
      title: 'Principio III — 200-Day Rule',
      lines: [
        { label: 'Rule',    value: 'Buy only when price is below the 200-day simple moving average' },
        { label: 'Formula', value: 'Sum of last 200 closing prices ÷ 200' },
        { label: 'Source',  value: 'FMP /historical-price-full (200-day window)' },
      ],
      verdicts: [
        { color: 'green', text: 'Price below SMA200 — buy territory (PASS)' },
        { color: 'gold',  text: '0–10% above SMA200 — near threshold, caution' },
        { color: 'red',   text: '>10% above SMA200 — extended, not an entry (FAIL)' },
      ],
      current,
    };
    case 4: return {
      title: 'Principio IV — Conference Call',
      lines: [
        { label: 'Method', value: 'Listen to or read the latest earnings call transcript' },
        { label: 'Source', value: 'alphaspread.com or company IR page for transcripts' },
        { label: 'Check',  value: 'Tone, guidance, CEO confidence, red flag language, Q&A' },
      ],
      current: { text: 'MANUAL', verdict: 'purple', interpretation: 'human judgment required — cannot be automated' },
    };
    case 5: return {
      title: 'Principio V — P/E Ratio',
      lines: [
        { label: 'Formula', value: 'Current price ÷ diluted EPS (trailing 12 months)' },
        { label: 'Source',  value: 'FMP /quote (price) + /income-statement (diluted EPS)' },
      ],
      verdicts: [
        { color: 'green', text: '20–39 — leader sweet spot (PASS)' },
        { color: 'gold',  text: '< 20 — conservative; slow-growth signal (CAUTION)' },
        { color: 'red',   text: '≥ 40 — high risk; growth already priced in (FAIL)' },
        { color: 'gray',  text: 'Negative EPS — not yet profitable, P/E N/A' },
      ],
      current,
    };
    case 6: return {
      title: 'Principio VI — Support & Resistance',
      lines: [
        { label: 'Method',   value: 'Chart analysis: identify key support/resistance levels' },
        { label: 'R:R',      value: '≥ 1:3 for portfolio entries; ≥ 1:2 for swing trades' },
        { label: 'Source',   value: 'TradingView or brokerage chart — manual identification' },
      ],
      current: { text: 'MANUAL', verdict: 'purple', interpretation: 'chart analysis required — cannot be automated' },
    };
    case 7: return {
      title: 'Principio VII — Williams %R',
      lines: [
        { label: 'Formula', value: '(Highest High − Close) / (Highest High − Lowest Low) × −100' },
        { label: 'Source',  value: 'FMP /historical-price-full — 14-day high / low / close' },
      ],
      verdicts: [
        { color: 'green', text: '≤ −90 — extreme oversold (rare; portfolio entry)' },
        { color: 'green', text: '≤ −80 — oversold; watch for reversal (not yet entry)' },
        { color: 'green', text: 'Rising through −40 — swing momentum trigger' },
        { color: 'gold',  text: '−40 to −80 (flat/falling) — neutral, wait for signal' },
        { color: 'gold',  text: '−20 to −40 — neutral-bullish, not yet a trigger' },
        { color: 'red',   text: '> −20 — overbought, avoid entry' },
      ],
      current,
    };
    default: return { title: p.name, lines: [], current };
  }
}

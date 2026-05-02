import type { FMPHistoricalPrice, FMPQuote } from './fmp';

export interface Technicals {
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
  // Last 6 closes for avg P/E approximation
  avgClose6m: number;
}

function sma(prices: number[], period: number): number {
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function ema(prices: number[], period: number): number {
  if (prices.length < period) return sma(prices, prices.length);
  const k = 2 / (period + 1);
  let val = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    val = prices[i] * k + val * (1 - k);
  }
  return val;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? -c : 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function williamsRAt(
  highs: number[],
  lows: number[],
  closes: number[],
  idx: number,
  period = 14
): number {
  const start = Math.max(0, idx - period + 1);
  const hh = Math.max(...highs.slice(start, idx + 1));
  const ll = Math.min(...lows.slice(start, idx + 1));
  if (hh === ll) return -50;
  return ((hh - closes[idx]) / (hh - ll)) * -100;
}

export function computeTechnicals(
  history: FMPHistoricalPrice[],
  quote: FMPQuote
): Technicals {
  const closes = history.map(d => d.close);
  const highs = history.map(d => d.high);
  const lows = history.map(d => d.low);
  const n = closes.length;

  // SMA50/200 come directly from FMP quote (authoritative)
  const sma50 = quote.priceAvg50;
  const sma200 = quote.priceAvg200;

  // EMA50 from historical
  const ema50 = ema(closes, 50);

  // RSI(14)
  const rsi14 = rsi(closes);

  // Williams %R — current and recent values for trend detection
  const wrCurrent = williamsRAt(highs, lows, closes, n - 1);
  const wrMinus3 = n >= 4 ? williamsRAt(highs, lows, closes, n - 4) : wrCurrent;
  const wrMinus7 = n >= 8 ? williamsRAt(highs, lows, closes, n - 8) : wrMinus3;

  const wrTrend: Technicals['williamsRTrend'] =
    wrCurrent > wrMinus3 + 5 ? 'rising' : wrCurrent < wrMinus3 - 5 ? 'falling' : 'flat';

  // Crossing -40 upward: recently below -50, now above -45
  const williamsRCrossing40 = wrMinus7 < -50 && wrCurrent > -45 && wrCurrent < -30;

  // Fibonacci Golden Zone from 52-week high/low
  const high = quote.yearHigh;
  const low = quote.yearLow;
  const range = high - low;
  const fibGoldenZoneHigh = high - range * 0.618; // 61.8% retracement (shallower)
  const fibGoldenZoneLow = high - range * 0.786;  // 78.6% retracement (deeper)
  const price = quote.price;
  const inFibGoldenZone = price >= fibGoldenZoneLow && price <= fibGoldenZoneHigh;

  // 6-month avg close (≈126 trading days) for P/E approximation in valuation step 5
  const avgClose6m = sma(closes, Math.min(126, n));

  return {
    sma50,
    sma200,
    ema50,
    rsi14,
    williamsR: wrCurrent,
    williamsRTrend: wrTrend,
    williamsRCrossing40,
    fibGoldenZoneLow,
    fibGoldenZoneHigh,
    inFibGoldenZone,
    avgClose6m,
  };
}

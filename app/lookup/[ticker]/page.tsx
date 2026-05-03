import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, BookmarkPlus } from 'lucide-react';
import { analyzeTicker } from '@/lib/analyze';
import ThesisSection from './ThesisSection';
import { InfoTip, type TipContent, type TipCurrent, type VerdictColor } from '@/components/InfoTip';
import type { PrincipleResult, ValuationSteps } from '@/types/lookup';

export const dynamic = 'force-dynamic';

// ─── Tooltip current-value helpers ──────────────────────────────────────────

function wrCurrent(wr: number, trend: string, crossing40: boolean): TipCurrent {
  const text = `${wr.toFixed(0)} (${trend})`;
  let verdict: VerdictColor;
  let interpretation: string;
  if (crossing40)       { verdict = 'green'; interpretation = 'crossing −40 — swing momentum trigger'; }
  else if (wr <= -90)   { verdict = 'green'; interpretation = 'portfolio entry zone'; }
  else if (wr <= -80)   { verdict = 'green'; interpretation = 'oversold, watch for reversal'; }
  else if (wr <= -40)   { verdict = 'gold';  interpretation = 'neutral, no entry signal yet'; }
  else if (wr <= -20)   { verdict = 'gold';  interpretation = 'neutral-bullish, not a trigger yet'; }
  else                  { verdict = 'red';   interpretation = 'overbought — avoid entry'; }
  return { text, verdict, interpretation };
}

function peCurrent(pe: number | null): TipCurrent | undefined {
  if (pe === null) return undefined;
  const text = `${pe.toFixed(1)}×`;
  if (pe < 20)   return { text, verdict: 'gold',  interpretation: 'conservative (< 20)' };
  if (pe <= 39)  return { text, verdict: 'green', interpretation: 'leader sweet spot (20–39)' };
  return           { text, verdict: 'red',   interpretation: 'high risk (≥ 40)' };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PASS: '#34d399',
  CAUTION: '#fb923c',
  FAIL: '#f87171',
  MANUAL: '#a78bfa',
};

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtB(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtVol(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold tracking-wider"
      style={{
        color: STATUS_COLOR[status] ?? '#9ca3af',
        background: `${STATUS_COLOR[status] ?? '#9ca3af'}18`,
      }}
    >
      {status}
    </span>
  );
}

// ─── Sub-panels ─────────────────────────────────────────────────────────────

function PrincipleCard({ p }: { p: PrincipleResult }) {
  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: 'var(--bg)', border: `1px solid ${STATUS_COLOR[p.status] ?? 'var(--border)'}28` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Principio {['I','II','III','IV','V','VI','VII'][p.id - 1]}
        </span>
        <StatusBadge status={p.status} />
      </div>
      <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{p.name}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.headline}</p>
    </div>
  );
}

function ValuationRow({ label, value, note, tip }: { label: string; value: string; note?: string; tip?: TipContent }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="inline-flex items-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
        {tip && <InfoTip tip={tip} />}
      </span>
      <span className="text-xs font-mono font-semibold text-right" style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
        {value}
        {note && <span className="ml-1 text-[10px] opacity-50">{note}</span>}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function LookupPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;

  let analysis;
  try {
    analysis = await analyzeTicker(ticker);
  } catch {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <p className="text-lg font-semibold">Ticker &ldquo;{ticker}&rdquo; not found.</p>
        <Link href="/" className="text-sm underline" style={{ color: 'var(--gold)' }}>
          ← Back to search
        </Link>
      </main>
    );
  }

  const a = analysis;
  const up = a.change >= 0;
  const changeColor = up ? 'var(--green)' : 'var(--red)';

  const v: ValuationSteps = a.valuation;

  return (
    <main
      className="min-h-screen p-4 md:p-8 space-y-6 max-w-5xl mx-auto"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* ── Price Header ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}>
                {a.ticker}
              </h1>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{a.name}</span>
              {a.website && (
                <a href={a.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {a.sector} · {a.industry} · {a.exchange}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
              ${fmt(a.price)}
            </p>
            <p className="text-sm font-semibold flex items-center justify-end gap-1 mt-0.5" style={{ color: changeColor }}>
              {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {up ? '+' : ''}{fmt(a.change)} ({up ? '+' : ''}{fmt(a.changePercent, 2)}%)
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            ['Market Cap', fmtB(a.marketCap)],
            ['52w Range', `$${fmt(a.low52w)} – $${fmt(a.high52w)}`],
            ['Volume', fmtVol(a.volume)],
            ['Beta', fmt(a.beta, 2)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grid: Technicals + Analyst ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Technicals */}
        <div
          className="rounded-xl p-5 space-y-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Technicals
          </h2>
          <ValuationRow label="SMA 50" value={`$${fmt(a.sma50)}`} />
          <ValuationRow label="SMA 200" value={`$${fmt(a.sma200)}`} />
          <ValuationRow label="EMA 50" value={`$${fmt(a.ema50)}`} />
          <ValuationRow label="RSI (14)" value={fmt(a.rsi14, 0)} />
          <ValuationRow
            label="Williams %R"
            value={`${fmt(a.williamsR, 0)} (${a.williamsRTrend})`}
            tip={{
              title: 'Williams %R — 14-period',
              lines: [
                { label: 'Formula', value: '(Highest High − Close) / (Highest High − Lowest Low) × −100' },
                { label: 'Source',  value: '14-day high / low / close from FMP' },
              ],
              verdicts: [
                { color: 'green', text: '≤ −90 — portfolio entry zone' },
                { color: 'green', text: '≤ −80 — oversold, watch for reversal' },
                { color: 'green', text: 'Rising through −40 — swing momentum trigger' },
                { color: 'gold',  text: '−40 to −80 (flat/falling) — neutral, wait for signal' },
                { color: 'gold',  text: '−20 to −40 — neutral-bullish, not yet a trigger' },
                { color: 'red',   text: '> −20 — overbought, avoid entry' },
              ],
              current: wrCurrent(a.williamsR, a.williamsRTrend, a.williamsRCrossing40),
            }}
          />
          <ValuationRow
            label="Fib Golden Zone"
            value={`$${fmt(a.fibGoldenZoneLow)} – $${fmt(a.fibGoldenZoneHigh)}`}
            note={a.inFibGoldenZone ? '✓ IN ZONE' : ''}
          />
        </div>

        {/* Analyst */}
        <div
          className="rounded-xl p-5 space-y-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Analyst Consensus
          </h2>
          {a.priceTargetConsensus ? (
            <>
              <ValuationRow label="Consensus Target" value={`$${fmt(a.priceTargetConsensus)}`} />
              <ValuationRow label="Target High" value={a.priceTargetHigh ? `$${fmt(a.priceTargetHigh)}` : 'N/A'} />
              <ValuationRow label="Target Low" value={a.priceTargetLow ? `$${fmt(a.priceTargetLow)}` : 'N/A'} />
              <ValuationRow
                label="Upside to Consensus"
                value={a.upsideToConsensus !== null ? `${a.upsideToConsensus >= 0 ? '+' : ''}${fmt(a.upsideToConsensus, 1)}%` : 'N/A'}
              />
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No analyst coverage available.</p>
          )}
          <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Earnings</p>
            {a.nextEarningsDate && (
              <ValuationRow label="Next Report" value={a.nextEarningsDate} />
            )}
            {a.lastEarnings && (
              <>
                <ValuationRow label="Last Report" value={a.lastEarnings.date} />
                <ValuationRow
                  label="EPS Actual / Est"
                  value={`${a.lastEarnings.epsActual?.toFixed(2) ?? '—'} / ${a.lastEarnings.epsEstimated?.toFixed(2) ?? '—'}`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 7 Principles ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
          7 Principles
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {a.principles.map(p => <PrincipleCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* ── 8-Step Valuation ── */}
      <div
        className="rounded-xl p-5 space-y-1"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          8-Step Valuation
        </h2>
        <ValuationRow
          label="① P/E Ratio"
          value={v.pe.value !== null ? `${fmt(v.pe.value, 1)}x` : 'N/A'}
          note={`(${v.pe.category})`}
          tip={{
            title: 'P/E Ratio — Principio V',
            lines: [
              { label: 'Formula', value: 'Current price ÷ diluted EPS (trailing 12 months)' },
              { label: 'Source',  value: 'FMP live price + latest annual income statement' },
            ],
            verdicts: [
              { color: 'green', text: '20–39 — leader sweet spot' },
              { color: 'gold',  text: '< 20 — conservative; possible value but slow-growth signal' },
              { color: 'red',   text: '≥ 40 — high risk; growth expectations already priced in' },
              { color: 'gold',  text: 'Negative EPS — not yet profitable, P/E not applicable' },
            ],
            current: peCurrent(v.pe.value),
          }}
        />
        <ValuationRow
          label="② Cash Runway"
          value={v.cashRunway.months > 200 ? '>200 months' : `${v.cashRunway.months.toFixed(0)} months`}
          note={`Debt/Cap: ${v.cashRunway.debtToCapital.toFixed(1)}%`}
        />
        <ValuationRow
          label="③ Revenue Growth YoY"
          value={`${v.salesGrowth.yoy >= 0 ? '+' : ''}${fmt(v.salesGrowth.yoy, 1)}%`}
          note={v.salesGrowth.cagr3y !== null ? `3yr CAGR: ${v.salesGrowth.cagr3y.toFixed(1)}%` : undefined}
        />
        <ValuationRow label="④ Avg Net Margin (4yr)" value={`${fmt(v.avgMargin.value, 1)}%`} />
        <ValuationRow
          label="⑤ Avg P/E 6-Month"
          value={v.avgPE6m.value !== null ? `${fmt(v.avgPE6m.value, 1)}x` : 'N/A'}
          note="(approx)"
        />
        <ValuationRow
          label="⑥ Projected Revenue"
          value={fmtB(v.projectedNI.revenue)}
          note={`→ NI: ${fmtB(v.projectedNI.netIncome)}`}
        />
        <ValuationRow label="⑦ Future Mkt Cap" value={fmtB(v.futureMktCap.value)} />
        <div className="pt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>⑧ Possible Return</span>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: v.possibleReturn.value >= 0 ? 'var(--green)' : 'var(--red)',
              }}
            >
              {v.possibleReturn.value >= 0 ? '+' : ''}{v.possibleReturn.value.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Thesis (Suspense) ── */}
      <Suspense
        fallback={
          <div
            className="rounded-xl p-5 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              AI Investment Thesis
            </p>
            <div className="space-y-2">
              <div className="h-3 rounded" style={{ background: 'var(--border)', width: '80%' }} />
              <div className="h-3 rounded" style={{ background: 'var(--border)', width: '90%' }} />
              <div className="h-3 rounded" style={{ background: 'var(--border)', width: '60%' }} />
            </div>
          </div>
        }
      >
        <ThesisSection analysis={a} />
      </Suspense>

      {/* ── News ── */}
      {a.news.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
            Latest News
          </h2>
          <ul className="space-y-3">
            {a.news.map((item, i) => (
              <li key={i} style={{ borderBottom: i < a.news.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < a.news.length - 1 ? '0.75rem' : 0 }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-3 hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{item.title}</span>
                  <ExternalLink size={12} className="shrink-0 mt-0.5 opacity-40" />
                </a>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.site} · {new Date(item.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Add to Watchlist (Phase 4 placeholder) ── */}
      <div className="flex justify-center pb-8">
        <button
          disabled
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <BookmarkPlus size={15} />
          Add to Watchlist
          <span className="text-[10px] opacity-60">(Phase 4)</span>
        </button>
      </div>
    </main>
  );
}

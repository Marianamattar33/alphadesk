import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, BookmarkPlus } from 'lucide-react';
import { analyzeTicker } from '@/lib/analyze';
import ThesisSection from './ThesisSection';
import { InfoTip } from '@/components/InfoTip';
import type { TipContent } from '@/types/tips';
import type { PrincipleResult, ValuationSteps } from '@/types/lookup';
import {
  marketCapTip, range52wTip, volumeTip, betaTip,
  sma50Tip, sma200Tip, ema50Tip, rsiTip, wrTip, fibTip,
  peTip, cashRunwayTip, debtToCapTip, currentYearRevEstTip, avgMarginTip,
  avgPE6mTip, projectedNITip, futureMktCapTip, possibleReturnTip,
  consensusTargetTip, targetHighTip, targetLowTip, upsideTip,
  nextReportTip, lastReportTip, epsActualEstTip,
  principleTip,
} from '@/lib/tips';

export const dynamic = 'force-dynamic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PASS:    '#34d399',
  CAUTION: '#d4a656',
  FAIL:    '#f87171',
  MANUAL:  '#a78bfa',
};

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtB(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
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
        color:      STATUS_COLOR[status] ?? '#9ca3af',
        background: `${STATUS_COLOR[status] ?? '#9ca3af'}18`,
      }}
    >
      {status}
    </span>
  );
}

// ─── Sub-panels ──────────────────────────────────────────────────────────────

function PrincipleCard({ p }: { p: PrincipleResult }) {
  const tip = principleTip(p);
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
      <p className="text-xs font-semibold inline-flex items-center" style={{ color: 'var(--text)' }}>
        {p.name}
        <InfoTip tip={tip} />
      </p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.headline}</p>
    </div>
  );
}

function ValuationRow({ label, value, note, tip, valueColor }: { label: string; value: string; note?: string; tip?: TipContent; valueColor?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="inline-flex items-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
        {tip && <InfoTip tip={tip} />}
      </span>
      <span className="text-xs font-mono font-semibold text-right" style={{ color: valueColor ?? 'var(--text)', fontFamily: 'var(--font-mono)' }}>
        {value}
        {note && <span className="ml-1 text-[10px] opacity-50">{note}</span>}
      </span>
    </div>
  );
}

function HeroStat({ label, value, tip }: { label: string; value: string; tip?: TipContent }) {
  return (
    <div>
      <p className="inline-flex items-center text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
        {tip && <InfoTip tip={tip} />}
      </p>
      <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
        {value}
      </p>
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

  const a  = analysis;
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
          <HeroStat label="Market Cap"  value={fmtB(a.marketCap)}                         tip={marketCapTip(a.marketCap)} />
          <HeroStat label="52w Range"   value={`$${fmt(a.low52w)} – $${fmt(a.high52w)}`}  tip={range52wTip} />
          <HeroStat label="Volume"      value={fmtVol(a.volume)}                           tip={volumeTip} />
          <HeroStat label="Beta"        value={fmt(a.beta, 2)}                             tip={betaTip(a.beta)} />
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
          <ValuationRow label="SMA 50"      value={`$${fmt(a.sma50)}`}                              tip={sma50Tip(a.price, a.sma50)} />
          <ValuationRow label="SMA 200"     value={`$${fmt(a.sma200)}`}                             tip={sma200Tip(a.price, a.sma200)} />
          <ValuationRow label="EMA 50"      value={`$${fmt(a.ema50)}`}                              tip={ema50Tip(a.price, a.ema50)} />
          <ValuationRow label="RSI (14)"    value={fmt(a.rsi14, 0)}                                 tip={rsiTip(a.rsi14)} />
          <ValuationRow
            label="Williams %R"
            value={`${fmt(a.williamsR, 0)} (${a.williamsRTrend})`}
            tip={wrTip(a.williamsR, a.williamsRTrend, a.williamsRCrossing40)}
          />
          <ValuationRow
            label="Fib Golden Zone"
            value={`$${fmt(a.fibGoldenZoneLow)} – $${fmt(a.fibGoldenZoneHigh)}`}
            note={a.inFibGoldenZone ? '✓ IN ZONE' : ''}
            tip={fibTip(a.fibGoldenZoneLow, a.fibGoldenZoneHigh, a.inFibGoldenZone)}
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
              <ValuationRow
                label="Consensus Target"
                value={`$${fmt(a.priceTargetConsensus)}`}
                tip={consensusTargetTip(a.priceTargetConsensus, a.price)}
              />
              <ValuationRow
                label="Target High"
                value={a.priceTargetHigh ? `$${fmt(a.priceTargetHigh)}` : 'N/A'}
                tip={targetHighTip}
              />
              <ValuationRow
                label="Target Low"
                value={a.priceTargetLow ? `$${fmt(a.priceTargetLow)}` : 'N/A'}
                tip={targetLowTip}
              />
              <ValuationRow
                label="Upside to Consensus"
                value={a.upsideToConsensus !== null ? `${a.upsideToConsensus >= 0 ? '+' : ''}${fmt(a.upsideToConsensus, 1)}%` : 'N/A'}
                tip={upsideTip(a.upsideToConsensus)}
              />
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No analyst coverage available.</p>
          )}
          <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Earnings</p>
            {a.nextEarningsDate && (
              <ValuationRow label="Next Report" value={a.nextEarningsDate} tip={nextReportTip} />
            )}
            {a.lastEarnings && (
              <>
                <ValuationRow label="Last Report" value={a.lastEarnings.date} tip={lastReportTip} />
                <ValuationRow
                  label="EPS Actual / Est"
                  value={`${a.lastEarnings.epsActual?.toFixed(2) ?? '—'} / ${a.lastEarnings.epsEstimated?.toFixed(2) ?? '—'}`}
                  tip={epsActualEstTip(a.lastEarnings.epsActual, a.lastEarnings.epsEstimated)}
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
          tip={peTip(v.pe.value, v.pe.epsSource)}
        />
        <ValuationRow
          label="② Cash Runway"
          value={v.cashRunway.fcfPositive
            ? 'FCF-positive'
            : v.cashRunway.months > 200 ? '>200 months' : `${v.cashRunway.months.toFixed(0)} months`}
          note={v.cashRunway.fcfPositive && v.cashRunway.ttmFcf !== null
            ? `FCF: ${fmtB(v.cashRunway.ttmFcf)} TTM`
            : undefined}
          tip={cashRunwayTip(v.cashRunway.months, v.cashRunway.debtToCapital, v.cashRunway.fcfPositive, v.cashRunway.ttmFcf)}
        />
        <ValuationRow
          label="② Debt/Capital"
          value={`${v.cashRunway.debtToCapital.toFixed(1)}%`}
          valueColor={v.cashRunway.debtToCapital < 30 ? '#34d399' : v.cashRunway.debtToCapital <= 50 ? '#d4a656' : '#f87171'}
          tip={debtToCapTip(v.cashRunway.debtToCapital)}
        />
        <ValuationRow
          label="③ Current Year Revenue Est."
          value={v.salesGrowth.currentYearRevenue !== null ? fmtB(v.salesGrowth.currentYearRevenue) : 'N/A'}
          note={v.salesGrowth.currentYearRevenue !== null
            ? `${v.salesGrowth.numAnalysts} analysts`
            : 'No analyst coverage — forward valuation chain N/A for this stock'}
          tip={currentYearRevEstTip(v.salesGrowth.currentYearRevenue, v.salesGrowth.numAnalysts)}
        />
        <ValuationRow
          label="④ Avg Net Margin (4yr)"
          value={`${fmt(v.avgMargin.value, 1)}%`}
          tip={avgMarginTip(v.avgMargin.value)}
        />
        <ValuationRow
          label="⑤ Avg P/E 6-Month"
          value={v.avgPE6m.value !== null ? `${fmt(v.avgPE6m.value, 1)}x` : 'N/A'}
          note="(approx)"
          tip={avgPE6mTip(v.avgPE6m.value)}
        />
        <ValuationRow
          label="⑥ Projected Net Income"
          value={v.projectedNI.revenue !== null ? fmtB(v.projectedNI.revenue) : 'N/A'}
          note={v.projectedNI.netIncome !== null ? `→ NI: ${fmtB(v.projectedNI.netIncome)}` : undefined}
          tip={projectedNITip(v.projectedNI.revenue, v.projectedNI.netIncome)}
        />
        <ValuationRow
          label="⑦ Future Mkt Cap"
          value={v.futureMktCap.value !== null ? fmtB(v.futureMktCap.value) : 'N/A'}
          tip={futureMktCapTip}
        />
        <div className="pt-2">
          <div className="flex items-baseline justify-between">
            <span className="inline-flex items-center text-sm font-semibold" style={{ color: 'var(--text)' }}>
              ⑧ Possible Return
              <InfoTip tip={possibleReturnTip(v.possibleReturn.value)} />
            </span>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: v.possibleReturn.value === null
                  ? 'var(--text-muted)'
                  : v.possibleReturn.value >= 0 ? 'var(--green)' : 'var(--red)',
              }}
            >
              {v.possibleReturn.value !== null
                ? `${v.possibleReturn.value >= 0 ? '+' : ''}${v.possibleReturn.value.toFixed(0)}%`
                : 'N/A'}
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

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Public types (used by page.tsx to build tip content) ───────────────────

export type VerdictColor = 'green' | 'gold' | 'red';

export interface TipLine {
  label: string;   // "Formula", "Source", etc.
  value: string;
}

export interface TipVerdict {
  color: VerdictColor;
  text: string;    // colored-dot + rule in one line
}

export interface TipCurrent {
  text: string;           // formatted current value, e.g. "−41 (falling)"
  verdict: VerdictColor;
  interpretation: string; // e.g. "neutral zone, no entry yet"
}

export interface TipContent {
  title: string;
  lines: TipLine[];
  verdicts?: TipVerdict[];
  current?: TipCurrent;
}

// ─── Internal constants ──────────────────────────────────────────────────────

const DOT: Record<VerdictColor, string> = {
  green: '#34d399',
  gold:  '#d4a656',
  red:   '#f87171',
};

const HIDE_DELAY = 130; // ms — keeps tooltip alive while mouse travels button→card

// ─── Component ───────────────────────────────────────────────────────────────

export function InfoTip({ tip }: { tip: TipContent }) {
  const [open, setOpen]     = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos]       = useState({ top: 0, left: 0, arrowLeft: '50%', w: 360 });

  const btnRef     = useRef<HTMLButtonElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setOpen(false), HIDE_DELAY);
  }, [cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    if (!btnRef.current) return;
    const r   = btnRef.current.getBoundingClientRect();
    const w   = window.innerWidth < 640 ? 280 : 360;
    const btnX = r.left + r.width / 2;
    // Clamp so tooltip doesn't bleed off screen edges
    const clampedLeft = Math.min(Math.max(btnX, w / 2 + 12), window.innerWidth - w / 2 - 12);
    // Arrow offset: where the point sits relative to tooltip's left edge (as %)
    const arrowPct = ((btnX - (clampedLeft - w / 2)) / w * 100).toFixed(1);
    setPos({
      top:       r.bottom + 8,          // below the icon for now — flipped in render
      left:      clampedLeft,
      arrowLeft: `${arrowPct}%`,
      w,
    });
    setOpen(true);
  }, [cancelHide]);

  // Close on outside tap/click
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (cardRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    open ? setOpen(false) : show();
  }, [open, show]);

  const hasVerdicts = tip.verdicts && tip.verdicts.length > 0;

  return (
    <>
      {/* ⓘ trigger */}
      <button
        ref={btnRef}
        type="button"
        aria-label={`Info: ${tip.title}`}
        onClick={toggle}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginLeft: '5px',
          verticalAlign: 'middle',
          opacity: 0.35,
          color: 'var(--gold)',
          fontSize: '11px',
          lineHeight: 1,
          flexShrink: 0,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        ⓘ
      </button>

      {/* Tooltip portal */}
      {mounted && open && createPortal(
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{
            position: 'fixed',
            // pos.top is r.bottom + 8; we flip to above by using transform
            top:  pos.top,
            left: pos.left,
            // Move up by full own height + the 8px gap we added, so it sits above the button
            transform: `translate(-50%, calc(-100% - 16px))`,
            width: `${pos.w}px`,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          {/* Card */}
          <div
            ref={cardRef}
            style={{
              background:   '#0c1021',
              border:       '1px solid rgba(212,166,86,0.22)',
              borderRadius: '12px',
              padding:      '11px 13px',
              boxShadow:    '0 16px 48px rgba(0,0,0,0.7)',
            }}
          >
            {/* Title */}
            <p style={{
              color:         'var(--gold)',
              fontSize:      '10.5px',
              fontWeight:    700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom:  '8px',
            }}>
              {tip.title}
            </p>

            {/* Formula / Source lines */}
            {tip.lines.length > 0 && (
              <div style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           '3px',
                paddingBottom: (hasVerdicts || tip.current) ? '8px' : 0,
                marginBottom:  (hasVerdicts || tip.current) ? '8px' : 0,
                borderBottom:  (hasVerdicts || tip.current) ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                {tip.lines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', lineHeight: '1.5' }}>
                    <span style={{ color: 'rgba(212,166,86,0.5)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, minWidth: '46px' }}>
                      {line.label}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{line.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Verdicts — colored dots */}
            {hasVerdicts && (
              <div style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           '4px',
                paddingBottom: tip.current ? '8px' : 0,
                marginBottom:  tip.current ? '8px' : 0,
                borderBottom:  tip.current ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                {tip.verdicts!.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '11px', lineHeight: '1.5' }}>
                    <span style={{
                      display:      'inline-block',
                      width:        '6px',
                      height:       '6px',
                      borderRadius: '50%',
                      background:   DOT[v.color],
                      flexShrink:   0,
                      marginTop:    '4px',
                    }} />
                    <span style={{ color: 'rgba(255,255,255,0.72)' }}>{v.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Current value */}
            {tip.current && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', fontSize: '11px' }}>
                <span style={{ color: 'rgba(212,166,86,0.5)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '10px' }}>
                  Now
                </span>
                <span style={{
                  display:      'inline-block',
                  width:        '6px',
                  height:       '6px',
                  borderRadius: '50%',
                  background:   DOT[tip.current.verdict],
                  flexShrink:   0,
                }} />
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                  {tip.current.text}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.42)' }}>
                  — {tip.current.interpretation}
                </span>
              </div>
            )}
          </div>

          {/* Arrow pointer — downward triangle below the card */}
          <div style={{ position: 'relative', height: '7px', marginTop: '-1px' }}>
            {/* Outer (border colour) */}
            <div style={{
              position:    'absolute',
              top:         0,
              left:        pos.arrowLeft,
              transform:   'translateX(-50%)',
              width:       0,
              height:      0,
              borderLeft:  '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop:   '7px solid rgba(212,166,86,0.22)',
            }} />
            {/* Inner (card fill colour) */}
            <div style={{
              position:    'absolute',
              top:         0,
              left:        pos.arrowLeft,
              transform:   'translateX(-50%)',
              width:       0,
              height:      0,
              borderLeft:  '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop:   '6px solid #0c1021',
            }} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TipContent, VerdictColor } from '@/types/tips';

// Re-export types so existing imports from this module keep working
export type { VerdictColor, TipContent };
export type { TipLine, TipVerdict, TipCurrent } from '@/types/tips';

// ─── Internal constants ──────────────────────────────────────────────────────

const DOT: Record<VerdictColor, string> = {
  green:  '#34d399',
  gold:   '#d4a656',
  red:    '#f87171',
  purple: '#a78bfa',
  gray:   '#6b7280',
};

const HIDE_DELAY = 130; // ms — keeps tooltip alive while mouse travels button→card

// ─── Component ───────────────────────────────────────────────────────────────

export function InfoTip({ tip }: { tip: TipContent }) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0, arrowLeft: '50%', w: 360 });

  const btnRef    = useRef<HTMLButtonElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const r    = btnRef.current.getBoundingClientRect();
    const w    = window.innerWidth < 640 ? 280 : 360;
    const btnX = r.left + r.width / 2;
    const clampedLeft = Math.min(Math.max(btnX, w / 2 + 12), window.innerWidth - w / 2 - 12);
    const arrowPct = ((btnX - (clampedLeft - w / 2)) / w * 100).toFixed(1);
    setPos({ top: r.bottom + 8, left: clampedLeft, arrowLeft: `${arrowPct}%`, w });
    setOpen(true);
  }, [cancelHide]);

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
    if (open) { setOpen(false); } else { show(); }
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
          display:        'inline-flex',
          alignItems:     'center',
          marginLeft:     '5px',
          verticalAlign:  'middle',
          opacity:        0.35,
          color:          'var(--gold)',
          fontSize:       '11px',
          lineHeight:     1,
          flexShrink:     0,
          background:     'none',
          border:         'none',
          padding:        0,
          cursor:         'pointer',
          transition:     'opacity 0.15s',
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
            position:  'fixed',
            top:       pos.top,
            left:      pos.left,
            transform: 'translate(-50%, calc(-100% - 16px))',
            width:     `${pos.w}px`,
            zIndex:    9999,
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

            {/* Current value — stacked layout */}
            {tip.current && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                <span style={{
                  color:         'rgba(212,166,86,0.5)',
                  fontWeight:    700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize:      '10px',
                }}>
                  Now
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                </div>
                <span style={{ color: 'rgba(255,255,255,0.42)', paddingLeft: '12px' }}>
                  {tip.current.interpretation}
                </span>
              </div>
            )}
          </div>

          {/* Arrow pointer — downward triangle below the card */}
          <div style={{ position: 'relative', height: '7px', marginTop: '-1px' }}>
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

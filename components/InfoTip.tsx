'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TipLine {
  label: string;
  value: string;
}

export interface TipContent {
  title: string;
  lines: TipLine[];
}

// Keeps the tooltip visible while the mouse travels from the button into it
const HIDE_DELAY_MS = 120;

export function InfoTip({ tip }: { tip: TipContent }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
  }, [cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    // Position: centered above the button, clamped to viewport
    const tooltipW = 288;
    const rawLeft = r.left + r.width / 2;
    const clampedLeft = Math.min(
      Math.max(rawLeft, tooltipW / 2 + 8),
      window.innerWidth - tooltipW / 2 - 8
    );
    setPos({ top: r.top + window.scrollY - 8, left: clampedLeft });
    setOpen(true);
  }, [cancelHide]);

  // Close on outside click/tap
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      const tip = document.getElementById('infotip-portal');
      if (tip?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) { setOpen(false); } else { show(); }
  }

  const LABEL_COLORS: Record<string, string> = {
    PASS: '#34d399',
    CAUTION: '#fb923c',
    FAIL: '#f87171',
    MANUAL: '#a78bfa',
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Info: ${tip.title}`}
        onClick={toggle}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        className="inline-flex items-center align-middle ml-1 transition-opacity hover:opacity-100"
        style={{ opacity: 0.35, color: 'var(--gold)', fontSize: '11px', lineHeight: 1, flexShrink: 0 }}
      >
        ⓘ
      </button>

      {mounted && open && createPortal(
        <div
          id="infotip-portal"
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -100%)',
            width: '288px',
            zIndex: 9999,
            background: '#0d1220',
            border: '1px solid rgba(212,166,86,0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
          }}
        >
          <p style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {tip.title}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tip.lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', lineHeight: '1.5' }}>
                <span style={{
                  color: LABEL_COLORS[line.label] ?? 'rgba(212,166,86,0.6)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: '52px',
                }}>
                  {line.label}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{line.value}</span>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

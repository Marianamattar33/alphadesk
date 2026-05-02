import { generateThesis } from '@/lib/claude';
import type { StockAnalysis } from '@/types/lookup';

export default async function ThesisSection({ analysis }: { analysis: StockAnalysis }) {
  const thesis = await generateThesis(analysis);

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
        AI Investment Thesis
      </h2>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Structural (3–10yr)
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {thesis.structural}
        </p>
      </div>

      {thesis.tactical && (
        <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Tactical Entry
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            {thesis.tactical}
          </p>
        </div>
      )}
    </div>
  );
}

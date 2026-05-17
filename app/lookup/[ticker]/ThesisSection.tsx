import { generateThesis } from '@/lib/claude';
import type { StockAnalysis } from '@/types/lookup';
import Markdown from './Markdown';

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
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Structural (3–10yr)
        </p>
        <Markdown>{thesis.structural}</Markdown>
      </div>

      {thesis.tactical && (
        <div className="space-y-1 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Tactical Entry
          </p>
          <Markdown>{thesis.tactical}</Markdown>
        </div>
      )}
    </div>
  );
}

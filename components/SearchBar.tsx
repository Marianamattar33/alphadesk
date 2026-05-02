'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [ticker, setTicker] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = ticker.trim().toUpperCase();
    if (t) router.push(`/lookup/${t}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
          style={{ color: 'var(--gold)' }}
        />
        <input
          type="text"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          placeholder="Enter ticker — KO, ASML, NVDA..."
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>
      <button
        type="submit"
        disabled={!ticker.trim()}
        className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: 'var(--gold)', color: 'var(--bg)' }}
      >
        Analyze
      </button>
    </form>
  );
}

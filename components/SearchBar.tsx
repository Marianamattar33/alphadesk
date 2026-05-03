'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

interface Suggestion {
  symbol: string;
  name: string;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 280);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then((data: Suggestion[]) => {
        if (cancelled) return;
        setSuggestions(data);
        setOpen(data.length > 0);
        setHighlighted(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = useCallback((ticker: string) => {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    router.push(`/lookup/${ticker.toUpperCase().replace(/\./g, '-')}`);
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = query.trim();
    if (!t) return;
    if (highlighted >= 0 && suggestions[highlighted]) {
      navigate(suggestions[highlighted].symbol);
    } else {
      navigate(t);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          {loading ? (
            <Loader2
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: 'var(--gold)' }}
            />
          ) : (
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              style={{ color: 'var(--gold)' }}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ticker or company — KO, Coca-Cola, AVGO..."
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--gold)', color: 'var(--bg)' }}
        >
          Analyze
        </button>
      </form>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {suggestions.map((s, i) => (
            <li key={s.symbol}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); navigate(s.symbol); }}
                onMouseEnter={() => setHighlighted(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                style={{
                  background: i === highlighted ? 'rgba(212,166,86,0.08)' : 'transparent',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span
                  className="text-sm font-bold w-16 shrink-0"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}
                >
                  {s.symbol}
                </span>
                <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                  {s.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

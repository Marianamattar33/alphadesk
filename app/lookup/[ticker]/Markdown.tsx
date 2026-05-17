'use client';

import ReactMarkdown from 'react-markdown';

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p:      ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0" style={{ color: 'var(--text)' }}>{children}</p>,
        strong: ({ children }) => <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{children}</strong>,
        ul:     ({ children }) => <ul className="space-y-0.5 my-1.5 pl-4 list-disc" style={{ color: 'var(--text)' }}>{children}</ul>,
        li:     ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
        hr:     () => <hr style={{ borderColor: 'var(--border)', marginTop: '8px', marginBottom: '8px' }} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

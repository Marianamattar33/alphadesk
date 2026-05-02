export default function Home() {
  return (
    <main
      style={{ background: "var(--bg)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-6"
    >
      <div className="text-center max-w-xl">
        {/* Logo / wordmark */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: "var(--gold)", color: "var(--bg)" }}
          >
            A
          </div>
          <span
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: "var(--text)" }}
          >
            AlphaDesk
          </span>
        </div>

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-8"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border-light)",
            color: "var(--gold)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--gold)" }}
          />
          Phase 1 — Foundation deploying
        </div>

        {/* Headline */}
        <h1
          className="text-4xl font-light mb-4 leading-tight"
          style={{ color: "var(--text)" }}
        >
          Institutional intelligence,{" "}
          <span style={{ color: "var(--gold-bright)" }}>built on Abacus</span>
        </h1>

        <p className="text-base mb-10" style={{ color: "var(--text-dim)" }}>
          Your personal investment dashboard. 7 Principles. 8-Step Valuation.
          Live data. AI-powered thesis generation.
        </p>

        {/* Roadmap pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-16">
          {[
            { label: "Foundation", done: true },
            { label: "Universal Lookup", done: false },
            { label: "Core Tabs", done: false },
            { label: "Persistence", done: false },
            { label: "Automation", done: false },
          ].map(({ label, done }) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: done ? "var(--green-dim)" : "var(--bg-elev)",
                color: done ? "#fff" : "var(--text-faint)",
                border: `1px solid ${done ? "var(--green)" : "var(--border)"}`,
              }}
            >
              {done ? "✓ " : ""}{label}
            </span>
          ))}
        </div>

        {/* Faith note */}
        <p
          className="text-xs italic"
          style={{ color: "var(--text-faint)" }}
        >
          &ldquo;Time will pass anyway. Work gives results &mdash; not when we want, but when we are prepared to sustain it.&rdquo;
        </p>
      </div>
    </main>
  );
}

# AlphaDesk Project — Handoff to Claude Code

**Project owner:** Mariana (GitHub: Marianamattar33)
**Date:** May 2026
**Goal:** Build a personal institutional-grade investment intelligence dashboard

---

## Read this first

Hi Claude. I'm a different Claude instance who designed this project with Mariana over many hours in Claude.ai. This document captures everything we decided. **Read it carefully before doing anything**, because the architecture is locked and Mariana has invested significant effort getting it right.

She is **not a developer**. She is a finance professional (Siemens Energy) who is learning. Be patient, explain things, but don't be condescending. She's smart — she just hasn't done this before. When something goes wrong, walk her through fixing it the same way I have been.

---

## The reference artifact

In this folder she has `AlphaDesk_v3.jsx` — a 4,112-line single-file React component we built in Claude.ai as an artifact. It is a **specification in code form**, not the final product. It contains:

- All design tokens, typography, color system
- 30-stock universe with full fundamentals (with placeholder data — needs to be replaced with live data)
- All 14 tab components (Command Center, Macro, Sectors, Screener, Deep Dive, Technicals, Sizing/Kelly, Portfolio, Weekly Review, Journal, Alt Data, 13F, AI Chat, Settings)
- Indicator interpretation engine (the `grade()` function)
- Mariana's Abacus framework integrated throughout

**Use this as the visual + UX reference.** Port it into a real Next.js project structure, replacing placeholder data with live API data.

---

## Mariana's investment framework (Abacus Experience course)

This is sacred — do not deviate without her approval.

### The 7 Principles
1. **Price Target** — analyst consensus, ≥20% upside ideal
2. **Sales Growth (Crecimiento en Ventas)** — Mature + Growth-Leader phases preferred per course
3. **Ley de 200 días** — buy below SMA 200
4. **Conference Call** — alphaspread.com transcripts, AI-evaluated
5. **P/E Ratio** — <20 conservative, **20-39 leader sweet spot**, 40+ high risk
6. **Soportes y Resistencias** — R:R 1:3 for portfolio, 1:2 minimum for swing
7. **Williams %R** — at -90 = portfolio entry, **rising through -40 = swing momentum trigger**

### The 8-step valuation (Principio V)
1. P/E Ratio current + categorize
2. Cash runway (months) = Total Cash / (Operating Expenses / 12), plus Debt to Capital vs industry
3. Sales growth estimate (Yahoo Finance/Analysis)
4. Profit margin AVG (4-year)
5. P/E 6-month AVG (YCharts)
6. Net Income projection = Sales × Profit Margin
7. Market Cap Futuro = NI × Avg PE
8. Possible Return = (MC Futuro / MC Presente) - 1

### The 5-step entry (technical setup)
1. Find bearish structure (penultimate Lower Low)
2. Confirm structural change (HH/HL forming)
3. Price in **Fibonacci Golden Zone 61.8% – 78.6%** (NOT 50-61.8% — this is her course's specific zone)
4. R:R ≥ 1:3 (portfolio) or 1:2 (swing)
5. EMA 50 break + retest, Williams %R rising through -40

---

## Capital framework (locked)

- **Starting capital:** $10,000
- **Monthly DCA:** $500
- **Max position per stock:** 15% (NOTE: course says 5%, but Mariana approved my recommendation of 15%)
- **Max position per ETF:** 25%
- **Max effective sector exposure:** 35% (with ETF lookthrough)
- **Drawdown circuits:** position -20% triggers thesis review, portfolio -15% from ATH stops new buys for 2 weeks
- **Position sizing:** Half Kelly, capped, 3-tranche scaling (40/35/25)

### Tier framework (core-satellite)
- **Tier 1 Core:** 55-65% — 3-10yr holds, quarterly review, sell only on structural thesis break
- **Tier 2 ETF:** 20-25% — forever holds, never sell
- **Tier 3 Tactical:** 10-20% — 3-18mo, weekly review

### Cash reserve (regime-driven)
| Regime | Cash % |
|---|---|
| Risk-on | 5-10% |
| Neutral | 15-20% |
| Cautious (current) | 25-30% |
| Defensive | 35-45% |
| Crisis | Deploy aggressively |

---

## Mariana's profile

- Based in Hamburg, Germany; Argentine citizen
- Trades via TradeStation (Argentine broker registration for US-listed access)
- US-only universe, ETFs included (loves QQQM and SMH)
- Long-term focus + tactical swing overlay (NOT day trading — explicitly excluded)
- Watchlist starting names: AVGO, TSM, ASML, GOOG, TSLA, NVDA, MSFT, AAPL, AMZN, PANW, NOW, TTWO, META, plus QQQM/SMH/VOO ETFs
- 2026 objective: "Don't lose money, gain experience, build a good portfolio, continue learning, attend Abacus premarket meetings, be in the community."

---

## The technology stack we agreed on

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS (the artifact uses inline styles, but we agreed Tailwind for the real build)
- **Hosting:** Vercel (free Hobby plan)
- **Database:** Supabase (free tier) for journal entries, positions, thesis tracking
- **Auth:** Supabase Auth (or NextAuth, your call)
- **Financial data:** Financial Modeling Prep API (Mariana has free tier API key, will upgrade to $14/month Starter when ready)
- **Macro data:** FRED API (free, no key needed initially) — for VIX, yield curve, CPI, etc.
- **AI features:** Anthropic Claude API for thesis generation, conference call analysis, chat
- **Code quality:** ESLint + Prettier
- **Git:** GitHub (repo to be created at github.com/Marianamattar33/alphadesk)

---

## Phased build plan

### Phase 1 — Foundation (today's session)
- [ ] Create Next.js + TypeScript project with Tailwind
- [ ] Initialize Git repo
- [ ] Push to GitHub (new repo: alphadesk)
- [ ] Connect Vercel for auto-deploy
- [ ] Get a "Hello World" home page deployed to Vercel
- [ ] Set up environment variable structure for API keys (`.env.local`, `.env.example`)

**Deliverable Phase 1:** A live URL on Vercel showing a basic AlphaDesk landing page.

### Phase 2 — Universal Lookup (highest-priority feature)
This was Mariana's specific request: **search any ticker, get full analysis in 5 seconds**.
- [ ] FMP API client wrapper
- [ ] Computed technicals (SMA, RSI, Williams %R, Fib Golden Zone, etc.)
- [ ] 7 Principles auto-evaluation
- [ ] 8-step valuation calculator
- [ ] AI thesis generator (calls Anthropic API)
- [ ] "Add to Watchlist" persistence (Supabase)

**Deliverable Phase 2:** Type any ticker → full analysis appears.

### Phase 3 — Core tabs (live data)
- [ ] Command Center with live macro
- [ ] Screener (live universe)
- [ ] Deep Dive (live stock)
- [ ] Technicals (live indicators)
- [ ] Sizing/Kelly

### Phase 4 — Persistence
- [ ] Supabase schema (positions, journal, theses)
- [ ] Auth
- [ ] Position tracking with cost basis & P&L

### Phase 5 — Automation
- [ ] Daily score recomputation (Vercel cron)
- [ ] Weekly thesis refresh
- [ ] Earnings call auto-analysis
- [ ] Email alerts (Resend)

---

## Features explicitly deferred (don't build yet)

Mariana asked these be remembered but not built now:

- Position-level P&L tracking with cost basis (Phase 4)
- Drawdown attribution
- Correlation heatmap with effective beta
- Stop-loss adherence tracking
- Score component decomposition
- Pre-mortem analysis prompt
- Earnings-implied move pricing
- News sentiment quantification
- Tax-aware decision making (Argentine + German cross-border)
- Risk parity / vol targeting in sizing
- Options/derivatives (Mariana excluded for 2026)

---

## Working principles with Mariana

1. **Always pre-fill, never make her input twice.** Click a stock → it auto-loads in every relevant tab.
2. **Every indicator gets colored + a verdict + a tooltip.** Never raw numbers without interpretation.
3. **Every stock has a written thesis** — not just metrics. Use AI to generate fresh ones.
4. **Use her Abacus framework** when applicable. Reference the 7 Principles by Roman numeral (Principio I, II, etc.) so she recognizes the language.
5. **Be honest about limitations.** When something can't be done or data is unavailable, say so.
6. **Migrate iteratively.** Get one thing working, deploy, test, then move on. Don't try to port everything at once.
7. **The faith note from her notes** — *"Time will pass anyway. Work gives results — not when we want, but when we are prepared to sustain it"* — should appear somewhere subtle (Command Center footer or similar).

---

## Where to start this session

1. Greet her warmly. Acknowledge she just finished a long setup.
2. Initialize a Next.js + TypeScript + Tailwind project in this folder.
3. Set up the basic file structure and a home page that says something like "AlphaDesk — Building..."
4. Walk her through creating the GitHub repo.
5. Connect Vercel.
6. Get the deploy working.
7. Show her the live URL.

**That's a successful first session.** Don't try to do more — Phase 2 starts in a follow-up.

---

## Important meta-notes

- She has `AlphaDesk_v3.jsx` in this folder. **Read it** when designing the real components — the design language, color system, and component patterns should match. Use it as visual reference.
- Mariana's API keys live in her Notes app, not here. Ask her for them when needed (e.g., for `.env.local`).
- Her time zone is Berlin (CET). She's working from Hamburg.
- She uses VS Code or Cursor as her editor (recommend Cursor if she hasn't picked yet — VS Code with built-in AI is a better fit).

---

Good luck. She's been a great collaborator — patient, thoughtful, and willing to push back on bad ideas. Treat her as the smart non-coder she is. Build her something she'll actually use to invest real money.

— The Claude.ai instance that designed this

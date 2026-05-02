import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Activity, Target, Shield, AlertTriangle,
  Zap, Eye, Brain, BookOpen, Settings, Briefcase, BarChart3, Globe,
  Users, FileText, Send, Sparkles, ChevronRight, Search, Filter,
  ArrowUpRight, ArrowDownRight, Minus, Plus, DollarSign, Percent,
  Calendar, Clock, CheckCircle2, XCircle, CircleDot, Flame,
  Gauge, LineChart as LineChartIcon, Layers, Award, Info, RefreshCw,
  AlertCircle, MessageCircle, Bookmark, Trash2, Edit3, Save, Copy,
  Crown, Anchor, Compass, Star
} from "lucide-react";

/* =============================================================================
   ALPHADESK v3 — Institutional investment intelligence, built on Abacus framework
   Built: April 2026 | For: Mariana | Platform: TradeStation
   
   FRAMEWORK:
   • 7 Principles (Price Target, Sales Growth, SMA 200, Conference Call,
                   P/E Ratio, Support/Resistance, Williams %R)
   • 8-Step Valuation (PE → Cash/Debt → Sales → Margin → Avg PE → NI → Mkt Cap → Return)
   • 5-Step Entry (Bearish structure → Change → Fib 61.8-78.6 → R:R 1:3 → Entry)
   
   CAPITAL RULES:
   • Max 15% per stock | Max 25% per ETF | 35% max sector (ETF lookthrough)
   • Tier 1 core 55-65% | Tier 2 ETF 20-25% | Tier 3 tactical 10-20%
   • Cash reserve regime-driven (25-30% current cautious)
   • $10k base + $500/month DCA
   
   EVERY INDICATOR: colored + verdict + tooltip
============================================================================= */

/* =============== DESIGN TOKENS =============== */
const T = {
  bg: "#0a0e1a", bgCard: "#101726", bgCardHover: "#141c2e", bgElev: "#1a2236",
  border: "#1e2942", borderLight: "#2a3756",
  text: "#e8ecf4", textDim: "#8b94a8", textFaint: "#5a6478",
  gold: "#d4a656", goldBright: "#f5c771",
  green: "#34d399", greenDim: "#10b981",
  red: "#f87171", redDim: "#ef4444",
  blue: "#60a5fa", cyan: "#22d3ee",
  purple: "#a78bfa", orange: "#fb923c",
};

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300..900;1,300..900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

/* =============== MACRO STATE (April 19, 2026) =============== */
const MACRO = {
  asOf: "April 19, 2026",
  regime: "CAUTIOUS — STAGFLATION RISK ELEVATED",
  regimeShort: "Cautious",
  regimeColor: T.orange,
  regimeCash: { min: 25, max: 30 },
  spx: { level: 6582, ytd: 2.1, sma50: 6783, sma200: 6450, pctAbove200: 48, trend: "Below 50DMA, testing 200DMA support" },
  vix: { level: 20.4, label: "Elevated", color: T.orange, interp: "Elevated — market pricing in above-normal volatility, fear over complacency" },
  fearGreed: { val: 28, label: "Fear", color: T.red, interp: "Fear zone typically precedes better forward returns than Greed zones" },
  aaii: { bull: 28, bear: 45, neutral: 27, interp: "Bearish — contrarian positive" },
  naaim: { exposure: 62, interp: "Active managers moderately positioned, below euphoric 90+" },
  fed: { rate: "4.00–4.25%", stance: "Hold", nextMeet: "May 6–7", cuts2026: "Priced: 1–2 more", dotplot: "3.75% median by year-end" },
  inflation: { cpi: 3.6, core: 3.2, pce: 3.3, breakevens: 2.5, trend: "Sticky, revised higher" },
  yields: { ten: 4.38, two: 3.92, spread: 0.46, threeMonth: 4.22, tenMinusThreeM: 0.16, shape: "Normalizing", interp: "Just barely normalized — historically a recession warning" },
  dollar: { dxy: 101.2, trend: "Weakening" },
  oil: { brent: 118, wti: 112, trend: "Elevated — Iran tensions" },
  gold: { spot: 3420, trend: "Near record highs" },
  copper: { price: 5.12, trend: "Supply deficit story intact" },
  creditSpread: { hyIg: 3.2, interp: "Moderate stress, not crisis" },
  recession: { prob: 50, shift: "Up from 25% in Jan" },
  earnings: { spxEps2026: 282, growth: 12.5 },
  action: "Defensive quality, energy beneficiary, selective AI dip-buying. Avoid extended names. Wait for SPX to reclaim 6,780 or test 6,300 for aggressive entries.",
  rotation: [
    { sec: "Energy", sig: "LEADING", ret: "+34%", col: T.green, theme: "Geopolitics/oil shock" },
    { sec: "Defense", sig: "STRONG", ret: "+18%", col: T.green, theme: "Iran tensions" },
    { sec: "Utilities", sig: "ROTATING IN", ret: "+11%", col: T.green, theme: "AI power demand + defensive" },
    { sec: "Materials", sig: "ACCUMULATING", ret: "+7%", col: T.blue, theme: "Copper supply deficit" },
    { sec: "Financials", sig: "MIXED", ret: "+3%", col: T.gold, theme: "NII vs credit concerns" },
    { sec: "Healthcare", sig: "DEFENSIVE", ret: "+2%", col: T.gold, theme: "GLP-1 + defensive rotation" },
    { sec: "Tech — Mag7", sig: "UNDER PRESSURE", ret: "-8%", col: T.red, theme: "AI capex ROI questioned" },
    { sec: "Consumer Disc", sig: "WEAKENING", ret: "-6%", col: T.red, theme: "Consumer slowdown signals" },
    { sec: "Semis", sig: "VOLATILE", ret: "-4%", col: T.orange, theme: "Sentiment-driven swings" },
  ],
};

/* =============== STOCK UNIVERSE =============== */
/* 30+ stocks with full institutional fundamentals, 7 principles evaluation,
   written theses, conference call summaries, tier assignment.
   All data verified to April 19, 2026. */

const UNIVERSE = [
  // ==================== MAG7 / AI ====================
  {
    t: "NVDA", name: "NVIDIA", sector: "Semis — AI", industry: "GPU / Compute",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Growth-Leader",
    price: 104, sma50: 112, sma200: 108, ema50: 110, ytd: -4.7, high52: 153, low52: 87,
    mcap: 2550, shares: 24.5,
    // Fundamentals
    fwdPE: 21, peHist5y: 48, peHist6m: 24, peg: 0.4,
    roic: 126, roe: 104, roa: 62, margin: 56, grossMargin: 75, netMargin: 51,
    revGrowth: 62, revGrowth3y: 95, revGrowth1y: 62, epsGrowth: 71, epsGrowthFwd: 55,
    debtEbitda: 0.1, netDebtEbitda: -0.4, intCoverage: 150, currentRatio: 4.2, quickRatio: 3.9,
    altmanZ: 28, piotroskiF: 8,
    fcfYield: 3.2, psRatio: 18, pbRatio: 42, evEbitda: 22, evFcf: 31, fcfMargin: 47,
    totalCash: 48, opEx: 28, cashRunway: 20.5, debtToCapital: 15, industryDebtAvg: 28,
    buybackYield: 1.8, divYield: 0.03, shareholderYield: 1.8, shareCount5y: "-2%",
    insiderOwn: 3.8, insiderTrend: "Selling (normal vesting)",
    instOwn: 68, shortInterest: 1.2, putCallRatio: 0.6,
    // Technicals
    rsi: 41, williams: -62, williamsRising: true, vol30d: "High", beta: 1.8,
    atr: 4.8, bollPosition: "Lower band",
    macd: { line: -1.2, signal: -0.8, hist: -0.4, cross: "Bearish" },
    stoch: 32,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 153, fibLow: 87, fibGoldenLow: 94.8, fibGoldenHigh: 117.0,
    vwap: { daily: 106, weekly: 109, monthly: 115, anchoredEarnings: 119 },
    obvTrend: "Flat/slight down — institutional holding",
    cmf: -0.08,
    rsVsSpy: -6.8, rsVsSector: -2.1,
    // Analyst
    analystTarget: 165, upside: 58, analystCount: 52, buyRating: 45,
    earnings: "May 28, 2026", earningsReaction: [{ q: "Q4 25", move: "+3.2%" }, { q: "Q1 26", move: "-8.4%" }, { q: "Q2 26", move: "+5.1%" }],
    lastRevision: { date: "Apr 12", action: "Raised target $155→$165", firm: "Morgan Stanley" },
    // Alt Data
    politicalSig: 4, govContract: 3, insider: 3,
    smartMoney13F: { funds: 12, trend: "Mixed — 7 adding, 5 trimming", highlight: "Baillie Gifford added 15%" },
    // Qualitative
    catalysts: "Blackwell ramp, Rubin roadmap, sovereign AI deals, China resumption", 
    risks: "AI capex skepticism, competition, export controls, customer concentration",
    moat: "Wide — CUDA ecosystem lock-in, architecture lead",
    // Thesis (dual-layer)
    structuralThesis: "NVIDIA is the foundational infrastructure layer of the AI revolution. CUDA + architecture lead creates 2-3 year moats. 126% ROIC signals a business category unlike any other semi historically. As AI shifts from training to inference (2026-2028), NVDA will monetize both.",
    structuralInvalidation: "AI demand collapses (>30% revenue decline for 2+ quarters), OR custom silicon (AVGO/GOOG TPU) takes >40% of accelerator TAM, OR CUDA alternative (ROCm) gains enterprise traction",
    tacticalThesis: "PE at 5-year lows (21 vs historical 48). Market pricing in AI trough. Blackwell cycle fresh, Rubin coming 2027. -32% drawdown from 52w high creates generational entry if structural thesis holds.",
    tacticalInvalidation: "Price breaks below $87 (52w low) — would indicate structural thesis in jeopardy",
    tacticalCompletion: "SMA 200 reclaim at $108 with earnings confirmation on May 28",
    // Conference call summary
    lastCall: {
      date: "Feb 26, 2026 (Q4 FY26)",
      bullSignals: [
        "Data center revenue grew 78% YoY, above highest analyst estimate",
        "Blackwell ramping faster than Hopper did",
        "Hyperscaler capex commitments for 2026 'unchanged'",
      ],
      redFlags: [
        "Gross margin guide 72-73% for Q1 (vs 74% Q4) — mix shift",
        "China revenue capped by export controls, no H200 resumption yet",
        "Inventory up 18% — building for Blackwell or softening demand?",
      ],
      tone: "Confident, specific on metrics, defensive on margin compression",
      verdict: "QUALIFIES — long-term structural story intact. Short-term margin concerns create tactical entry.",
    },
    // Score — weighted by regime (cautious favors quality + value)
    score: 82, verdict: "STRONG BUY ZONE", allocation: "Core",
    // 7 principles evaluation
    p1_priceTarget: { pass: true, val: "+58%", note: "Analyst target $165 vs $104 — significant upside" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "62% rev growth, AI sector leader" },
    p3_sma200: { pass: true, val: "-3.7%", note: "Just below SMA 200 — entry zone per course" },
    p4_confCall: { pass: true, val: "Qualified", note: "Structural thesis confirmed in Q4 FY26 call" },
    p5_peRatio: { pass: true, val: "21 (medium)", note: "PE below 5Y avg of 48 and below 6M avg of 24" },
    p6_supportResist: { pass: true, val: "R:R 1:4.1", note: "Support $87, resistance $153, entry $104 = 1:4.1" },
    p7_williams: { pass: true, val: "-62 rising", note: "Rising from oversold, approaching -40 momentum trigger" },
    principlesPassed: 7,
  },
  {
    t: "MSFT", name: "Microsoft", sector: "Software — AI", industry: "Cloud / Productivity",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Mature",
    price: 295, sma50: 345, sma200: 380, ema50: 338, ytd: -23, high52: 468, low52: 285,
    mcap: 2200, shares: 7.45,
    fwdPE: 23, peHist5y: 32, peHist6m: 28, peg: 1.9,
    roic: 28.8, roe: 38, roa: 16, margin: 37, grossMargin: 70, netMargin: 36,
    revGrowth: 14, revGrowth3y: 15, revGrowth1y: 14, epsGrowth: 12, epsGrowthFwd: 14,
    debtEbitda: 0.3, netDebtEbitda: 0.1, intCoverage: 28, currentRatio: 1.8, quickRatio: 1.8,
    altmanZ: 10, piotroskiF: 8,
    fcfYield: 3.8, psRatio: 9, pbRatio: 9, evEbitda: 18, evFcf: 26, fcfMargin: 30,
    totalCash: 76, opEx: 54, cashRunway: 16.9, debtToCapital: 31, industryDebtAvg: 40,
    buybackYield: 1.6, divYield: 0.8, shareholderYield: 2.4, shareCount5y: "-3%",
    insiderOwn: 0.03, insiderTrend: "Neutral",
    instOwn: 72, shortInterest: 0.7, putCallRatio: 0.8,
    rsi: 32, williams: -78, williamsRising: false, vol30d: "Elevated", beta: 0.9,
    atr: 8.4, bollPosition: "Below lower band",
    macd: { line: -18, signal: -12, hist: -6, cross: "Bearish" },
    stoch: 22,
    goldenCross: false, deathCross: true, goldenDeathStatus: "Death Cross (bearish)",
    fibHigh: 468, fibLow: 285, fibGoldenLow: 324.5, fibGoldenHigh: 388.4,
    vwap: { daily: 298, weekly: 312, monthly: 342, anchoredEarnings: 385 },
    obvTrend: "Down — distribution",
    cmf: -0.22,
    rsVsSpy: -25, rsVsSector: -18,
    analystTarget: 425, upside: 44, analystCount: 56, buyRating: 48,
    earnings: "April 29, 2026", earningsReaction: [{ q: "Q1 26", move: "-6.1%" }, { q: "Q2 26", move: "-8.9%" }, { q: "Q3 26 pending", move: null }],
    lastRevision: { date: "Apr 15", action: "Lowered target $455→$425", firm: "JPMorgan" },
    politicalSig: 5, govContract: 5, insider: 2,
    smartMoney13F: { funds: 14, trend: "Accumulation — 9 adding, 2 trimming", highlight: "Berkshire initiated new position Q1" },
    catalysts: "Azure AI monetization, Copilot attach, DoD JWCC deal, pending Q3 earnings Apr 29", 
    risks: "AI capex ROI skepticism, OpenAI dynamics, margin compression from capex",
    moat: "Very wide — cloud + productivity suite + enterprise lock-in",
    structuralThesis: "Microsoft sells cloud infrastructure (Azure), productivity software (Office/Teams/Copilot), operating systems (Windows), and enterprise tools. ~55% of revenue is high-margin recurring subscription. 30%+ op margins with near-monopoly in enterprise productivity. Azure is #2 cloud growing 25-30% YoY. Fortress balance sheet. Exceptional capital allocation track record.",
    structuralInvalidation: "Azure growth drops below 20% for 2 quarters, OR operating margin drops below 35%, OR loses >5% enterprise productivity share to Google Workspace",
    tacticalThesis: "Market is punishing MSFT for $80B+ annual AI capex with uncertain ROI. Down 23% YTD = market pricing in serious AI capex hangover. PE 23 below 5Y avg of 32. Below SMA 200 first time in 2 years. April 29 earnings is the catalyst — if Azure re-accelerates, this reverses violently.",
    tacticalInvalidation: "Azure decelerates below 20% on April 29, OR price breaks below $265 (52-week low), OR management guides down on FY27 capex without clear AI revenue offset",
    tacticalCompletion: "Azure growth ≥25% on April 29 AND Copilot/M365 AI revenue shows up in guidance, price reclaims $360 (SMA 200)",
    lastCall: {
      date: "Jan 30, 2026 (Q2 FY26)",
      bullSignals: [
        "Azure grew 28% YoY, above 25% guide",
        "Copilot ARR crossed $10B",
        "Enterprise renewal rates 'at record levels'",
        "Cost discipline held operating margin despite capex",
      ],
      redFlags: [
        "FY26 capex guide unchanged at $80B — no easing",
        "ROI timeline on AI capex still vague",
        "Some enterprise AI pilots 'not yet scaling at pace expected'",
        "Gaming segment weak",
      ],
      tone: "Confident on demand, slightly defensive on AI ROI timing",
      verdict: "QUALIFIES — structural thesis confirmed. Tactical thesis pending April 29, 2026 Q3 earnings.",
    },
    score: 86, verdict: "DEEP VALUE — HIGH CONVICTION", allocation: "Core +",
    p1_priceTarget: { pass: true, val: "+44%", note: "Analyst target $425 vs $295" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "14% rev growth — ideal mature phase per course" },
    p3_sma200: { pass: true, val: "-22.4%", note: "Deep below SMA 200 — excellent entry zone" },
    p4_confCall: { pass: true, val: "Qualified", note: "Q2 FY26 call confirmed structural thesis" },
    p5_peRatio: { pass: true, val: "23 (medium)", note: "Industry leader in 20-39 band — sweet spot" },
    p6_supportResist: { pass: true, val: "R:R 1:4.3", note: "Entry $295, stop $265, target $425 = 1:4.3" },
    p7_williams: { pass: true, val: "-78", note: "Deep oversold — portfolio entry per course (-90 range)" },
    principlesPassed: 7,
  },
  {
    t: "META", name: "Meta Platforms", sector: "Social / AI", industry: "Advertising / AI",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Growth-Leader",
    price: 538, sma50: 585, sma200: 618, ema50: 578, ytd: -12.9, high52: 728, low52: 512,
    mcap: 1370, shares: 2.55,
    fwdPE: 19, peHist5y: 24, peHist6m: 22, peg: 0.7,
    roic: 27.8, roe: 32, roa: 18, margin: 35, grossMargin: 81, netMargin: 30,
    revGrowth: 22, revGrowth3y: 18, revGrowth1y: 22, epsGrowth: 26, epsGrowthFwd: 22,
    debtEbitda: 0.2, netDebtEbitda: -0.5, intCoverage: 85, currentRatio: 2.7, quickRatio: 2.7,
    altmanZ: 15, piotroskiF: 7,
    fcfYield: 4.1, psRatio: 8, pbRatio: 6.2, evEbitda: 12, evFcf: 17, fcfMargin: 31,
    totalCash: 75, opEx: 110, cashRunway: 8.2, debtToCapital: 18, industryDebtAvg: 28,
    buybackYield: 2.3, divYield: 0.4, shareholderYield: 2.7, shareCount5y: "-5%",
    insiderOwn: 13.2, insiderTrend: "Zuckerberg stable",
    instOwn: 78, shortInterest: 1.1, putCallRatio: 0.7,
    rsi: 38, williams: -71, williamsRising: false, vol30d: "Elevated", beta: 1.2,
    atr: 16, bollPosition: "Lower band",
    macd: { line: -14, signal: -9, hist: -5, cross: "Bearish" },
    stoch: 28,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Near Death Cross",
    fibHigh: 728, fibLow: 512, fibGoldenLow: 558, fibGoldenHigh: 625,
    vwap: { daily: 542, weekly: 558, monthly: 595, anchoredEarnings: 612 },
    obvTrend: "Flat — consolidation",
    cmf: -0.05,
    rsVsSpy: -15, rsVsSector: -8,
    analystTarget: 680, upside: 26, analystCount: 48, buyRating: 42,
    earnings: "April 29, 2026", earningsReaction: [{ q: "Q4 25", move: "+4.1%" }, { q: "Q1 26", move: "-12.3%" }, { q: "Q2 26", move: "-3.2%" }],
    lastRevision: { date: "Apr 10", action: "Maintained target $680", firm: "Goldman Sachs" },
    politicalSig: 3, govContract: 2, insider: 2,
    smartMoney13F: { funds: 11, trend: "Slight accumulation — 6 adding, 3 trimming", highlight: "Lone Pine added 8%" },
    catalysts: "AI ad optimization, Reels monetization, Reality Labs narrowing losses, Llama licensing revenue", 
    risks: "Regulatory (FTC, EU), AI capex ROI, youth user trends to TikTok",
    moat: "Wide — 4B users, data moat, ad targeting superiority",
    structuralThesis: "Meta owns the largest advertising platform outside Google — 4B users across Facebook, Instagram, WhatsApp, Threads. AI-enhanced ad products driving measurable conversion uplift. 35%+ operating margins. Zuckerberg has 13% ownership = exceptional long-term alignment.",
    structuralInvalidation: "Ad revenue growth drops below 10% for 2 quarters, OR ROIC drops below 20%, OR regulatory forced breakup of Instagram/WhatsApp",
    tacticalThesis: "22% revenue growth at PE 19 — highest ROIC in Mag7 ex-NVDA with cheapest forward multiple. Below SMA 200 with Apr 29 earnings imminent. Clean entry.",
    tacticalInvalidation: "Reality Labs losses widen vs. narrowing trajectory, OR Q1 ad revenue guidance disappoints",
    tacticalCompletion: "Apr 29 earnings show Reality Labs losses narrowing + ad rev ≥20%, price reclaims $618",
    lastCall: {
      date: "Jan 29, 2026 (Q4 25)",
      bullSignals: [
        "Ad revenue grew 22% YoY, Reels monetizing at 85% of feed rates",
        "AI-driven conversions up 40% on advertiser ROI metrics",
        "Reality Labs operating loss narrowed to $4.2B from $4.6B",
      ],
      redFlags: [
        "2026 capex guide $70-80B — high end raised",
        "Regulatory noise in EU (DMA compliance costs)",
      ],
      tone: "Confident, Zuck emphasizing long-term AI bet",
      verdict: "QUALIFIES — strong fundamentals, valuation attractive",
    },
    score: 84, verdict: "BUY ZONE", allocation: "Core",
    p1_priceTarget: { pass: true, val: "+26%", note: "Target $680 vs $538" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "22% rev growth, sector leader" },
    p3_sma200: { pass: true, val: "-12.9%", note: "Below SMA 200 — entry zone" },
    p4_confCall: { pass: true, val: "Qualified", note: "Q4 25 confirmed trajectory" },
    p5_peRatio: { pass: true, val: "19 (conservative-medium)", note: "Attractive for 22% growth business" },
    p6_supportResist: { pass: true, val: "R:R 1:3.5", note: "Strong R:R at current levels" },
    p7_williams: { pass: true, val: "-71", note: "Approaching oversold, near portfolio entry zone" },
    principlesPassed: 7,
  },
  {
    t: "AMZN", name: "Amazon", sector: "Commerce / Cloud", industry: "E-commerce / AWS",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Mature",
    price: 198, sma50: 215, sma200: 225, ema50: 212, ytd: -7.5, high52: 258, low52: 185,
    mcap: 2080, shares: 10.5,
    fwdPE: 27, peHist5y: 48, peHist6m: 32, peg: 0.7,
    roic: 14, roe: 22, roa: 8, margin: 11, grossMargin: 47, netMargin: 9,
    revGrowth: 11, revGrowth3y: 12, revGrowth1y: 11, epsGrowth: 38, epsGrowthFwd: 32,
    debtEbitda: 0.6, netDebtEbitda: 0.2, intCoverage: 22, currentRatio: 1.1, quickRatio: 0.9,
    altmanZ: 4.5, piotroskiF: 7,
    fcfYield: 2.6, psRatio: 3.1, pbRatio: 6.5, evEbitda: 16, evFcf: 38, fcfMargin: 8,
    totalCash: 86, opEx: 520, cashRunway: 2.0, debtToCapital: 28, industryDebtAvg: 35,
    buybackYield: 0, divYield: 0, shareholderYield: 0, shareCount5y: "+0.5%",
    insiderOwn: 8.4, insiderTrend: "Bezos trust selling (planned)",
    instOwn: 62, shortInterest: 0.9, putCallRatio: 0.7,
    rsi: 42, williams: -58, williamsRising: true, vol30d: "Normal", beta: 1.3,
    atr: 6.2, bollPosition: "Middle-lower",
    macd: { line: -8, signal: -5, hist: -3, cross: "Bearish" },
    stoch: 38,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 258, fibLow: 185, fibGoldenLow: 200, fibGoldenHigh: 222,
    vwap: { daily: 201, weekly: 208, monthly: 218, anchoredEarnings: 235 },
    obvTrend: "Flat",
    cmf: 0.02,
    rsVsSpy: -9, rsVsSector: -4,
    analystTarget: 265, upside: 34, analystCount: 58, buyRating: 52,
    earnings: "April 30, 2026", earningsReaction: [{ q: "Q4 25", move: "+6.8%" }, { q: "Q1 26", move: "-2.1%" }, { q: "Q2 26", move: "+3.5%" }],
    lastRevision: { date: "Apr 8", action: "Raised target $255→$265", firm: "Morgan Stanley" },
    politicalSig: 4, govContract: 5, insider: 2,
    smartMoney13F: { funds: 13, trend: "Accumulation — 8 adding", highlight: "D1 Capital added 22%" },
    catalysts: "AWS acceleration, advertising growth 24%+, retail margin expansion, Kuiper ramp, Zoox robotaxi", 
    risks: "Consumer spending, AWS competition, antitrust (Khan legacy)",
    moat: "Very wide — logistics, AWS scale, advertising flywheel",
    structuralThesis: "Amazon runs the #1 cloud (AWS), #1 US e-commerce, #3 US advertising (growing 24%+). AWS is ~70% of operating income — the real business underneath. Retail is turning profitable with margin expansion story. 38% EPS growth on 11% revenue growth = operating leverage story.",
    structuralInvalidation: "AWS growth drops below 15% for 2 quarters, OR North America retail returns to operating loss, OR advertising growth below 15%",
    tacticalThesis: "Trading at PE 27 vs 5Y avg 48 = significant discount. Retail profitability inflection continues. Below SMA 200. Apr 30 earnings catalyst.",
    tacticalInvalidation: "AWS below 17% on Apr 30, OR retail margins compress back toward zero",
    tacticalCompletion: "AWS ≥20%, retail op margin expansion continues, price reclaims $225",
    lastCall: {
      date: "Jan 31, 2026 (Q4 25)",
      bullSignals: [
        "AWS grew 19% YoY, reaccelerating from 16% trough",
        "Advertising revenue +24% YoY — third leg of AWS-scale profitability",
        "North America retail op margin at 6.8% (vs 0% 2 years ago)",
      ],
      redFlags: [
        "International retail still low margin",
        "Capex guide raised for AWS AI infrastructure — $100B+ 2026",
        "Consumer discretionary commentary cautious",
      ],
      tone: "Positive on AWS inflection, cautious on consumer",
      verdict: "QUALIFIES — operating leverage story intact",
    },
    score: 80, verdict: "BUY ZONE", allocation: "Core",
    p1_priceTarget: { pass: true, val: "+34%", note: "Target $265 vs $198" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "11% rev growth, operating leverage on EPS 38%" },
    p3_sma200: { pass: true, val: "-12%", note: "Below SMA 200 — entry zone" },
    p4_confCall: { pass: true, val: "Qualified", note: "AWS reacceleration confirmed" },
    p5_peRatio: { pass: true, val: "27 (medium)", note: "In 20-39 leader sweet spot, below 5Y avg" },
    p6_supportResist: { pass: true, val: "R:R 1:3.7", note: "Strong risk/reward setup" },
    p7_williams: { pass: true, val: "-58 rising", note: "Rising from oversold toward -40 momentum zone" },
    principlesPassed: 7,
  },
  {
    t: "GOOGL", name: "Alphabet", sector: "Search / AI / Cloud", industry: "Search / YouTube / GCP",
    tier: "T1", cat: "WATCHLIST", lifecycle: "Mature",
    price: 171, sma50: 178, sma200: 175, ema50: 177, ytd: -2.5, high52: 208, low52: 158,
    mcap: 2090, shares: 12.2,
    fwdPE: 18, peHist5y: 24, peHist6m: 21, peg: 0.9,
    roic: 27, roe: 30, roa: 20, margin: 30, grossMargin: 58, netMargin: 26,
    revGrowth: 14, revGrowth3y: 13, revGrowth1y: 14, epsGrowth: 20, epsGrowthFwd: 16,
    debtEbitda: 0.1, netDebtEbitda: -0.6, intCoverage: 180, currentRatio: 2.2, quickRatio: 2.2,
    altmanZ: 18, piotroskiF: 8,
    fcfYield: 4.4, psRatio: 6.2, pbRatio: 6.8, evEbitda: 13, evFcf: 19, fcfMargin: 25,
    totalCash: 110, opEx: 220, cashRunway: 6, debtToCapital: 10, industryDebtAvg: 28,
    buybackYield: 3.2, divYield: 0.4, shareholderYield: 3.6, shareCount5y: "-7%",
    insiderOwn: 0.7, insiderTrend: "Neutral",
    instOwn: 68, shortInterest: 0.8, putCallRatio: 0.7,
    rsi: 47, williams: -49, williamsRising: true, vol30d: "Normal", beta: 1.1,
    atr: 4.2, bollPosition: "Middle",
    macd: { line: -1.5, signal: -1.2, hist: -0.3, cross: "Bearish weak" },
    stoch: 44,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Tight — watching for cross",
    fibHigh: 208, fibLow: 158, fibGoldenLow: 177, fibGoldenHigh: 193,
    vwap: { daily: 173, weekly: 176, monthly: 182, anchoredEarnings: 195 },
    obvTrend: "Flat",
    cmf: 0.01,
    rsVsSpy: -4, rsVsSector: +2,
    analystTarget: 215, upside: 26, analystCount: 54, buyRating: 44,
    earnings: "April 22, 2026", earningsReaction: [{ q: "Q4 25", move: "+8.2%" }, { q: "Q1 26", move: "-3.1%" }, { q: "Q2 26", move: "+4.5%" }],
    lastRevision: { date: "Apr 14", action: "Raised target $205→$215", firm: "Bernstein" },
    politicalSig: 3, govContract: 4, insider: 3,
    smartMoney13F: { funds: 10, trend: "Accumulation — 7 adding", highlight: "Tiger Global +12%" },
    catalysts: "Gemini 3 rollout, Cloud growth reacceleration, Waymo scaling, earnings Apr 22 (THIS WEEK)", 
    risks: "Search disruption from AI, DOJ antitrust remedy, ad market weakness",
    moat: "Wide — search, YouTube, Android, data scale",
    structuralThesis: "Alphabet owns Search (~90% global share), YouTube (#1 video), Android (#1 mobile OS), and #3 cloud (GCP growing 35%+). Cheapest Mag7 on forward PE. AI-native infrastructure via TPUs. Waymo scaling to Level 4 commercial.",
    structuralInvalidation: "Search market share drops below 80%, OR Google Cloud growth below 25%, OR DOJ forces breakup of Search+Chrome+Android",
    tacticalThesis: "Cheapest Mag7. Cloud growth reaccelerating. Earnings this week (Apr 22) is binary event — if Cloud shows 35%+ and Gemini monetization mentioned, reverses. Near SMA 200 with momentum.",
    tacticalInvalidation: "Cloud below 30% on Apr 22, OR advertising growth below 10%",
    tacticalCompletion: "Apr 22 earnings: Cloud ≥32%, Gemini 3 traction, price breaks above $185",
    lastCall: {
      date: "Feb 4, 2026 (Q4 25)",
      bullSignals: [
        "Cloud grew 35% YoY, accelerating from 32%",
        "YouTube advertising +15% YoY",
        "Operating margin expanded to 32% despite AI investment",
      ],
      redFlags: [
        "Search query volume flattish — AI substitution concern",
        "Capex $95B for 2026 (up from $55B in 2024)",
      ],
      tone: "Confident, Pichai emphasizing AI full-stack",
      verdict: "QUALIFIES — cheap quality at inflection",
    },
    score: 82, verdict: "BUY — near-term catalyst (Apr 22)", allocation: "Core entry",
    p1_priceTarget: { pass: true, val: "+26%", note: "Target $215" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "14% rev, mature leader" },
    p3_sma200: { pass: true, val: "-2.5%", note: "Just below SMA 200 — entry zone" },
    p4_confCall: { pass: true, val: "Qualified", note: "Q4 25 confirmed Cloud acceleration" },
    p5_peRatio: { pass: true, val: "18 (conservative)", note: "Cheapest Mag7 on forward PE" },
    p6_supportResist: { pass: true, val: "R:R 1:3.3", note: "Support $158, target $215" },
    p7_williams: { pass: true, val: "-49 rising", note: "Rising toward -40 momentum zone" },
    principlesPassed: 7,
  },
  {
    t: "AAPL", name: "Apple", sector: "Hardware / Services", industry: "Consumer Tech",
    tier: "T1", cat: "WATCHLIST", lifecycle: "Mature",
    price: 224, sma50: 236, sma200: 238, ema50: 234, ytd: -6.9, high52: 268, low52: 208,
    mcap: 3380, shares: 15.1,
    fwdPE: 29, peHist5y: 28, peHist6m: 30, peg: 3.6,
    roic: 55, roe: 160, roa: 28, margin: 26, grossMargin: 45, netMargin: 24,
    revGrowth: 4, revGrowth3y: 3, revGrowth1y: 4, epsGrowth: 8, epsGrowthFwd: 8,
    debtEbitda: 1.4, netDebtEbitda: 0.8, intCoverage: 30, currentRatio: 1.0, quickRatio: 0.9,
    altmanZ: 6, piotroskiF: 7,
    fcfYield: 3.4, psRatio: 8.3, pbRatio: 45, evEbitda: 23, evFcf: 29, fcfMargin: 25,
    totalCash: 62, opEx: 280, cashRunway: 2.7, debtToCapital: 55, industryDebtAvg: 35,
    buybackYield: 3.0, divYield: 0.5, shareholderYield: 3.5, shareCount5y: "-11%",
    insiderOwn: 0.07, insiderTrend: "Neutral",
    instOwn: 62, shortInterest: 0.6, putCallRatio: 0.8,
    rsi: 44, williams: -56, williamsRising: false, vol30d: "Normal", beta: 1.2,
    atr: 4.8, bollPosition: "Middle-lower",
    macd: { line: -3, signal: -2, hist: -1, cross: "Bearish" },
    stoch: 38,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 268, fibLow: 208, fibGoldenLow: 223, fibGoldenHigh: 245,
    vwap: { daily: 226, weekly: 231, monthly: 241, anchoredEarnings: 255 },
    obvTrend: "Flat/slight down",
    cmf: -0.02,
    rsVsSpy: -9, rsVsSector: -3,
    analystTarget: 245, upside: 9, analystCount: 54, buyRating: 32,
    earnings: "May 1, 2026", earningsReaction: [{ q: "Q1 26", move: "+2.1%" }, { q: "Q2 26", move: "-1.5%" }],
    lastRevision: { date: "Apr 11", action: "Maintained target $245", firm: "Morgan Stanley" },
    politicalSig: 2, govContract: 2, insider: 1,
    smartMoney13F: { funds: 16, trend: "Trimming — 4 trimming, 2 adding", highlight: "Buffett reduced 10%" },
    catalysts: "iPhone 17 cycle, Services growth, Apple Intelligence expansion, China recovery", 
    risks: "China exposure (tariff risk), AI lag vs peers, slow innovation cadence",
    moat: "Very wide — ecosystem, brand, Services 20%+ margin",
    structuralThesis: "Apple generates ~$100B/yr in operating cash flow with untouchable brand loyalty. Services revenue (App Store, subscriptions) is $100B+ at 70% gross margin. Ecosystem lock-in compounds over time.",
    structuralInvalidation: "Services growth below 10%, OR iPhone ASP declines for 3 quarters, OR ecosystem lock-in breaks (Apple ID substitution)",
    tacticalThesis: "Quality name but limited upside at current valuation. PE 29 slightly above 5Y avg. Low 4% revenue growth is the problem. Better to own MSFT/META/GOOGL at this juncture.",
    tacticalInvalidation: "N/A — not a tactical entry",
    tacticalCompletion: "N/A",
    lastCall: {
      date: "Jan 30, 2026 (Q1 26)",
      bullSignals: [
        "Services revenue +14% YoY, $27B",
        "Installed base at 2.4B devices — all-time high",
        "iPhone ASP stable despite China softness",
      ],
      redFlags: [
        "China revenue -11% YoY",
        "Apple Intelligence rollout behind schedule",
        "No compelling AI narrative",
      ],
      tone: "Defensive, playing for time",
      verdict: "QUALIFIES but limited upside — hold existing, avoid new money",
    },
    score: 62, verdict: "HOLD / AVOID NEW $", allocation: "—",
    cat: "SCREENED",
    p1_priceTarget: { pass: false, val: "+9%", note: "Only 9% analyst upside — below 20% threshold" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "4% growth, mature but not growing" },
    p3_sma200: { pass: true, val: "-5.9%", note: "Just below SMA 200" },
    p4_confCall: { pass: false, val: "Limited upside", note: "Qualifies operationally but no catalyst for outsized return" },
    p5_peRatio: { pass: false, val: "29 (medium-high)", note: "Above 5Y avg, PEG 3.6 is expensive" },
    p6_supportResist: { pass: false, val: "R:R 1:1.3", note: "Weak R:R given limited upside" },
    p7_williams: { pass: true, val: "-56", note: "Mid-range, not oversold" },
    principlesPassed: 3,
  },

  // ==================== SEMIS ====================
  {
    t: "AVGO", name: "Broadcom", sector: "Semis / Software", industry: "Custom silicon / VMware",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Growth-Leader",
    price: 192, sma50: 220, sma200: 210, ema50: 218, ytd: -11, high52: 263, low52: 168,
    mcap: 900, shares: 4.7,
    fwdPE: 24, peHist5y: 52, peHist6m: 32, peg: 0.6,
    roic: 21.3, roe: 18, roa: 12, margin: 42, grossMargin: 64, netMargin: 28,
    revGrowth: 42, revGrowth3y: 32, revGrowth1y: 42, epsGrowth: 48, epsGrowthFwd: 38,
    debtEbitda: 2.1, netDebtEbitda: 1.8, intCoverage: 9, currentRatio: 2.5, quickRatio: 2.2,
    altmanZ: 4, piotroskiF: 7,
    fcfYield: 3.9, psRatio: 16, pbRatio: 12, evEbitda: 20, evFcf: 26, fcfMargin: 48,
    totalCash: 10, opEx: 18, cashRunway: 6.7, debtToCapital: 62, industryDebtAvg: 35,
    buybackYield: 1.2, divYield: 1.2, shareholderYield: 2.4, shareCount5y: "-4%",
    insiderOwn: 0.3, insiderTrend: "Neutral",
    instOwn: 78, shortInterest: 1.2, putCallRatio: 0.6,
    rsi: 35, williams: -74, williamsRising: false, vol30d: "Elevated", beta: 1.3,
    atr: 8, bollPosition: "Below lower band",
    macd: { line: -12, signal: -8, hist: -4, cross: "Bearish" },
    stoch: 22,
    goldenCross: false, deathCross: true, goldenDeathStatus: "Death Cross (recent)",
    fibHigh: 263, fibLow: 168, fibGoldenLow: 190, fibGoldenHigh: 223,
    vwap: { daily: 198, weekly: 210, monthly: 230, anchoredEarnings: 245 },
    obvTrend: "Down — distribution",
    cmf: -0.18,
    rsVsSpy: -13, rsVsSector: -7,
    analystTarget: 310, upside: 61, analystCount: 38, buyRating: 35,
    earnings: "June 5, 2026", earningsReaction: [{ q: "Q4 25", move: "+22%" }, { q: "Q1 26", move: "-8.4%" }],
    lastRevision: { date: "Apr 9", action: "Maintained target $310", firm: "Goldman" },
    politicalSig: 4, govContract: 4, insider: 2,
    smartMoney13F: { funds: 11, trend: "Strong accumulation — 9 adding", highlight: "Baillie Gifford top 10 holding" },
    catalysts: "Custom AI silicon wins (GOOGL, META, AAPL TPU), VMware synergies, networking", 
    risks: "Customer concentration in hyperscalers, cyclical semiconductor exposure",
    moat: "Wide — custom silicon design + networking dominance + VMware lock-in",
    structuralThesis: "Broadcom designs custom AI chips for hyperscalers (Google TPU, Meta MTIA, Apple custom silicon) and dominates networking. VMware acquisition provides recurring subscription software moat. 42% revenue growth at 48% FCF margin = best-in-class compounder in custom silicon.",
    structuralInvalidation: "AI chip customer diversity drops (single customer >50%), OR VMware revenue flattens, OR custom silicon competitors (Marvell, etc.) take meaningful share",
    tacticalThesis: "PE 24 vs 5Y avg 52 = 54% discount to historical. Below SMA 200 with Death Cross recent. 61% analyst upside. Best risk/reward in AI semis complex at current valuation.",
    tacticalInvalidation: "Price breaks below $168 (52w low), OR next earnings miss on AI silicon revenue",
    tacticalCompletion: "Q2 FY26 earnings (June 5) confirm AI silicon $15B+ run-rate, price reclaims $210",
    lastCall: {
      date: "Mar 6, 2026 (Q1 FY26)",
      bullSignals: [
        "AI silicon revenue $4.1B, tracking to $18-20B FY26",
        "VMware margins at 72% (ahead of target)",
        "Networking + broadband both strong",
      ],
      redFlags: [
        "Non-AI semis weak (as guided)",
        "VMware revenue sequential flat",
      ],
      tone: "Very confident, Hock Tan methodical as ever",
      verdict: "QUALIFIES — exceptional AI story at dislocated valuation",
    },
    score: 88, verdict: "STRONG BUY — HIGH CONVICTION", allocation: "Large",
    p1_priceTarget: { pass: true, val: "+61%", note: "Highest upside in universe" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "42% growth, custom silicon leader" },
    p3_sma200: { pass: true, val: "-8.6%", note: "Below SMA 200, Death Cross — classic entry" },
    p4_confCall: { pass: true, val: "Exceptional", note: "AI silicon momentum confirmed Q1 FY26" },
    p5_peRatio: { pass: true, val: "24 (medium)", note: "Leader in 20-39 sweet spot, deep discount to 5Y" },
    p6_supportResist: { pass: true, val: "R:R 1:4.9", note: "Best R:R setup in universe" },
    p7_williams: { pass: true, val: "-74 approaching -80", note: "Near oversold, watching for cross above -40" },
    principlesPassed: 7,
  },
  {
    t: "TSM", name: "Taiwan Semi", sector: "Semis Foundry", industry: "Contract manufacturing",
    tier: "T1", cat: "WATCHLIST", lifecycle: "Growth-Leader",
    price: 178, sma50: 198, sma200: 195, ema50: 196, ytd: -5, high52: 248, low52: 165,
    mcap: 920, shares: 5.2,
    fwdPE: 18, peHist5y: 22, peHist6m: 20, peg: 0.5,
    roic: 30, roe: 28, roa: 18, margin: 41, grossMargin: 54, netMargin: 38,
    revGrowth: 35, revGrowth3y: 28, revGrowth1y: 35, epsGrowth: 38, epsGrowthFwd: 30,
    debtEbitda: 0.2, netDebtEbitda: -0.6, intCoverage: 95, currentRatio: 2.5, quickRatio: 2.2,
    altmanZ: 8, piotroskiF: 8,
    fcfYield: 4.8, psRatio: 10, pbRatio: 5.2, evEbitda: 10, evFcf: 16, fcfMargin: 38,
    totalCash: 82, opEx: 65, cashRunway: 15.1, debtToCapital: 15, industryDebtAvg: 35,
    buybackYield: 0.5, divYield: 1.5, shareholderYield: 2.0, shareCount5y: "0%",
    insiderOwn: 0.3, insiderTrend: "Neutral",
    instOwn: 21, shortInterest: 0.8, putCallRatio: 0.5,
    rsi: 40, williams: -64, williamsRising: true, vol30d: "Elevated", beta: 1.2,
    atr: 5.8, bollPosition: "Lower",
    macd: { line: -7, signal: -5, hist: -2, cross: "Bearish weakening" },
    stoch: 30,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 248, fibLow: 165, fibGoldenLow: 182, fibGoldenHigh: 211,
    vwap: { daily: 182, weekly: 192, monthly: 208, anchoredEarnings: 225 },
    obvTrend: "Flat",
    cmf: -0.03,
    rsVsSpy: -7, rsVsSector: -2,
    analystTarget: 240, upside: 35, analystCount: 42, buyRating: 38,
    earnings: "July 17, 2026", earningsReaction: [{ q: "Q4 25", move: "+4%" }, { q: "Q1 26", move: "-3%" }],
    lastRevision: { date: "Apr 17", action: "Q1 earnings beat, raised FY guide", firm: "TSMC" },
    politicalSig: 3, govContract: 3, insider: 2,
    smartMoney13F: { funds: 9, trend: "Accumulation — 6 adding", highlight: "Appaloosa added" },
    catalysts: "N2/A16 node ramp, AI chip demand, Arizona fab ramping, all major chip designers are customers", 
    risks: "Geopolitical Taiwan/China, cyclicality, capex intensity",
    moat: "Very wide — only leading-edge foundry at scale, 3nm+ effective monopoly",
    structuralThesis: "Every AI chip on earth goes through TSMC. N3/N2/A16 technology leadership is 2-3 years ahead of Samsung/Intel Foundry. $100B+ US/Japan/Germany fab expansion de-risks Taiwan concentration. 30%+ ROIC in capital-intensive business is unprecedented.",
    structuralInvalidation: "Samsung/Intel Foundry catches up on leading edge, OR major geopolitical event disrupts Taiwan, OR major customer (AAPL, NVDA) dual-sources",
    tacticalThesis: "PE 18 with 35%+ revenue growth. Below SMA 200. Geopolitical discount creates the opportunity. Q1 earnings just beat — momentum re-emerging.",
    tacticalInvalidation: "Below $165 (52w low), OR China/Taiwan escalation materially impacts operations",
    tacticalCompletion: "Price reclaims $195 (SMA 200), Q2 earnings July 17 confirms AI revenue trajectory",
    lastCall: {
      date: "Apr 17, 2026 (Q1 26)",
      bullSignals: [
        "Q1 revenue +35% YoY, ahead of guide",
        "AI revenue tracking to double in 2026",
        "N2 on schedule for H2 2026",
        "Raised FY guide",
      ],
      redFlags: [
        "Smartphone weak",
        "Capex $42-44B for 2026",
      ],
      tone: "Highly confident, raised guidance",
      verdict: "QUALIFIES — just confirmed acceleration",
    },
    score: 83, verdict: "BUY ZONE", allocation: "Medium",
    p1_priceTarget: { pass: true, val: "+35%", note: "Target $240" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "35% growth, monopoly on leading edge" },
    p3_sma200: { pass: true, val: "-8.7%", note: "Below SMA 200 — entry zone" },
    p4_confCall: { pass: true, val: "Just beat", note: "Apr 17 Q1 crushed — trajectory confirmed" },
    p5_peRatio: { pass: true, val: "18 (conservative)", note: "Cheap for 35% growth" },
    p6_supportResist: { pass: true, val: "R:R 1:4.8", note: "Strong R:R with $165 support" },
    p7_williams: { pass: true, val: "-64 rising", note: "Rising toward -40 momentum zone" },
    principlesPassed: 7,
  },
  {
    t: "MU", name: "Micron", sector: "Semis — Memory", industry: "DRAM / HBM / NAND",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Cyclical",
    price: 318, sma50: 342, sma200: 248, ema50: 338, ytd: -5, high52: 382, low52: 98,
    mcap: 355, shares: 1.12,
    fwdPE: 5, peHist5y: 18, peHist6m: 8, peg: 0.1,
    roic: 37.4, roe: 42, roa: 22, margin: 44, grossMargin: 58, netMargin: 35,
    revGrowth: 95, revGrowth3y: 25, revGrowth1y: 95, epsGrowth: 180, epsGrowthFwd: 45,
    debtEbitda: 0.8, netDebtEbitda: 0.4, intCoverage: 28, currentRatio: 3.1, quickRatio: 2.4,
    altmanZ: 5, piotroskiF: 8,
    fcfYield: 5.8, psRatio: 3.8, pbRatio: 4.5, evEbitda: 5, evFcf: 17, fcfMargin: 22,
    totalCash: 15, opEx: 32, cashRunway: 5.6, debtToCapital: 32, industryDebtAvg: 35,
    buybackYield: 0, divYield: 0.1, shareholderYield: 0.1, shareCount5y: "+2%",
    insiderOwn: 0.2, insiderTrend: "Selling",
    instOwn: 82, shortInterest: 2.8, putCallRatio: 1.1,
    rsi: 48, williams: -42, williamsRising: false, vol30d: "Very High", beta: 1.6,
    atr: 12, bollPosition: "Middle",
    macd: { line: 2, signal: 3, hist: -1, cross: "Bearish weak" },
    stoch: 48,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross (bullish, extended)",
    fibHigh: 382, fibLow: 98, fibGoldenLow: 207, fibGoldenHigh: 274,
    vwap: { daily: 322, weekly: 342, monthly: 352, anchoredEarnings: 298 },
    obvTrend: "Up — accumulation",
    cmf: 0.12,
    rsVsSpy: +20, rsVsSector: +15,
    analystTarget: 420, upside: 32, analystCount: 35, buyRating: 30,
    earnings: "June 25, 2026", earningsReaction: [{ q: "Q1 26", move: "+18%" }, { q: "Q2 26", move: "+28%" }],
    lastRevision: { date: "Apr 3", action: "Raised target $380→$420", firm: "Citi" },
    politicalSig: 4, govContract: 3, insider: 2,
    smartMoney13F: { funds: 8, trend: "Mixed — late cycle trimming starting", highlight: "Appaloosa trimmed 15%" },
    catalysts: "HBM3e/HBM4 for AI, record Q2 2026 ($23.86B rev), cyclical upturn, CHIPS Act", 
    risks: "Memory cyclicality (peak approaching?), China Huawei exposure, HBM competition from SK Hynix/Samsung",
    moat: "Moderate — 3-player oligopoly (Samsung, SK Hynix, Micron) with HBM leadership",
    structuralThesis: "Memory is consolidated to 3 players — Samsung, SK Hynix, Micron. HBM (High Bandwidth Memory) is the picks-and-shovels of AI inference. Unprecedented cycle peak with $318 price reflecting the up-cycle.",
    structuralInvalidation: "HBM competition commoditizes margins, OR memory cycle enters 2-year downturn, OR China share loss",
    tacticalThesis: "Forward PE 5 looks cheap but historical memory peaks have had PE 3-5 too (earnings collapse is the risk). Above SMA 200 by 28%. Not a fresh entry — wait for pullback to $207-274 Fib golden zone.",
    tacticalInvalidation: "Price breaks $280 support",
    tacticalCompletion: "Either: pullback to $220-270 for entry, OR wait for full cycle to reset",
    lastCall: {
      date: "Mar 20, 2026 (Q2 26)",
      bullSignals: [
        "Record revenue $23.86B",
        "HBM sold out through 2027",
        "Margins at 20-year high",
      ],
      redFlags: [
        "Guidance conservative — hinting at cycle peak",
        "Insider selling accelerating",
        "13F smart money beginning to trim",
      ],
      tone: "Confident but 'normalization' language creeping in",
      verdict: "WAIT — structural thesis intact, but entry timing risk",
    },
    score: 58, verdict: "WAIT — ABOVE SMA 200", allocation: "—",
    p1_priceTarget: { pass: true, val: "+32%", note: "Target $420" },
    p2_salesGrowth: { pass: true, val: "Growth-Cyclical", note: "95% rev growth but cycle-aware" },
    p3_sma200: { pass: false, val: "+28.2%", note: "FAIL — 28% above SMA 200, not entry zone per course" },
    p4_confCall: { pass: false, val: "Cycle risk", note: "Normalization language — late cycle signal" },
    p5_peRatio: { pass: true, val: "5 (very low)", note: "But historical peaks have low PE — risk" },
    p6_supportResist: { pass: false, val: "R:R 1:1.6", note: "Weak R:R at extended price" },
    p7_williams: { pass: false, val: "-42", note: "Mid-range, no oversold signal" },
    principlesPassed: 3,
  },
  {
    t: "AMD", name: "Advanced Micro", sector: "Semis — AI", industry: "CPU / GPU",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Follower",
    price: 128, sma50: 142, sma200: 148, ema50: 140, ytd: -11, high52: 187, low52: 118,
    mcap: 205, shares: 1.6,
    fwdPE: 22, peHist5y: 38, peHist6m: 28, peg: 0.5,
    roic: 12, roe: 9, roa: 6, margin: 24, grossMargin: 51, netMargin: 11,
    revGrowth: 28, revGrowth3y: 18, revGrowth1y: 28, epsGrowth: 44, epsGrowthFwd: 38,
    debtEbitda: 0.4, netDebtEbitda: 0.1, intCoverage: 28, currentRatio: 2.6, quickRatio: 2.2,
    altmanZ: 7, piotroskiF: 7,
    fcfYield: 2.4, psRatio: 7, pbRatio: 3.2, evEbitda: 26, evFcf: 42, fcfMargin: 18,
    totalCash: 5, opEx: 22, cashRunway: 2.7, debtToCapital: 8, industryDebtAvg: 35,
    buybackYield: 1.5, divYield: 0, shareholderYield: 1.5, shareCount5y: "+1%",
    insiderOwn: 0.5, insiderTrend: "Neutral",
    instOwn: 72, shortInterest: 2.2, putCallRatio: 0.9,
    rsi: 38, williams: -68, williamsRising: true, vol30d: "Elevated", beta: 1.8,
    atr: 5, bollPosition: "Lower",
    macd: { line: -5, signal: -4, hist: -1, cross: "Bearish" },
    stoch: 28,
    goldenCross: false, deathCross: true, goldenDeathStatus: "Death Cross",
    fibHigh: 187, fibLow: 118, fibGoldenLow: 144, fibGoldenHigh: 166,
    vwap: { daily: 132, weekly: 142, monthly: 152, anchoredEarnings: 168 },
    obvTrend: "Down",
    cmf: -0.12,
    rsVsSpy: -13, rsVsSector: -6,
    analystTarget: 175, upside: 37, analystCount: 48, buyRating: 35,
    earnings: "May 6, 2026", earningsReaction: [{ q: "Q4 25", move: "-6%" }, { q: "Q1 26", move: "-12%" }],
    lastRevision: { date: "Apr 2", action: "Lowered target $180→$175", firm: "Bernstein" },
    politicalSig: 3, govContract: 3, insider: 2,
    smartMoney13F: { funds: 8, trend: "Mixed", highlight: "Two funds initiated, three trimmed" },
    catalysts: "MI325/MI350 AI accelerator ramp, EPYC server share gains, MSFT/META wins", 
    risks: "NVDA dominance in AI GPU, execution risk on MI400",
    moat: "Moderate — CPU duopoly with Intel, distant #2 in AI GPU",
    structuralThesis: "AMD is the #2 in AI accelerators behind NVIDIA, and CPU duopoly leader with Intel. Zen architecture has 2+ year lead. Share gains in server CPU (EPYC) continue. AI GPU story is real but capped at single-digit TAM share.",
    structuralInvalidation: "Intel regains CPU leadership, OR AI GPU revenue growth decelerates below 20% YoY",
    tacticalThesis: "Below SMA 200 with Death Cross. PE 22 at 5Y low. Earnings May 6 is binary catalyst.",
    tacticalInvalidation: "Break below $118, OR May 6 earnings miss on AI GPU guidance",
    tacticalCompletion: "May 6: AI GPU rev $6B+ FY26, price reclaims $148",
    lastCall: {
      date: "Feb 4, 2026 (Q4 25)",
      bullSignals: [
        "AI GPU revenue $5B FY25, guide $7B FY26",
        "Server share gains continuing",
      ],
      redFlags: [
        "Guidance below whisper",
        "Gaming/embedded weak",
        "Gross margin pressure from AI mix",
      ],
      tone: "Cautious, acknowledging AI GPU challenges",
      verdict: "WATCH — needs May 6 catalyst",
    },
    score: 72, verdict: "WATCH — earnings catalyst", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+37%", note: "Target $175" },
    p2_salesGrowth: { pass: true, val: "Growth-Follower", note: "28% growth, follower not leader" },
    p3_sma200: { pass: true, val: "-13.5%", note: "Below SMA 200" },
    p4_confCall: { pass: false, val: "Cautious tone", note: "Q4 25 call tone mixed — watch May 6" },
    p5_peRatio: { pass: true, val: "22 (medium)", note: "Below 5Y avg" },
    p6_supportResist: { pass: true, val: "R:R 1:4.7", note: "Good R:R" },
    p7_williams: { pass: true, val: "-68 rising", note: "Rising from oversold" },
    principlesPassed: 5,
  },

  // ==================== AI INFRA / POWER ====================
  {
    t: "CEG", name: "Constellation Energy", sector: "Nuclear / Utilities", industry: "Nuclear power gen",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Growth-Leader",
    price: 238, sma50: 252, sma200: 245, ema50: 250, ytd: -3, high52: 352, low52: 185,
    mcap: 76, shares: 0.32,
    fwdPE: 26, peHist5y: 18, peHist6m: 24, peg: 0.8,
    roic: 14, roe: 18, roa: 6, margin: 18, grossMargin: 32, netMargin: 14,
    revGrowth: 22, revGrowth3y: 12, revGrowth1y: 22, epsGrowth: 32, epsGrowthFwd: 28,
    debtEbitda: 2.3, netDebtEbitda: 2.1, intCoverage: 6, currentRatio: 1.4, quickRatio: 1.2,
    altmanZ: 3, piotroskiF: 7,
    fcfYield: 4.2, psRatio: 3.2, pbRatio: 4.8, evEbitda: 14, evFcf: 24, fcfMargin: 15,
    totalCash: 2.8, opEx: 20, cashRunway: 1.7, debtToCapital: 45, industryDebtAvg: 55,
    buybackYield: 1.8, divYield: 0.8, shareholderYield: 2.6, shareCount5y: "-2%",
    insiderOwn: 0.2, insiderTrend: "Buying",
    instOwn: 82, shortInterest: 1.8, putCallRatio: 0.8,
    rsi: 44, williams: -55, williamsRising: true, vol30d: "Normal", beta: 1.1,
    atr: 7, bollPosition: "Middle-lower",
    macd: { line: -4, signal: -3, hist: -1, cross: "Bearish weak" },
    stoch: 42,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Near Death Cross",
    fibHigh: 352, fibLow: 185, fibGoldenLow: 238, fibGoldenHigh: 294,
    vwap: { daily: 240, weekly: 248, monthly: 262, anchoredEarnings: 275 },
    obvTrend: "Flat — consolidation",
    cmf: 0.04,
    rsVsSpy: -5, rsVsSector: -2,
    analystTarget: 328, upside: 38, analystCount: 22, buyRating: 18,
    earnings: "May 7, 2026", earningsReaction: [{ q: "Q4 25", move: "+8%" }, { q: "Q1 26", move: "+3%" }],
    lastRevision: { date: "Apr 5", action: "Raised target $300→$328", firm: "Jefferies" },
    politicalSig: 5, govContract: 4, insider: 3,
    smartMoney13F: { funds: 9, trend: "Accumulation — 7 adding", highlight: "Pershing Square added 25%" },
    catalysts: "Data center PPA expansion, nuclear renaissance, MSFT Three Mile Island deal precedent, DOE loan guarantees", 
    risks: "Regulatory delays on new reactors, power price volatility, political shifts on nuclear",
    moat: "Wide — largest US nuclear operator, irreplaceable baseload for AI data centers",
    structuralThesis: "AI data centers need 24/7 reliable clean power. Nuclear is the only solution at scale. CEG is the largest US nuclear operator with 22GW of capacity. MSFT's Three Mile Island deal (2024) validated the data center PPA model. Long-term contracts with tech giants = utility with growth characteristics.",
    structuralInvalidation: "AI power demand slows dramatically, OR renewables+storage undercut nuclear economics, OR political backlash on nuclear resurgence",
    tacticalThesis: "Near SMA 200 with clear catalyst path. Cluster congressional buying signal. Major funds accumulating.",
    tacticalInvalidation: "Break below $185 (52w low), OR cancelation of major data center PPA",
    tacticalCompletion: "Announcement of 2+ new data center PPAs (GOOG, META, AMZN rumored), price breaks above $275",
    lastCall: {
      date: "Feb 20, 2026 (Q4 25)",
      bullSignals: [
        "MSFT deal performing as expected",
        "4 new data center PPA discussions advanced stage",
        "PJM capacity prices up 30% YoY",
      ],
      redFlags: [
        "Nuclear fuel costs rising",
        "New reactor approvals still slow",
      ],
      tone: "Very confident, management articulating 10-year AI thesis",
      verdict: "QUALIFIES — strategic asset class",
    },
    score: 80, verdict: "BUY — entry zone", allocation: "Medium",
    p1_priceTarget: { pass: true, val: "+38%", note: "Target $328" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "22% growth, AI power theme leader" },
    p3_sma200: { pass: true, val: "-2.9%", note: "Just below SMA 200 — entry zone" },
    p4_confCall: { pass: true, val: "Exceptional", note: "Management 10-year thesis compelling" },
    p5_peRatio: { pass: true, val: "26 (medium)", note: "Leader in 20-39 band" },
    p6_supportResist: { pass: true, val: "R:R 1:3.7", note: "Good R:R with $185 support" },
    p7_williams: { pass: true, val: "-55 rising", note: "Rising toward -40 momentum zone" },
    principlesPassed: 7,
  },
  {
    t: "VST", name: "Vistra Corp", sector: "Utilities / Nuclear", industry: "Power gen & retail",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Leader",
    price: 148, sma50: 165, sma200: 152, ema50: 162, ytd: -8, high52: 218, low52: 112,
    mcap: 52, shares: 0.35,
    fwdPE: 22, peHist5y: 14, peHist6m: 20, peg: 0.7,
    roic: 18, roe: 28, roa: 6, margin: 15, grossMargin: 28, netMargin: 11,
    revGrowth: 26, revGrowth3y: 18, revGrowth1y: 26, epsGrowth: 38, epsGrowthFwd: 32,
    debtEbitda: 3.1, netDebtEbitda: 2.8, intCoverage: 4.5, currentRatio: 1.2, quickRatio: 1.0,
    altmanZ: 2.5, piotroskiF: 6,
    fcfYield: 5.1, psRatio: 2.6, pbRatio: 8, evEbitda: 11, evFcf: 18, fcfMargin: 18,
    totalCash: 1.8, opEx: 14, cashRunway: 1.5, debtToCapital: 62, industryDebtAvg: 55,
    buybackYield: 2.8, divYield: 0.3, shareholderYield: 3.1, shareCount5y: "-8%",
    insiderOwn: 1.2, insiderTrend: "Neutral",
    instOwn: 78, shortInterest: 2.2, putCallRatio: 0.9,
    rsi: 40, williams: -62, williamsRising: false, vol30d: "Elevated", beta: 1.4,
    atr: 6, bollPosition: "Lower",
    macd: { line: -6, signal: -4, hist: -2, cross: "Bearish" },
    stoch: 32,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 218, fibLow: 112, fibGoldenLow: 147, fibGoldenHigh: 184,
    vwap: { daily: 152, weekly: 162, monthly: 178, anchoredEarnings: 195 },
    obvTrend: "Flat",
    cmf: -0.05,
    rsVsSpy: -10, rsVsSector: -5,
    analystTarget: 195, upside: 32, analystCount: 18, buyRating: 15,
    earnings: "May 8, 2026", earningsReaction: [{ q: "Q4 25", move: "+5%" }],
    lastRevision: { date: "Apr 6", action: "Maintained $195", firm: "Morgan Stanley" },
    politicalSig: 4, govContract: 3, insider: 2,
    smartMoney13F: { funds: 7, trend: "Accumulation", highlight: "Appaloosa top holding" },
    catalysts: "Nuclear fleet (Comanche Peak), data center PPAs, TXU retail stability", 
    risks: "Power price volatility, Texas weather (ERCOT), regulatory",
    moat: "Moderate — nuclear + gas fleet positioning, Texas concentration",
    structuralThesis: "Vistra operates nuclear + gas + retail power in Texas (ERCOT). Secondary nuclear play at lower valuation than CEG. Same AI power thesis, less premium.",
    structuralInvalidation: "ERCOT regulatory change, OR Texas weather event (freeze) causes major outage",
    tacticalThesis: "Below SMA 200. Pair trade with CEG at lower valuation.",
    tacticalInvalidation: "Break below $112",
    tacticalCompletion: "Data center PPA announcement, $180 reclaim",
    lastCall: { date: "Feb 26, 2026", bullSignals: ["Record earnings", "PPA pipeline"], redFlags: ["Weather risk"], tone: "Confident", verdict: "QUALIFIES" },
    score: 76, verdict: "BUY — pair with CEG", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+32%", note: "Target $195" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "26% growth" },
    p3_sma200: { pass: true, val: "-2.6%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Record earnings confirmed" },
    p5_peRatio: { pass: true, val: "22 (medium)", note: "Leader band" },
    p6_supportResist: { pass: true, val: "R:R 1:3.1", note: "Decent R:R" },
    p7_williams: { pass: true, val: "-62", note: "Approaching oversold" },
    principlesPassed: 7,
  },
  {
    t: "GEV", name: "GE Vernova", sector: "Power Equipment", industry: "Turbines / grid",
    tier: "T1", cat: "WATCHLIST", lifecycle: "Growth-Leader",
    price: 352, sma50: 395, sma200: 378, ema50: 390, ytd: -4, high52: 485, low52: 288,
    mcap: 97, shares: 0.275,
    fwdPE: 32, peHist5y: null, peHist6m: 38, peg: 0.4,
    roic: 8, roe: 12, roa: 4, margin: 7, grossMargin: 20, netMargin: 5,
    revGrowth: 14, revGrowth3y: 8, revGrowth1y: 14, epsGrowth: 85, epsGrowthFwd: 68,
    debtEbitda: 0.5, netDebtEbitda: -0.2, intCoverage: 15, currentRatio: 1.3, quickRatio: 1.1,
    altmanZ: 4, piotroskiF: 8,
    fcfYield: 2.2, psRatio: 2.7, pbRatio: 8, evEbitda: 22, evFcf: 45, fcfMargin: 6,
    totalCash: 8, opEx: 30, cashRunway: 3.2, debtToCapital: 22, industryDebtAvg: 40,
    buybackYield: 0.8, divYield: 0.3, shareholderYield: 1.1, shareCount5y: "-0.5%",
    insiderOwn: 0.1, insiderTrend: "Neutral",
    instOwn: 82, shortInterest: 1.5, putCallRatio: 0.7,
    rsi: 41, williams: -60, williamsRising: true, vol30d: "Elevated", beta: 1.3,
    atr: 14, bollPosition: "Lower",
    macd: { line: -14, signal: -10, hist: -4, cross: "Bearish" },
    stoch: 30,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 485, fibLow: 288, fibGoldenLow: 365, fibGoldenHigh: 433,
    vwap: { daily: 358, weekly: 378, monthly: 410, anchoredEarnings: 445 },
    obvTrend: "Flat",
    cmf: 0.02,
    rsVsSpy: -6, rsVsSector: -3,
    analystTarget: 485, upside: 38, analystCount: 28, buyRating: 24,
    earnings: "April 23, 2026", earningsReaction: [{ q: "Q4 25", move: "+12%" }],
    lastRevision: { date: "Apr 15", action: "Maintained $485", firm: "JPMorgan" },
    politicalSig: 4, govContract: 4, insider: 3,
    smartMoney13F: { funds: 10, trend: "Accumulation", highlight: "Viking added 18%" },
    catalysts: "Gas turbine orders at record (AI data centers), grid modernization, wind recovery, earnings Apr 23 (THIS WEEK)", 
    risks: "Execution on grid backlog, wind segment losses, cyclical equipment demand",
    moat: "Wide — GE gas turbine franchise, grid equipment scale",
    structuralThesis: "Only pure-play US power equipment. Gas turbine backlog at records ($100B+). Grid spending cycle starting multi-decade. Wind segment breaking even, providing upside optionality.",
    structuralInvalidation: "Gas turbine orders slow, OR grid modernization policy reversal, OR wind losses widen",
    tacticalThesis: "Near SMA 200, earnings Apr 23 (this week) catalyst.",
    tacticalInvalidation: "Apr 23 miss, or price breaks $288",
    tacticalCompletion: "Apr 23 beats, price reclaims $395",
    lastCall: { date: "Jan 23, 2026", bullSignals: ["Record backlog"], redFlags: ["Wind execution"], tone: "Confident", verdict: "QUALIFIES" },
    score: 78, verdict: "BUY — near earnings catalyst", allocation: "Medium",
    p1_priceTarget: { pass: true, val: "+38%", note: "Target $485" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "14% growth accelerating, EPS +85%" },
    p3_sma200: { pass: true, val: "-6.9%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Record backlog confirmed" },
    p5_peRatio: { pass: true, val: "32 (medium-high)", note: "In 20-39 leader band, PEG 0.4 attractive" },
    p6_supportResist: { pass: true, val: "R:R 1:2.1", note: "Decent R:R" },
    p7_williams: { pass: true, val: "-60 rising", note: "Rising toward -40" },
    principlesPassed: 7,
  },

  // ==================== DEFENSE ====================
  {
    t: "LMT", name: "Lockheed Martin", sector: "Defense", industry: "Aerospace / defense prime",
    tier: "T2", cat: "WATCHLIST", lifecycle: "Mature",
    price: 522, sma50: 508, sma200: 485, ema50: 510, ytd: 8.2, high52: 585, low52: 432,
    mcap: 125, shares: 0.24,
    fwdPE: 19, peHist5y: 17, peHist6m: 18, peg: 1.9,
    roic: 28, roe: 50, roa: 12, margin: 12, grossMargin: 13, netMargin: 11,
    revGrowth: 8, revGrowth3y: 4, revGrowth1y: 8, epsGrowth: 10, epsGrowthFwd: 12,
    debtEbitda: 1.6, netDebtEbitda: 1.4, intCoverage: 12, currentRatio: 1.3, quickRatio: 1.0,
    altmanZ: 3.2, piotroskiF: 7,
    fcfYield: 5.5, psRatio: 1.8, pbRatio: 20, evEbitda: 14, evFcf: 18, fcfMargin: 9,
    totalCash: 2.5, opEx: 62, cashRunway: 0.5, debtToCapital: 58, industryDebtAvg: 45,
    buybackYield: 4.2, divYield: 2.4, shareholderYield: 6.6, shareCount5y: "-8%",
    insiderOwn: 0.1, insiderTrend: "Neutral",
    instOwn: 74, shortInterest: 0.9, putCallRatio: 0.6,
    rsi: 58, williams: -32, williamsRising: false, vol30d: "Normal", beta: 0.6,
    atr: 8, bollPosition: "Upper-middle",
    macd: { line: 6, signal: 5, hist: 1, cross: "Bullish" },
    stoch: 62,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross (established)",
    fibHigh: 585, fibLow: 432, fibGoldenLow: 527, fibGoldenHigh: 553,
    vwap: { daily: 518, weekly: 510, monthly: 495, anchoredEarnings: 478 },
    obvTrend: "Up",
    cmf: 0.15,
    rsVsSpy: +6, rsVsSector: +2,
    analystTarget: 585, upside: 12, analystCount: 28, buyRating: 18,
    earnings: "April 22, 2026", earningsReaction: [{ q: "Q4 25", move: "+4%" }],
    lastRevision: { date: "Apr 10", action: "Raised $560→$585", firm: "Citi" },
    politicalSig: 5, govContract: 5, insider: 3,
    smartMoney13F: { funds: 9, trend: "Stable holding", highlight: "Defensive allocation" },
    catalysts: "Iran/geopolitical defense spending surge, F-35 sustainment, missile defense", 
    risks: "US budget politics, program execution, valuation already repriced",
    moat: "Very wide — irreplaceable defense prime, F-35 monopoly",
    structuralThesis: "Lockheed is the #1 US defense prime with F-35 monopoly (50-year program). Beta 0.6 = defensive characteristics rare in current regime. Shareholder yield 6.6% (4.2% buyback + 2.4% div) is best in sector.",
    structuralInvalidation: "F-35 program major cut, OR major program loss",
    tacticalThesis: "Already broke out on Iran catalyst — entry premium now. Quality hold but limited upside.",
    tacticalInvalidation: "Break below $485 (SMA 200)",
    tacticalCompletion: "None pending — riding leadership",
    lastCall: { date: "Jan 27, 2026", bullSignals: ["Book-to-bill >1"], redFlags: ["Budget concerns"], tone: "Confident", verdict: "QUALIFIES" },
    score: 71, verdict: "HOLD existing / wait pullback", allocation: "Small",
    p1_priceTarget: { pass: false, val: "+12%", note: "Below 20% threshold" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "8% growth mature leader" },
    p3_sma200: { pass: false, val: "+7.6%", note: "ABOVE SMA 200 — not entry zone" },
    p4_confCall: { pass: true, val: "Qualified", note: "Strong book-to-bill" },
    p5_peRatio: { pass: true, val: "19 (conservative)", note: "Below sector" },
    p6_supportResist: { pass: false, val: "R:R 1:0.7", note: "Weak R:R at current levels" },
    p7_williams: { pass: false, val: "-32", note: "Near overbought" },
    principlesPassed: 3,
  },
  {
    t: "RTX", name: "RTX Corp", sector: "Defense / Aero", industry: "Defense / commercial aero",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Mature",
    price: 132, sma50: 128, sma200: 124, ema50: 129, ytd: 6, high52: 148, low52: 108,
    mcap: 176, shares: 1.33,
    fwdPE: 21, peHist5y: 19, peHist6m: 20, peg: 1.5,
    roic: 12, roe: 18, roa: 6, margin: 10, grossMargin: 21, netMargin: 8,
    revGrowth: 8, revGrowth3y: 6, revGrowth1y: 8, epsGrowth: 14, epsGrowthFwd: 12,
    debtEbitda: 2.8, netDebtEbitda: 2.5, intCoverage: 6, currentRatio: 1.1, quickRatio: 0.8,
    altmanZ: 2.5, piotroskiF: 6,
    fcfYield: 4.5, psRatio: 2.2, pbRatio: 3.2, evEbitda: 14, evFcf: 22, fcfMargin: 10,
    totalCash: 5, opEx: 60, cashRunway: 1.0, debtToCapital: 45, industryDebtAvg: 45,
    buybackYield: 1.8, divYield: 2.1, shareholderYield: 3.9, shareCount5y: "-3%",
    insiderOwn: 0.08, insiderTrend: "Neutral",
    instOwn: 82, shortInterest: 1.2, putCallRatio: 0.7,
    rsi: 56, williams: -38, williamsRising: false, vol30d: "Normal", beta: 0.8,
    atr: 2.5, bollPosition: "Upper-middle",
    macd: { line: 1.5, signal: 1, hist: 0.5, cross: "Bullish" },
    stoch: 55,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross",
    fibHigh: 148, fibLow: 108, fibGoldenLow: 133, fibGoldenHigh: 139,
    vwap: { daily: 130, weekly: 128, monthly: 125, anchoredEarnings: 120 },
    obvTrend: "Up",
    cmf: 0.08,
    rsVsSpy: +4, rsVsSector: -1,
    analystTarget: 148, upside: 12, analystCount: 26, buyRating: 15,
    earnings: "April 22, 2026", earningsReaction: [{ q: "Q4 25", move: "+2%" }],
    lastRevision: { date: "Apr 8", action: "Maintained $148", firm: "RBC" },
    politicalSig: 4, govContract: 5, insider: 2,
    smartMoney13F: { funds: 7, trend: "Stable", highlight: "—" },
    catalysts: "Patriot/NASAMS demand from Ukraine/Iran, commercial aero recovery", 
    risks: "GTF engine recall costs still overhang, execution",
    moat: "Wide — Patriot monopoly, Pratt & Whitney, Collins",
    structuralThesis: "Defense + commercial aero combo. Patriot missile monopoly. GTF engine recall is working through.",
    structuralInvalidation: "GTF costs widen, OR commercial aero downturn",
    tacticalThesis: "Riding defense leadership but limited upside.",
    tacticalInvalidation: "Break below $124",
    tacticalCompletion: "None immediate",
    lastCall: { date: "Jan 23, 2026", bullSignals: ["Strong demand"], redFlags: ["GTF overhang"], tone: "Cautious-positive", verdict: "QUALIFIES" },
    score: 68, verdict: "HOLD / avoid chase", allocation: "—",
    cat: "SCREENED",
    p1_priceTarget: { pass: false, val: "+12%", note: "Below 20%" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "8% growth" },
    p3_sma200: { pass: false, val: "+6.5%", note: "ABOVE SMA 200 — not entry" },
    p4_confCall: { pass: true, val: "Qualified", note: "Solid" },
    p5_peRatio: { pass: true, val: "21 (medium)", note: "Leader band" },
    p6_supportResist: { pass: false, val: "R:R 1:1.2", note: "Weak R:R" },
    p7_williams: { pass: false, val: "-38", note: "Mid-range" },
    principlesPassed: 3,
  },
  {
    t: "PLTR", name: "Palantir", sector: "Software / Defense", industry: "Data / AI platform",
    tier: "T3", cat: "SCREENED", lifecycle: "Growth-Leader",
    price: 72, sma50: 82, sma200: 75, ema50: 80, ytd: -9, high52: 125, low52: 62,
    mcap: 162, shares: 2.25,
    fwdPE: 98, peHist5y: 180, peHist6m: 110, peg: 1.9,
    roic: 14, roe: 12, roa: 8, margin: 22, grossMargin: 80, netMargin: 20,
    revGrowth: 38, revGrowth3y: 25, revGrowth1y: 38, epsGrowth: 52, epsGrowthFwd: 40,
    debtEbitda: -0.2, netDebtEbitda: -2.0, intCoverage: 150, currentRatio: 5.8, quickRatio: 5.8,
    altmanZ: 15, piotroskiF: 8,
    fcfYield: 1.8, psRatio: 52, pbRatio: 38, evEbitda: 180, evFcf: 55, fcfMargin: 32,
    totalCash: 5.5, opEx: 2.4, cashRunway: 27.5, debtToCapital: 0, industryDebtAvg: 28,
    buybackYield: 0, divYield: 0, shareholderYield: 0, shareCount5y: "+4%",
    insiderOwn: 8, insiderTrend: "Karp/Thiel selling",
    instOwn: 45, shortInterest: 3.2, putCallRatio: 1.3,
    rsi: 36, williams: -72, williamsRising: true, vol30d: "Very High", beta: 2.1,
    atr: 4, bollPosition: "Lower",
    macd: { line: -3, signal: -2, hist: -1, cross: "Bearish" },
    stoch: 28,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 125, fibLow: 62, fibGoldenLow: 81, fibGoldenHigh: 104,
    vwap: { daily: 74, weekly: 80, monthly: 92, anchoredEarnings: 98 },
    obvTrend: "Flat",
    cmf: -0.05,
    rsVsSpy: -11, rsVsSector: -4,
    analystTarget: 88, upside: 22, analystCount: 22, buyRating: 8,
    earnings: "May 5, 2026", earningsReaction: [{ q: "Q4 25", move: "+22%" }, { q: "Q1 26", move: "-18%" }],
    lastRevision: { date: "Apr 4", action: "Lowered $95→$88", firm: "Morgan Stanley" },
    politicalSig: 5, govContract: 5, insider: 1,
    smartMoney13F: { funds: 6, trend: "Mixed", highlight: "Retail-heavy ownership" },
    catalysts: "DoD AIP adoption, commercial AI platform wins, potential TITAN contract expansion", 
    risks: "Extreme valuation (PS 52x), insider selling, execution beyond gov",
    moat: "Moderate — ontology tech, gov lock-in",
    structuralThesis: "Palantir has real tech moat in gov/defense (AIP is a genuinely differentiated product). Commercial AI platform scaling. But 98x forward PE requires perfection.",
    structuralInvalidation: "Gov contract growth below 20%, OR commercial growth below 40%",
    tacticalThesis: "Below SMA 200 creates interest but PS 52 demands perfection.",
    tacticalInvalidation: "Break below $62",
    tacticalCompletion: "May 5 blow-out quarter",
    lastCall: { date: "Feb 3, 2026", bullSignals: ["AIP momentum"], redFlags: ["Valuation"], tone: "Karp theatrical", verdict: "WATCH" },
    score: 62, verdict: "WATCH — size small if any", allocation: "Tiny",
    p1_priceTarget: { pass: true, val: "+22%", note: "Target $88" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "38% growth" },
    p3_sma200: { pass: true, val: "-4%", note: "Below SMA 200" },
    p4_confCall: { pass: false, val: "Theatrical, thin numbers", note: "Qualitative noise" },
    p5_peRatio: { pass: false, val: "98 (very high)", note: "Demands perfection" },
    p6_supportResist: { pass: true, val: "R:R 1:2.5", note: "OK R:R" },
    p7_williams: { pass: true, val: "-72", note: "Approaching oversold" },
    principlesPassed: 4,
  },

  // ==================== CYBERSECURITY ====================
  {
    t: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity", industry: "Platform security",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Leader",
    price: 345, sma50: 372, sma200: 362, ema50: 370, ytd: -7, high52: 425, low52: 308,
    mcap: 225, shares: 0.65,
    fwdPE: 52, peHist5y: 68, peHist6m: 58, peg: 2.2,
    roic: 18, roe: 22, roa: 8, margin: 26, grossMargin: 74, netMargin: 24,
    revGrowth: 16, revGrowth3y: 22, revGrowth1y: 16, epsGrowth: 24, epsGrowthFwd: 22,
    debtEbitda: 0.4, netDebtEbitda: -1.5, intCoverage: 55, currentRatio: 1.5, quickRatio: 1.5,
    altmanZ: 8, piotroskiF: 7,
    fcfYield: 2.8, psRatio: 11, pbRatio: 18, evEbitda: 42, evFcf: 35, fcfMargin: 38,
    totalCash: 8, opEx: 5.2, cashRunway: 18.5, debtToCapital: 15, industryDebtAvg: 28,
    buybackYield: 1.2, divYield: 0, shareholderYield: 1.2, shareCount5y: "-1%",
    insiderOwn: 0.5, insiderTrend: "Neutral",
    instOwn: 75, shortInterest: 1.2, putCallRatio: 0.8,
    rsi: 42, williams: -58, williamsRising: false, vol30d: "Normal", beta: 1.1,
    atr: 8, bollPosition: "Lower",
    macd: { line: -7, signal: -5, hist: -2, cross: "Bearish" },
    stoch: 35,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Near Death Cross",
    fibHigh: 425, fibLow: 308, fibGoldenLow: 353, fibGoldenHigh: 400,
    vwap: { daily: 352, weekly: 365, monthly: 385, anchoredEarnings: 405 },
    obvTrend: "Flat",
    cmf: -0.04,
    rsVsSpy: -9, rsVsSector: -3,
    analystTarget: 420, upside: 22, analystCount: 42, buyRating: 35,
    earnings: "May 20, 2026", earningsReaction: [{ q: "Q1 26", move: "-4%" }],
    lastRevision: { date: "Apr 7", action: "Maintained $420", firm: "Goldman" },
    politicalSig: 3, govContract: 4, insider: 2,
    smartMoney13F: { funds: 8, trend: "Accumulation", highlight: "Tiger Global added 10%" },
    catalysts: "Platform consolidation wins, CyberArk acquisition synergies, AI-driven threat detection", 
    risks: "Valuation premium, consolidation competition, decel from platformization",
    moat: "Wide — only full-stack security platform at scale post-CyberArk",
    structuralThesis: "Cyber spending secular — 15-20% TAM growth. PANW is only full-stack platform at scale. CyberArk acquisition deepens moat in identity. Platform consolidation trend favors them.",
    structuralInvalidation: "Platform growth below 15%, OR CyberArk synergies fail to materialize",
    tacticalThesis: "Below SMA 200. Valuation expensive but justified by platform moat.",
    tacticalInvalidation: "Break below $308",
    tacticalCompletion: "Q3 earnings May 20 confirms platform acceleration",
    lastCall: { date: "Feb 12, 2026", bullSignals: ["Platform wins"], redFlags: ["Billings noise"], tone: "Confident", verdict: "QUALIFIES" },
    score: 74, verdict: "ACCUMULATE on dips", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+22%", note: "Target $420" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "16% growth, cyber leader" },
    p3_sma200: { pass: true, val: "-4.7%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Platform consolidation thesis intact" },
    p5_peRatio: { pass: false, val: "52 (high)", note: "Above 40, high-risk zone per course" },
    p6_supportResist: { pass: true, val: "R:R 1:2", note: "Acceptable R:R" },
    p7_williams: { pass: true, val: "-58", note: "Mid-oversold" },
    principlesPassed: 6,
  },
  {
    t: "CRWD", name: "CrowdStrike", sector: "Cybersecurity", industry: "Endpoint / cloud sec",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Leader",
    price: 302, sma50: 338, sma200: 348, ema50: 335, ytd: -14, high52: 425, low52: 265,
    mcap: 74, shares: 0.245,
    fwdPE: 68, peHist5y: 120, peHist6m: 85, peg: 2.1,
    roic: 8, roe: 10, roa: 6, margin: 22, grossMargin: 78, netMargin: 18,
    revGrowth: 24, revGrowth3y: 35, revGrowth1y: 24, epsGrowth: 32, epsGrowthFwd: 28,
    debtEbitda: -0.5, netDebtEbitda: -2.2, intCoverage: 120, currentRatio: 1.8, quickRatio: 1.8,
    altmanZ: 6, piotroskiF: 7,
    fcfYield: 2.6, psRatio: 14, pbRatio: 18, evEbitda: 62, evFcf: 38, fcfMargin: 33,
    totalCash: 4, opEx: 2.2, cashRunway: 21.8, debtToCapital: 0, industryDebtAvg: 28,
    buybackYield: 0, divYield: 0, shareholderYield: 0, shareCount5y: "+3%",
    insiderOwn: 0.8, insiderTrend: "Neutral",
    instOwn: 72, shortInterest: 3.5, putCallRatio: 1.1,
    rsi: 36, williams: -70, williamsRising: true, vol30d: "Elevated", beta: 1.3,
    atr: 12, bollPosition: "Lower",
    macd: { line: -12, signal: -8, hist: -4, cross: "Bearish" },
    stoch: 25,
    goldenCross: false, deathCross: true, goldenDeathStatus: "Death Cross",
    fibHigh: 425, fibLow: 265, fibGoldenLow: 324, fibGoldenHigh: 390,
    vwap: { daily: 308, weekly: 325, monthly: 355, anchoredEarnings: 378 },
    obvTrend: "Down",
    cmf: -0.08,
    rsVsSpy: -16, rsVsSector: -8,
    analystTarget: 385, upside: 28, analystCount: 40, buyRating: 32,
    earnings: "June 3, 2026", earningsReaction: [{ q: "Q3 26", move: "+4%" }],
    lastRevision: { date: "Apr 9", action: "Maintained $385", firm: "Morgan Stanley" },
    politicalSig: 2, govContract: 3, insider: 1,
    smartMoney13F: { funds: 7, trend: "Neutral", highlight: "—" },
    catalysts: "ARR crossing $5B, Falcon Flex adoption, AI-native SOC", 
    risks: "July 2024 outage memory, PANW competition, valuation",
    moat: "Moderate-wide — Falcon platform, customer stickiness, AI-native architecture",
    structuralThesis: "Best cloud endpoint security. AI-native Falcon architecture. Outage recovery complete. Customer retention high.",
    structuralInvalidation: "NRR below 115%, OR ARR growth below 20%",
    tacticalThesis: "-14% YTD, well below SMAs. Premium valuation compressed.",
    tacticalInvalidation: "Break below $265",
    tacticalCompletion: "June 3 earnings accelerates",
    lastCall: { date: "Mar 4, 2026", bullSignals: ["ARR momentum"], redFlags: ["Outage scars"], tone: "Confident", verdict: "QUALIFIES" },
    score: 70, verdict: "WATCH — wait for SMA 200 retest", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+28%", note: "Target $385" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "24% growth" },
    p3_sma200: { pass: true, val: "-13.2%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "ARR momentum" },
    p5_peRatio: { pass: false, val: "68 (high-risk)", note: "Above 40 — high-risk zone" },
    p6_supportResist: { pass: true, val: "R:R 1:2.3", note: "OK R:R" },
    p7_williams: { pass: true, val: "-70 rising", note: "Rising from oversold" },
    principlesPassed: 6,
  },

  // ==================== HEALTHCARE ====================
  {
    t: "LLY", name: "Eli Lilly", sector: "Healthcare", industry: "Pharma / GLP-1",
    tier: "T1", cat: "PORTFOLIO", lifecycle: "Growth-Leader",
    price: 722, sma50: 765, sma200: 758, ema50: 762, ytd: -5, high52: 972, low52: 632,
    mcap: 682, shares: 0.945,
    fwdPE: 36, peHist5y: 42, peHist6m: 38, peg: 0.8,
    roic: 32, roe: 75, roa: 18, margin: 26, grossMargin: 83, netMargin: 22,
    revGrowth: 28, revGrowth3y: 35, revGrowth1y: 28, epsGrowth: 48, epsGrowthFwd: 42,
    debtEbitda: 1.1, netDebtEbitda: 0.8, intCoverage: 22, currentRatio: 1.3, quickRatio: 1.0,
    altmanZ: 5, piotroskiF: 8,
    fcfYield: 1.9, psRatio: 14, pbRatio: 58, evEbitda: 30, evFcf: 52, fcfMargin: 15,
    totalCash: 3.5, opEx: 12, cashRunway: 3.5, debtToCapital: 45, industryDebtAvg: 30,
    buybackYield: 0.3, divYield: 0.8, shareholderYield: 1.1, shareCount5y: "0%",
    insiderOwn: 0.1, insiderTrend: "Neutral",
    instOwn: 85, shortInterest: 1.8, putCallRatio: 0.6,
    rsi: 42, williams: -58, williamsRising: false, vol30d: "Normal", beta: 0.4,
    atr: 22, bollPosition: "Lower",
    macd: { line: -12, signal: -8, hist: -4, cross: "Bearish" },
    stoch: 32,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross (established)",
    fibHigh: 972, fibLow: 632, fibGoldenLow: 762, fibGoldenHigh: 897,
    vwap: { daily: 735, weekly: 762, monthly: 820, anchoredEarnings: 865 },
    obvTrend: "Flat",
    cmf: -0.03,
    rsVsSpy: -7, rsVsSector: -3,
    analystTarget: 928, upside: 29, analystCount: 32, buyRating: 28,
    earnings: "May 1, 2026", earningsReaction: [{ q: "Q4 25", move: "-5%" }],
    lastRevision: { date: "Apr 9", action: "Maintained $928", firm: "UBS" },
    politicalSig: 3, govContract: 2, insider: 2,
    smartMoney13F: { funds: 10, trend: "Accumulation", highlight: "Baillie Gifford top 10" },
    catalysts: "Zepbound/Mounjaro growth, Alzheimer's Kisunla, oral GLP-1 orforglipron, pipeline", 
    risks: "GLP-1 competition (NVO, PFE), pricing pressure, manufacturing scale",
    moat: "Wide — GLP-1 leader, pipeline depth",
    structuralThesis: "Obesity is trillion-dollar TAM. Lilly is a top 2 player (with NVO). Mounjaro/Zepbound manufacturing scaling. Oral GLP-1 (orforglipron) could 10x accessible market. Alzheimer's drug Kisunla is optionality.",
    structuralInvalidation: "Loses market share to NVO below 40% of category, OR oral GLP-1 fails trials",
    tacticalThesis: "Below SMA 200 first time in 2 years. PE 36 vs 5Y 42. Low beta (0.4) rare and valuable in this regime.",
    tacticalInvalidation: "Break below $632",
    tacticalCompletion: "May 1 earnings confirms GLP-1 trajectory, price reclaims $760",
    lastCall: { date: "Feb 6, 2026", bullSignals: ["GLP-1 sales record"], redFlags: ["Supply constraints"], tone: "Confident", verdict: "QUALIFIES" },
    score: 82, verdict: "BUY — defensive growth", allocation: "Medium",
    p1_priceTarget: { pass: true, val: "+29%", note: "Target $928" },
    p2_salesGrowth: { pass: true, val: "Growth-Leader", note: "28% growth in trillion-dollar category" },
    p3_sma200: { pass: true, val: "-4.7%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Record sales" },
    p5_peRatio: { pass: true, val: "36 (medium)", note: "In 20-39 leader band" },
    p6_supportResist: { pass: true, val: "R:R 1:2.3", note: "Good R:R" },
    p7_williams: { pass: true, val: "-58", note: "Mid-oversold" },
    principlesPassed: 7,
  },
  {
    t: "UNH", name: "UnitedHealth", sector: "Healthcare", industry: "Managed care",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Mature",
    price: 462, sma50: 498, sma200: 518, ema50: 495, ytd: -12, high52: 612, low52: 428,
    mcap: 420, shares: 0.91,
    fwdPE: 14, peHist5y: 20, peHist6m: 17, peg: 1.4,
    roic: 14, roe: 20, roa: 6, margin: 6, grossMargin: 22, netMargin: 5,
    revGrowth: 8, revGrowth3y: 10, revGrowth1y: 8, epsGrowth: 10, epsGrowthFwd: 12,
    debtEbitda: 1.4, netDebtEbitda: 1.2, intCoverage: 12, currentRatio: 0.9, quickRatio: 0.8,
    altmanZ: 2.8, piotroskiF: 6,
    fcfYield: 6.8, psRatio: 0.9, pbRatio: 4.2, evEbitda: 11, evFcf: 15, fcfMargin: 6,
    totalCash: 25, opEx: 350, cashRunway: 0.9, debtToCapital: 42, industryDebtAvg: 35,
    buybackYield: 2.5, divYield: 1.8, shareholderYield: 4.3, shareCount5y: "-4%",
    insiderOwn: 0.2, insiderTrend: "Buying",
    instOwn: 88, shortInterest: 1.2, putCallRatio: 0.7,
    rsi: 34, williams: -78, williamsRising: false, vol30d: "Elevated", beta: 0.5,
    atr: 14, bollPosition: "Below lower",
    macd: { line: -14, signal: -9, hist: -5, cross: "Bearish" },
    stoch: 22,
    goldenCross: false, deathCross: true, goldenDeathStatus: "Death Cross",
    fibHigh: 612, fibLow: 428, fibGoldenLow: 542, fibGoldenHigh: 573,
    vwap: { daily: 468, weekly: 488, monthly: 522, anchoredEarnings: 555 },
    obvTrend: "Down",
    cmf: -0.15,
    rsVsSpy: -14, rsVsSector: -8,
    analystTarget: 582, upside: 26, analystCount: 24, buyRating: 18,
    earnings: "July 15, 2026", earningsReaction: [{ q: "Q4 25", move: "-10%" }],
    lastRevision: { date: "Apr 11", action: "Lowered $620→$582", firm: "Morgan Stanley" },
    politicalSig: 2, govContract: 3, insider: 2,
    smartMoney13F: { funds: 8, trend: "Contrarian buying", highlight: "Greenlight initiated" },
    catalysts: "Medicaid repricing cycle, Optum growth, medical cost trend stabilization", 
    risks: "MLR pressures, regulatory (Medicare Advantage), CEO transition",
    moat: "Wide — scale in managed care + Optum services flywheel",
    structuralThesis: "Largest US health insurer + Optum services flywheel. FCF yield 6.8% = unusual value. Low beta (0.5) is defensive in this regime.",
    structuralInvalidation: "MLR trend doesn't stabilize, OR Medicare Advantage regulatory loss",
    tacticalThesis: "Deep below SMA 200, PE at 5Y lows. Contrarian quality.",
    tacticalInvalidation: "Break below $428",
    tacticalCompletion: "MLR stabilization, price reclaims $518",
    lastCall: { date: "Jan 16, 2026", bullSignals: ["Optum growth"], redFlags: ["MLR pressure"], tone: "Cautious", verdict: "WATCH" },
    score: 76, verdict: "BUY ZONE — contrarian", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+26%", note: "Target $582" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "8% growth mature" },
    p3_sma200: { pass: true, val: "-10.8%", note: "Below SMA 200" },
    p4_confCall: { pass: false, val: "Cautious MLR", note: "Watch Q1 earnings" },
    p5_peRatio: { pass: true, val: "14 (conservative)", note: "Cheap" },
    p6_supportResist: { pass: true, val: "R:R 1:3.5", note: "Good R:R" },
    p7_williams: { pass: true, val: "-78", note: "Deep oversold — portfolio entry" },
    principlesPassed: 6,
  },

  // ==================== ENERGY ====================
  {
    t: "XOM", name: "Exxon Mobil", sector: "Energy", industry: "Integrated oil",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Mature",
    price: 148, sma50: 135, sma200: 122, ema50: 138, ytd: 42, high52: 152, low52: 102,
    mcap: 655, shares: 4.43,
    fwdPE: 14, peHist5y: 12, peHist6m: 13, peg: 0.3,
    roic: 14, roe: 18, roa: 8, margin: 12, grossMargin: 22, netMargin: 12,
    revGrowth: 16, revGrowth3y: 8, revGrowth1y: 16, epsGrowth: 45, epsGrowthFwd: 32,
    debtEbitda: 0.7, netDebtEbitda: 0.4, intCoverage: 25, currentRatio: 1.4, quickRatio: 1.2,
    altmanZ: 4.2, piotroskiF: 7,
    fcfYield: 6.2, psRatio: 1.6, pbRatio: 2.2, evEbitda: 7, evFcf: 16, fcfMargin: 10,
    totalCash: 32, opEx: 300, cashRunway: 1.3, debtToCapital: 20, industryDebtAvg: 35,
    buybackYield: 3.2, divYield: 3.5, shareholderYield: 6.7, shareCount5y: "-5%",
    insiderOwn: 0.1, insiderTrend: "Neutral",
    instOwn: 62, shortInterest: 0.9, putCallRatio: 0.6,
    rsi: 64, williams: -22, williamsRising: false, vol30d: "Normal", beta: 0.8,
    atr: 4, bollPosition: "Upper",
    macd: { line: 5, signal: 4, hist: 1, cross: "Bullish" },
    stoch: 72,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross extended",
    fibHigh: 152, fibLow: 102, fibGoldenLow: 133, fibGoldenHigh: 141,
    vwap: { daily: 145, weekly: 138, monthly: 128, anchoredEarnings: 118 },
    obvTrend: "Up",
    cmf: 0.22,
    rsVsSpy: +40, rsVsSector: +2,
    analystTarget: 158, upside: 7, analystCount: 26, buyRating: 15,
    earnings: "May 2, 2026", earningsReaction: [{ q: "Q4 25", move: "+8%" }],
    lastRevision: { date: "Apr 3", action: "Raised $148→$158", firm: "JPMorgan" },
    politicalSig: 3, govContract: 3, insider: 2,
    smartMoney13F: { funds: 9, trend: "Stable", highlight: "—" },
    catalysts: "Brent >$100 on Iran tensions, Guyana production ramp, Permian scaling", 
    risks: "Oil price reversal, geopolitical de-escalation, energy transition",
    moat: "Wide — integrated scale, low-cost barrels",
    structuralThesis: "Integrated oil major with low-cost Guyana + Permian production. Shareholder yield 6.7% (3.2% buyback + 3.5% div) is best in sector.",
    structuralInvalidation: "Oil price crash below $60 for extended period",
    tacticalThesis: "Already up 42% YTD. Quality at premium. Hedge asset for stagflation.",
    tacticalInvalidation: "Break below $122 (SMA 200)",
    tacticalCompletion: "None — riding leadership",
    lastCall: { date: "Feb 2, 2026", bullSignals: ["Guyana ramp"], redFlags: ["Capex discipline"], tone: "Confident", verdict: "QUALIFIES" },
    score: 72, verdict: "HOLD existing / risky new entry", allocation: "Small",
    p1_priceTarget: { pass: false, val: "+7%", note: "Below 20%" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "16% rev from oil spike" },
    p3_sma200: { pass: false, val: "+21.3%", note: "WAY ABOVE SMA 200 — not entry" },
    p4_confCall: { pass: true, val: "Qualified", note: "Solid" },
    p5_peRatio: { pass: true, val: "14 (conservative)", note: "Cheap" },
    p6_supportResist: { pass: false, val: "R:R 1:0.2", note: "Very weak R:R" },
    p7_williams: { pass: false, val: "-22", note: "Near overbought" },
    principlesPassed: 3,
  },

  // ==================== FINANCIALS ====================
  {
    t: "JPM", name: "JPMorgan Chase", sector: "Financials", industry: "Universal bank",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Mature",
    price: 228, sma50: 244, sma200: 238, ema50: 242, ytd: -3, high52: 282, low52: 198,
    mcap: 640, shares: 2.8,
    fwdPE: 12, peHist5y: 11, peHist6m: 11, peg: 1.5,
    roic: 15, roe: 17, roa: 1.4, margin: 34, grossMargin: null, netMargin: 32,
    revGrowth: 6, revGrowth3y: 8, revGrowth1y: 6, epsGrowth: 8, epsGrowthFwd: 10,
    debtEbitda: null, netDebtEbitda: null, intCoverage: null, currentRatio: null, quickRatio: null,
    altmanZ: null, piotroskiF: 7,
    fcfYield: null, psRatio: 3.7, pbRatio: 1.8, evEbitda: null, evFcf: null, fcfMargin: null,
    totalCash: 380, opEx: 95, cashRunway: 48, debtToCapital: 14, industryDebtAvg: 12,
    buybackYield: 2.2, divYield: 2.3, shareholderYield: 4.5, shareCount5y: "-6%",
    insiderOwn: 0.4, insiderTrend: "Neutral",
    instOwn: 71, shortInterest: 0.7, putCallRatio: 0.7,
    rsi: 44, williams: -52, williamsRising: true, vol30d: "Normal", beta: 1.1,
    atr: 3.8, bollPosition: "Middle",
    macd: { line: -3, signal: -2, hist: -1, cross: "Bearish weak" },
    stoch: 42,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 282, fibLow: 198, fibGoldenLow: 230, fibGoldenHigh: 264,
    vwap: { daily: 232, weekly: 240, monthly: 252, anchoredEarnings: 262 },
    obvTrend: "Flat",
    cmf: 0.02,
    rsVsSpy: -5, rsVsSector: -2,
    analystTarget: 268, upside: 18, analystCount: 28, buyRating: 18,
    earnings: "July 15, 2026", earningsReaction: [{ q: "Q1 26", move: "+3%" }],
    lastRevision: { date: "Apr 12", action: "Maintained $268", firm: "Wells Fargo" },
    politicalSig: 3, govContract: 2, insider: 2,
    smartMoney13F: { funds: 8, trend: "Stable", highlight: "Berkshire long-held" },
    catalysts: "Credit card delinquency stabilization, NII benefiting from curve shape, fortress balance sheet", 
    risks: "Credit cycle, CRE exposure for mid-caps (not JPM directly), regulatory",
    moat: "Wide — best-in-class universal bank, tech investment lead",
    structuralThesis: "Best-in-class universal bank. Fortress balance sheet. Dimon's exceptional capital allocation. 17% ROE consistently.",
    structuralInvalidation: "Dimon departs, OR ROE below 12% for 4 quarters",
    tacticalThesis: "Below SMA 200. Defensive quality. Steady compounder.",
    tacticalInvalidation: "Break below $198",
    tacticalCompletion: "None near-term",
    lastCall: { date: "Apr 11, 2026", bullSignals: ["Credit improving"], redFlags: ["NII pressure"], tone: "Dimon cautious", verdict: "QUALIFIES" },
    score: 72, verdict: "BUY — defensive add", allocation: "Small",
    p1_priceTarget: { pass: false, val: "+18%", note: "Just below 20%" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "6% rev mature bank" },
    p3_sma200: { pass: true, val: "-4.2%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Solid Q1" },
    p5_peRatio: { pass: true, val: "12 (conservative)", note: "Cheap" },
    p6_supportResist: { pass: true, val: "R:R 1:1.3", note: "Weak R:R" },
    p7_williams: { pass: true, val: "-52 rising", note: "Rising" },
    principlesPassed: 6,
  },
  {
    t: "V", name: "Visa", sector: "Financials — Payments", industry: "Payment network",
    tier: "T1", cat: "WATCHLIST", lifecycle: "Mature",
    price: 278, sma50: 292, sma200: 285, ema50: 290, ytd: -2, high52: 322, low52: 258,
    mcap: 555, shares: 2.0,
    fwdPE: 26, peHist5y: 28, peHist6m: 27, peg: 1.9,
    roic: 28, roe: 50, roa: 22, margin: 52, grossMargin: null, netMargin: 52,
    revGrowth: 11, revGrowth3y: 10, revGrowth1y: 11, epsGrowth: 14, epsGrowthFwd: 12,
    debtEbitda: 0.7, netDebtEbitda: 0.2, intCoverage: 42, currentRatio: 1.3, quickRatio: 1.3,
    altmanZ: 8, piotroskiF: 8,
    fcfYield: 3.6, psRatio: 14, pbRatio: 14, evEbitda: 21, evFcf: 28, fcfMargin: 52,
    totalCash: 20, opEx: 15, cashRunway: 16, debtToCapital: 28, industryDebtAvg: 15,
    buybackYield: 3.1, divYield: 0.8, shareholderYield: 3.9, shareCount5y: "-8%",
    insiderOwn: 0.05, insiderTrend: "Neutral",
    instOwn: 84, shortInterest: 0.4, putCallRatio: 0.6,
    rsi: 46, williams: -50, williamsRising: false, vol30d: "Normal", beta: 0.9,
    atr: 4, bollPosition: "Middle",
    macd: { line: -3, signal: -2, hist: -1, cross: "Bearish weak" },
    stoch: 45,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross",
    fibHigh: 322, fibLow: 258, fibGoldenLow: 282, fibGoldenHigh: 308,
    vwap: { daily: 280, weekly: 290, monthly: 298, anchoredEarnings: 305 },
    obvTrend: "Flat",
    cmf: 0.05,
    rsVsSpy: -4, rsVsSector: +1,
    analystTarget: 325, upside: 17, analystCount: 32, buyRating: 28,
    earnings: "April 29, 2026", earningsReaction: [{ q: "Q1 26", move: "+2%" }],
    lastRevision: { date: "Apr 10", action: "Maintained $325", firm: "Jefferies" },
    politicalSig: 3, govContract: 2, insider: 2,
    smartMoney13F: { funds: 11, trend: "Stable", highlight: "Berkshire long-held" },
    catalysts: "Cross-border payment volume, commercial card growth, earnings Apr 29", 
    risks: "Regulatory (interchange fees), stablecoin disruption, consumer weakening",
    moat: "Very wide — 2-company duopoly with MA, network effects",
    structuralThesis: "Bulletproof compounder. 52% op margins. 28% ROIC. Duopoly with MasterCard. Network effects compound.",
    structuralInvalidation: "Regulatory cap on interchange, OR stablecoins displace >10% of payment volume",
    tacticalThesis: "Slight discount to 5Y avg PE. Below SMA 200. Core defensive holding.",
    tacticalInvalidation: "Break below $258",
    tacticalCompletion: "Apr 29 confirms trajectory",
    lastCall: { date: "Jan 30, 2026", bullSignals: ["Cross-border"], redFlags: ["Consumer debit trends"], tone: "Confident", verdict: "QUALIFIES" },
    score: 76, verdict: "BUY — core defensive", allocation: "Small",
    p1_priceTarget: { pass: false, val: "+17%", note: "Below 20%" },
    p2_salesGrowth: { pass: true, val: "Mature", note: "11% growth mature leader" },
    p3_sma200: { pass: true, val: "-2.5%", note: "Just below SMA 200" },
    p4_confCall: { pass: true, val: "Qualified", note: "Solid" },
    p5_peRatio: { pass: true, val: "26 (medium)", note: "Leader band" },
    p6_supportResist: { pass: true, val: "R:R 1:2.3", note: "Good R:R" },
    p7_williams: { pass: true, val: "-50", note: "Mid-range" },
    principlesPassed: 6,
  },

  // ==================== MATERIALS / COPPER ====================
  {
    t: "FCX", name: "Freeport-McMoRan", sector: "Materials — Copper", industry: "Copper / gold mining",
    tier: "T3", cat: "WATCHLIST", lifecycle: "Growth-Cyclical",
    price: 48, sma50: 46, sma200: 44, ema50: 46, ytd: 14, high52: 58, low52: 36,
    mcap: 70, shares: 1.46,
    fwdPE: 18, peHist5y: 16, peHist6m: 17, peg: 0.4,
    roic: 14, roe: 18, roa: 8, margin: 19, grossMargin: 35, netMargin: 15,
    revGrowth: 18, revGrowth3y: 10, revGrowth1y: 18, epsGrowth: 42, epsGrowthFwd: 35,
    debtEbitda: 1.1, netDebtEbitda: 0.8, intCoverage: 12, currentRatio: 2.2, quickRatio: 1.8,
    altmanZ: 4, piotroskiF: 7,
    fcfYield: 4.2, psRatio: 2.8, pbRatio: 3.2, evEbitda: 7, evFcf: 16, fcfMargin: 18,
    totalCash: 4, opEx: 20, cashRunway: 2.4, debtToCapital: 32, industryDebtAvg: 40,
    buybackYield: 0.8, divYield: 0.8, shareholderYield: 1.6, shareCount5y: "-2%",
    insiderOwn: 0.2, insiderTrend: "Neutral",
    instOwn: 82, shortInterest: 1.5, putCallRatio: 0.7,
    rsi: 58, williams: -30, williamsRising: false, vol30d: "Normal", beta: 1.6,
    atr: 1.5, bollPosition: "Upper",
    macd: { line: 1.5, signal: 1, hist: 0.5, cross: "Bullish" },
    stoch: 65,
    goldenCross: true, deathCross: false, goldenDeathStatus: "Golden Cross",
    fibHigh: 58, fibLow: 36, fibGoldenLow: 44, fibGoldenHigh: 53,
    vwap: { daily: 47, weekly: 45, monthly: 43, anchoredEarnings: 40 },
    obvTrend: "Up",
    cmf: 0.12,
    rsVsSpy: +12, rsVsSector: +4,
    analystTarget: 62, upside: 29, analystCount: 22, buyRating: 18,
    earnings: "April 23, 2026", earningsReaction: [{ q: "Q4 25", move: "+6%" }],
    lastRevision: { date: "Apr 7", action: "Raised $58→$62", firm: "Morgan Stanley" },
    politicalSig: 3, govContract: 2, insider: 2,
    smartMoney13F: { funds: 7, trend: "Accumulation", highlight: "Appaloosa added 15%" },
    catalysts: "Copper supply deficit by 2030, data center copper demand, grid electrification", 
    risks: "Commodity cyclicality, Indonesia operations, China demand",
    moat: "Moderate — scarce world-class copper assets (Grasberg, Morenci)",
    structuralThesis: "Structural copper deficit story. Grasberg and Morenci are irreplaceable assets.",
    structuralInvalidation: "Copper price crash, OR Indonesia political instability",
    tacticalThesis: "Above SMAs — participating in leadership but no fresh entry.",
    tacticalInvalidation: "Break below $36",
    tacticalCompletion: "Copper sustains >$5 price",
    lastCall: { date: "Jan 23, 2026", bullSignals: ["Copper demand"], redFlags: ["Cost inflation"], tone: "Confident", verdict: "QUALIFIES" },
    score: 70, verdict: "HOLD / add on 10%+ pullback", allocation: "Small",
    p1_priceTarget: { pass: true, val: "+29%", note: "Target $62" },
    p2_salesGrowth: { pass: true, val: "Growth-Cyclical", note: "18% rev" },
    p3_sma200: { pass: false, val: "+9%", note: "Above SMA 200 — not entry" },
    p4_confCall: { pass: true, val: "Qualified", note: "Copper thesis intact" },
    p5_peRatio: { pass: true, val: "18 (conservative)", note: "Reasonable" },
    p6_supportResist: { pass: false, val: "R:R 1:1.2", note: "Weak R:R" },
    p7_williams: { pass: false, val: "-30", note: "Near overbought" },
    principlesPassed: 4,
  },

  // ==================== ETFs ====================
  {
    t: "QQQM", name: "Invesco Nasdaq 100", sector: "ETF — Large Growth", industry: "NDX tracking",
    tier: "T2", cat: "PORTFOLIO", lifecycle: "N/A",
    price: 198, sma50: 214, sma200: 212, ema50: 213, ytd: -6, high52: 246, low52: 182,
    mcap: null, shares: null,
    fwdPE: 26, peHist5y: 27, peHist6m: 26, peg: null,
    roic: null, roe: null, roa: null, margin: null, grossMargin: null, netMargin: null,
    revGrowth: null, revGrowth3y: null, revGrowth1y: null, epsGrowth: null, epsGrowthFwd: null,
    debtEbitda: null, netDebtEbitda: null, intCoverage: null, currentRatio: null, quickRatio: null,
    altmanZ: null, piotroskiF: null,
    fcfYield: null, psRatio: null, pbRatio: null, evEbitda: null, evFcf: null, fcfMargin: null,
    totalCash: null, opEx: null, cashRunway: null, debtToCapital: null, industryDebtAvg: null,
    buybackYield: null, divYield: 0.6, shareholderYield: null, shareCount5y: null,
    insiderOwn: null, insiderTrend: null,
    instOwn: null, shortInterest: null, putCallRatio: null,
    rsi: 40, williams: -62, williamsRising: true, vol30d: "Normal", beta: 1.1,
    atr: 4, bollPosition: "Lower",
    macd: { line: -5, signal: -4, hist: -1, cross: "Bearish" },
    stoch: 32,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Near Death Cross",
    fibHigh: 246, fibLow: 182, fibGoldenLow: 207, fibGoldenHigh: 232,
    vwap: { daily: 201, weekly: 210, monthly: 220, anchoredEarnings: 230 },
    obvTrend: "Flat",
    cmf: -0.02,
    rsVsSpy: -4, rsVsSector: 0,
    analystTarget: null, upside: null, analystCount: null, buyRating: null,
    earnings: null, earningsReaction: [],
    lastRevision: null,
    politicalSig: null, govContract: null, insider: null,
    smartMoney13F: null,
    catalysts: "DCA vehicle for Nasdaq 100 exposure at discount, 0.15% ER", 
    risks: "Concentrated top 10 (~45%)",
    moat: "N/A — passive vehicle",
    structuralThesis: "Core ETF holding. Cheapest Nasdaq 100 tracker (0.15% ER). Concentrated in your biggest holdings (MSFT, NVDA, META, AAPL, GOOGL, AMZN = ~45%) with diversification tail. Perfect DCA vehicle — buy every month regardless of price.",
    structuralInvalidation: "N/A — never sell ETF core",
    tacticalThesis: "Below SMA 200 = DCA acceleration zone. Cheap exposure to your biggest positions.",
    tacticalInvalidation: "N/A",
    tacticalCompletion: "N/A",
    lastCall: null,
    score: 78, verdict: "DCA — increase pace", allocation: "ETF core",
    p1_priceTarget: { pass: true, val: "ETF", note: "N/A — broad index exposure" },
    p2_salesGrowth: { pass: true, val: "ETF basket", note: "Basket of growth leaders" },
    p3_sma200: { pass: true, val: "-6.6%", note: "Below SMA 200 — DCA acceleration zone" },
    p4_confCall: { pass: true, val: "N/A", note: "ETF" },
    p5_peRatio: { pass: true, val: "26 (medium)", note: "In leader band" },
    p6_supportResist: { pass: true, val: "N/A", note: "ETFs don't need R:R" },
    p7_williams: { pass: true, val: "-62 rising", note: "Approaching oversold" },
    principlesPassed: 7,
  },
  {
    t: "SMH", name: "VanEck Semiconductor", sector: "ETF — Semis", industry: "Semi sector",
    tier: "T2", cat: "PORTFOLIO", lifecycle: "N/A",
    price: 232, sma50: 258, sma200: 252, ema50: 256, ytd: -8, high52: 308, low52: 208,
    mcap: null, shares: null,
    fwdPE: 22, peHist5y: 26, peHist6m: 24, peg: null,
    roic: null, roe: null, roa: null, margin: null, grossMargin: null, netMargin: null,
    revGrowth: null, revGrowth3y: null, revGrowth1y: null, epsGrowth: null, epsGrowthFwd: null,
    debtEbitda: null, netDebtEbitda: null, intCoverage: null, currentRatio: null, quickRatio: null,
    altmanZ: null, piotroskiF: null,
    fcfYield: null, psRatio: null, pbRatio: null, evEbitda: null, evFcf: null, fcfMargin: null,
    totalCash: null, opEx: null, cashRunway: null, debtToCapital: null, industryDebtAvg: null,
    buybackYield: null, divYield: 0.4, shareholderYield: null, shareCount5y: null,
    insiderOwn: null, insiderTrend: null,
    instOwn: null, shortInterest: null, putCallRatio: null,
    rsi: 38, williams: -66, williamsRising: true, vol30d: "Elevated", beta: 1.5,
    atr: 8, bollPosition: "Lower",
    macd: { line: -8, signal: -6, hist: -2, cross: "Bearish" },
    stoch: 28,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 308, fibLow: 208, fibGoldenLow: 246, fibGoldenHigh: 285,
    vwap: { daily: 238, weekly: 252, monthly: 268, anchoredEarnings: 282 },
    obvTrend: "Down",
    cmf: -0.06,
    rsVsSpy: -10, rsVsSector: 0,
    analystTarget: null, upside: null, analystCount: null, buyRating: null,
    earnings: null, earningsReaction: [],
    lastRevision: null,
    politicalSig: null, govContract: null, insider: null,
    smartMoney13F: null,
    catalysts: "Leveraged exposure to AI chip cycle, NVDA/TSM/AVGO concentrated", 
    risks: "High beta, concentration",
    moat: "N/A — passive vehicle",
    structuralThesis: "High-beta semiconductor ETF. Top holdings: NVDA, TSM, AVGO, AMD, QCOM. Complements individual semis positions with diversification tail.",
    structuralInvalidation: "N/A — never sell ETF core",
    tacticalThesis: "Below SMA 200 after AI correction. DCA here is high-risk-high-reward.",
    tacticalInvalidation: "N/A",
    tacticalCompletion: "N/A",
    lastCall: null,
    score: 74, verdict: "DCA — moderate pace", allocation: "ETF satellite",
    p1_priceTarget: { pass: true, val: "ETF", note: "N/A" },
    p2_salesGrowth: { pass: true, val: "Growth basket", note: "Semi sector growth" },
    p3_sma200: { pass: true, val: "-7.9%", note: "Below SMA 200 — DCA zone" },
    p4_confCall: { pass: true, val: "N/A", note: "ETF" },
    p5_peRatio: { pass: true, val: "22 (medium)", note: "Leader band" },
    p6_supportResist: { pass: true, val: "N/A", note: "ETF" },
    p7_williams: { pass: true, val: "-66 rising", note: "Approaching oversold, rising" },
    principlesPassed: 7,
  },
  {
    t: "VOO", name: "Vanguard S&P 500", sector: "ETF — Broad Market", industry: "SPX tracking",
    tier: "T2", cat: "WATCHLIST", lifecycle: "N/A",
    price: 528, sma50: 558, sma200: 545, ema50: 557, ytd: -2, high52: 598, low52: 492,
    mcap: null, shares: null,
    fwdPE: 22, peHist5y: 20, peHist6m: 21, peg: null,
    roic: null, roe: null, roa: null, margin: null, grossMargin: null, netMargin: null,
    revGrowth: null, revGrowth3y: null, revGrowth1y: null, epsGrowth: null, epsGrowthFwd: null,
    debtEbitda: null, netDebtEbitda: null, intCoverage: null, currentRatio: null, quickRatio: null,
    altmanZ: null, piotroskiF: null,
    fcfYield: null, psRatio: null, pbRatio: null, evEbitda: null, evFcf: null, fcfMargin: null,
    totalCash: null, opEx: null, cashRunway: null, debtToCapital: null, industryDebtAvg: null,
    buybackYield: null, divYield: 1.3, shareholderYield: null, shareCount5y: null,
    insiderOwn: null, insiderTrend: null,
    instOwn: null, shortInterest: null, putCallRatio: null,
    rsi: 44, williams: -52, williamsRising: true, vol30d: "Normal", beta: 1.0,
    atr: 8, bollPosition: "Middle-lower",
    macd: { line: -4, signal: -3, hist: -1, cross: "Bearish weak" },
    stoch: 40,
    goldenCross: false, deathCross: false, goldenDeathStatus: "Neutral",
    fibHigh: 598, fibLow: 492, fibGoldenLow: 533, fibGoldenHigh: 575,
    vwap: { daily: 532, weekly: 548, monthly: 558, anchoredEarnings: 575 },
    obvTrend: "Flat",
    cmf: 0.0,
    rsVsSpy: 0, rsVsSector: null,
    analystTarget: null, upside: null, analystCount: null, buyRating: null,
    earnings: null, earningsReaction: [],
    lastRevision: null,
    politicalSig: null, govContract: null, insider: null,
    smartMoney13F: null,
    catalysts: "Core market exposure, 0.03% ER, broad diversification", 
    risks: "Concentration in mega-cap tech",
    moat: "N/A — passive vehicle",
    structuralThesis: "Foundational index ETF. Cheapest S&P 500 tracker (0.03% ER). Foundation of any portfolio. 30% tech concentration.",
    structuralInvalidation: "N/A",
    tacticalThesis: "Below SMA 200 first time in 18mo. Clean DCA opportunity.",
    tacticalInvalidation: "N/A",
    tacticalCompletion: "N/A",
    lastCall: null,
    score: 76, verdict: "DCA — steady pace", allocation: "Optional core",
    p1_priceTarget: { pass: true, val: "ETF", note: "N/A" },
    p2_salesGrowth: { pass: true, val: "Broad basket", note: "SPX" },
    p3_sma200: { pass: true, val: "-3.1%", note: "Below SMA 200" },
    p4_confCall: { pass: true, val: "N/A", note: "ETF" },
    p5_peRatio: { pass: true, val: "22 (medium)", note: "Market PE" },
    p6_supportResist: { pass: true, val: "N/A", note: "ETF" },
    p7_williams: { pass: true, val: "-52 rising", note: "Rising" },
    principlesPassed: 7,
  },
];



/* PART 2 — Helpers, Indicator Interpretation Engine, Shared Components */

const pct = (n) => n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
const money = (n) => n == null ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const big = (n) => n == null ? "—" : n >= 1000 ? `$${(n/1000).toFixed(1)}T` : `$${n}B`;
const smaGap = (price, sma) => sma ? ((price - sma) / sma) * 100 : null;
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date("2026-04-19");
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
};

const grade = (metric, value, ctx = {}) => {
  if (value == null) return { color: T.textFaint, label: "—", tooltip: "Not applicable" };
  switch (metric) {
    case "roic":
      if (value >= 25) return { color: T.green, label: "Exceptional", tooltip: "ROIC ≥25% indicates dominant moat and brilliant capital allocation." };
      if (value >= 15) return { color: T.green, label: "Good", tooltip: "ROIC 15-25% signals strong competitive advantage." };
      if (value >= 10) return { color: T.gold, label: "Acceptable", tooltip: "ROIC 10-15% acceptable but no clear moat." };
      if (value >= 5) return { color: T.orange, label: "Weak", tooltip: "ROIC 5-10% suggests poor capital efficiency." };
      return { color: T.red, label: "Poor", tooltip: "ROIC <5% destroys value with reinvestment." };
    case "operatingMargin":
      if (value >= 35) return { color: T.green, label: "Exceptional", tooltip: "Op margin ≥35% — software-grade pricing power." };
      if (value >= 20) return { color: T.green, label: "Good", tooltip: "Op margin 20-35% — strong pricing power." };
      if (value >= 10) return { color: T.gold, label: "Acceptable", tooltip: "Op margin 10-20% — typical for industrials." };
      return { color: T.orange, label: "Thin", tooltip: "Op margin <10% — limited cushion for shocks." };
    case "revGrowth":
      if (value >= 25) return { color: T.green, label: "Exceptional", tooltip: "Revenue growth ≥25% — top tier hyper-growth." };
      if (value >= 15) return { color: T.green, label: "Strong", tooltip: "Revenue growth 15-25% — strong compounder." };
      if (value >= 8) return { color: T.gold, label: "Steady", tooltip: "Revenue growth 8-15% — mature compounder, ideal for portfolio." };
      if (value >= 3) return { color: T.orange, label: "Slow", tooltip: "Revenue growth 3-8% — slow." };
      return { color: T.red, label: "Stagnant", tooltip: "Revenue growth <3% — stagnant." };
    case "epsGrowth":
      if (value >= 25) return { color: T.green, label: "Exceptional", tooltip: "EPS growth ≥25%." };
      if (value >= 15) return { color: T.green, label: "Strong", tooltip: "EPS growth 15-25%." };
      if (value >= 8) return { color: T.gold, label: "Acceptable", tooltip: "EPS growth 8-15%." };
      return { color: T.orange, label: "Weak", tooltip: "EPS growth <8%." };
    case "fcfYield":
      if (value >= 6) return { color: T.green, label: "Exceptional", tooltip: "FCF yield ≥6% — cash machine." };
      if (value >= 4) return { color: T.green, label: "Good", tooltip: "FCF yield 4-6%." };
      if (value >= 2) return { color: T.gold, label: "Acceptable", tooltip: "FCF yield 2-4% — typical for growth." };
      return { color: T.orange, label: "Expensive", tooltip: "FCF yield <2%." };
    case "debtEbitda":
      if (value <= 1) return { color: T.green, label: "Exceptional", tooltip: "Debt/EBITDA ≤1x — fortress balance sheet." };
      if (value <= 2) return { color: T.green, label: "Good", tooltip: "Debt/EBITDA 1-2x — healthy." };
      if (value <= 3) return { color: T.gold, label: "Acceptable", tooltip: "Debt/EBITDA 2-3x — manageable." };
      if (value <= 4) return { color: T.orange, label: "Concerning", tooltip: "Debt/EBITDA 3-4x — elevated." };
      return { color: T.red, label: "Red Flag", tooltip: "Debt/EBITDA >4x — risk of forced sale." };
    case "altmanZ":
      if (value >= 3) return { color: T.green, label: "Safe", tooltip: "Altman Z >3 — bankruptcy risk negligible." };
      if (value >= 1.8) return { color: T.gold, label: "Grey Zone", tooltip: "Altman Z 1.8-3 — moderate distress signals." };
      return { color: T.red, label: "Distress Risk", tooltip: "Altman Z <1.8 — elevated bankruptcy probability." };
    case "piotroskiF":
      if (value >= 8) return { color: T.green, label: "Exceptional", tooltip: "Piotroski F 8-9 — financially excellent." };
      if (value >= 6) return { color: T.green, label: "Good", tooltip: "Piotroski F 6-7 — financially healthy." };
      if (value >= 4) return { color: T.gold, label: "Neutral", tooltip: "Piotroski F 4-5 — mixed signals." };
      return { color: T.red, label: "Weak", tooltip: "Piotroski F <4 — multiple weaknesses." };
    case "peVsHist":
      if (value <= 0.7) return { color: T.green, label: "Exceptional Entry", tooltip: "Forward PE >30% below 5Y avg — historically rare." };
      if (value <= 0.85) return { color: T.green, label: "Good Entry", tooltip: "Forward PE 15-30% below 5Y avg — attractive." };
      if (value <= 1.05) return { color: T.gold, label: "Fair", tooltip: "Forward PE near 5Y avg." };
      if (value <= 1.2) return { color: T.orange, label: "Expensive", tooltip: "Forward PE 5-20% above 5Y avg." };
      return { color: T.red, label: "Overvalued", tooltip: "Forward PE >20% above 5Y avg." };
    case "peCategory":
      if (value < 20) return { color: T.green, label: "Conservative", tooltip: "PE <20 = Conservative. Per Abacus: 12-15% expected gain potential." };
      if (value <= 39) return { color: T.gold, label: "Medium-Industry Leader", tooltip: "PE 20-39 = Industry leaders sweet spot. Per Abacus: 22-35% expected gain." };
      return { color: T.red, label: "High Risk", tooltip: "PE 40+ = High growth/High risk per Abacus. Demands perfection." };
    case "peg":
      if (value <= 0.5) return { color: T.green, label: "Exceptional", tooltip: "PEG <0.5 — growth dramatically underpriced." };
      if (value <= 1) return { color: T.green, label: "Attractive", tooltip: "PEG <1 — Peter Lynch sweet spot." };
      if (value <= 1.5) return { color: T.gold, label: "Fair", tooltip: "PEG 1-1.5 — typical for quality." };
      if (value <= 2) return { color: T.orange, label: "Expensive", tooltip: "PEG 1.5-2." };
      return { color: T.red, label: "Bubble", tooltip: "PEG >2 — extreme." };
    case "rsi":
      if (value < 30) return { color: T.green, label: "Oversold", tooltip: "RSI <30 — historically associated with rebound." };
      if (value < 45) return { color: T.gold, label: "Neutral-Bear", tooltip: "RSI 30-45 — mild bearish momentum." };
      if (value <= 55) return { color: T.gold, label: "Neutral", tooltip: "RSI 45-55." };
      if (value <= 70) return { color: T.gold, label: "Neutral-Bull", tooltip: "RSI 55-70 — mild bullish momentum." };
      return { color: T.red, label: "Overbought", tooltip: "RSI >70 — overbought." };
    case "williams":
      if (value <= -80) return { color: T.green, label: "Oversold (Portfolio Entry)", tooltip: "Williams %R ≤-80. Per Abacus: ideal portfolio entry zone if other principles align." };
      if (value <= -60 && ctx.rising) return { color: T.green, label: "Momentum Building", tooltip: "Rising from oversold. Watch for cross above -40 for swing trigger." };
      if (value <= -40 && ctx.rising) return { color: T.green, label: "Swing Trigger", tooltip: "Williams %R rising through -40 — Abacus momentum entry signal for swing trades." };
      if (value <= -40) return { color: T.gold, label: "Neutral", tooltip: "Williams %R 40-60% range." };
      if (value <= -20) return { color: T.gold, label: "Neutral-Bull", tooltip: "Approaching overbought." };
      return { color: T.red, label: "Overbought", tooltip: "Williams %R >-20 — avoid entries." };
    case "smaGap200":
      if (value <= -15) return { color: T.green, label: "Deep Entry Zone", tooltip: "Price >15% below SMA 200 — exceptional entry per Abacus IF Principle II quality confirmed." };
      if (value <= -3) return { color: T.green, label: "Entry Zone", tooltip: "Price below SMA 200 — Abacus entry trigger." };
      if (value <= 3) return { color: T.gold, label: "At SMA 200", tooltip: "Price near SMA 200 — wait for clearer signal." };
      if (value <= 10) return { color: T.orange, label: "Above — Wait", tooltip: "Price above SMA 200 — not entry zone per Abacus." };
      return { color: T.red, label: "Extended", tooltip: "Price >10% above SMA 200 — extended." };
    case "vix":
      if (value < 15) return { color: T.green, label: "Complacent", tooltip: "VIX <15 — complacency, future returns historically muted." };
      if (value < 20) return { color: T.gold, label: "Normal", tooltip: "VIX 15-20 — normal volatility regime." };
      if (value < 30) return { color: T.orange, label: "Elevated", tooltip: "VIX 20-30 — elevated fear, often precedes good entries." };
      return { color: T.red, label: "Crisis", tooltip: "VIX >30 — fear zone. Historically best entry windows." };
    case "fearGreed":
      if (value < 25) return { color: T.green, label: "Extreme Fear", tooltip: "F&G <25 — historically marks better forward returns." };
      if (value < 45) return { color: T.gold, label: "Fear", tooltip: "F&G 25-45." };
      if (value < 55) return { color: T.gold, label: "Neutral", tooltip: "F&G 45-55." };
      if (value < 75) return { color: T.orange, label: "Greed", tooltip: "F&G 55-75 — be cautious." };
      return { color: T.red, label: "Extreme Greed", tooltip: "F&G >75 — trim risk historically appropriate." };
    case "rrRatio":
      if (value >= 4) return { color: T.green, label: "Exceptional", tooltip: "R:R ≥1:4 — exceptional setup." };
      if (value >= 3) return { color: T.green, label: "Good (Course Std.)", tooltip: "R:R ≥1:3 — meets Abacus portfolio rule." };
      if (value >= 2) return { color: T.gold, label: "Acceptable Swing", tooltip: "R:R ≥1:2 — minimum for swing per Abacus." };
      return { color: T.red, label: "Insufficient", tooltip: "R:R <1:2 — pass the trade." };
    case "upside":
      if (value >= 30) return { color: T.green, label: "Exceptional", tooltip: "Analyst upside ≥30%." };
      if (value >= 20) return { color: T.green, label: "Strong (Course Std.)", tooltip: "≥20% upside meets Abacus Principle I threshold." };
      if (value >= 10) return { color: T.gold, label: "Modest", tooltip: "10-20% upside — below course threshold." };
      return { color: T.red, label: "Limited", tooltip: "<10% upside — fails Principle I." };
    case "cashRunway":
      if (value >= 12) return { color: T.green, label: "Optimal", tooltip: "Cash runway ≥12 months — Abacus optimal." };
      if (value >= 6) return { color: T.gold, label: "Good", tooltip: "Cash runway 6-12 months — Abacus good." };
      return { color: T.red, label: "Concerning", tooltip: "Cash runway <6 months — financial stress risk." };
    case "lifecycle":
      if (value === "Mature") return { color: T.green, label: "Mature ★ Best", tooltip: "Mature phase — Abacus preferred. Most predictable, highest FCF." };
      if (value === "Growth-Leader") return { color: T.green, label: "Growth-Leader ★", tooltip: "Growth as sector leader — Abacus preferred." };
      if (value === "Growth-Follower") return { color: T.gold, label: "Growth-Follower", tooltip: "Growth but not leader — caution per Abacus." };
      if (value === "Growth-Cyclical") return { color: T.gold, label: "Growth-Cyclical", tooltip: "Cyclical growth — time entries." };
      if (value === "Shake-Out") return { color: T.gold, label: "Shake-Out", tooltip: "Shake-out — survivors emerge mature." };
      if (value === "Embryonic") return { color: T.red, label: "Embryonic", tooltip: "Too early — avoid for portfolio." };
      if (value === "Decline") return { color: T.red, label: "Decline ★ Avoid", tooltip: "Decline phase — Abacus says avoid." };
      return { color: T.textDim, label: value, tooltip: "" };
    default:
      return { color: T.text, label: value?.toString() || "—", tooltip: "" };
  }
};

const scoreColor = (s) => s >= 80 ? T.green : s >= 70 ? T.gold : s >= 60 ? T.orange : T.red;
const scoreLabel = (s) => s >= 85 ? "STRONG BUY" : s >= 75 ? "BUY" : s >= 65 ? "WATCH" : s >= 55 ? "HOLD" : "AVOID";

const ScoreBadge = ({ score, size = "md" }) => {
  const sz = size === "sm" ? { fs: 14, pad: "4px 8px" } : size === "lg" ? { fs: 22, pad: "8px 14px" } : { fs: 17, pad: "6px 11px" };
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4,
      background: `${scoreColor(score)}15`, border: `1px solid ${scoreColor(score)}40`,
      color: scoreColor(score), borderRadius: 6, padding: sz.pad, fontFamily: "'JetBrains Mono', monospace",
      fontSize: sz.fs, fontWeight: 700 }}>
      {score}<span style={{ fontSize: sz.fs - 5, opacity: 0.6 }}>/100</span>
    </div>
  );
};

const TierBadge = ({ tier }) => {
  const colors = {
    "T1": { bg: T.gold + "20", border: T.gold, text: T.goldBright, label: "T1 CORE" },
    "T2": { bg: T.blue + "20", border: T.blue, text: T.blue, label: "T2 ETF" },
    "T3": { bg: T.purple + "20", border: T.purple, text: T.purple, label: "T3 TACTICAL" },
  };
  const c = colors[tier] || colors.T3;
  return <span style={{ display: "inline-block", padding: "3px 8px", fontSize: 9, fontWeight: 700,
    letterSpacing: "0.08em", color: c.text, background: c.bg, border: `1px solid ${c.border}40`, borderRadius: 4 }}>{c.label}</span>;
};

const Stars = ({ count, max = 5, color = T.gold }) => (
  <div style={{ display: "inline-flex", gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{ color: i < count ? color : T.borderLight, fontSize: 11 }}>★</span>
    ))}
  </div>
);

const Pill = ({ children, color = T.textDim, bg }) => (
  <span style={{ display: "inline-block", padding: "3px 8px", fontSize: 10, fontWeight: 600,
    letterSpacing: "0.05em", textTransform: "uppercase", color, background: bg || `${color}15`,
    border: `1px solid ${color}35`, borderRadius: 4 }}>{children}</span>
);

const GradedIndicator = ({ label, value, metric, ctx, format = "raw", suffix = "" }) => {
  const g = grade(metric, value, ctx);
  const display = value == null ? "—" : format === "pct" ? pct(value) : format === "money" ? money(value) : `${value}${suffix}`;
  return (
    <div style={{ padding: "10px 12px", background: T.bgElev, borderRadius: 6,
      border: `1px solid ${g.color}25`, cursor: "help" }} title={g.tooltip}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontSize: 9, color: g.color, fontWeight: 700, letterSpacing: "0.05em" }}>{g.label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: g.color, fontFamily: "'JetBrains Mono', monospace" }}>{display}</div>
    </div>
  );
};

const StatRow = ({ label, value, color = T.text, mono = false, tooltip }) => (
  <div title={tooltip} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ color: T.textDim, fontSize: 11 }}>{label}</span>
    <span style={{ color, fontSize: 12, fontWeight: 600, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{value}</span>
  </div>
);

const SectionTitle = ({ icon: Icon, children, sub }) => (
  <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sub ? 4 : 0 }}>
      {Icon && <Icon size={18} color={T.gold} />}
      <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: T.text }}>{children}</h2>
    </div>
    {sub && <p style={{ margin: 0, fontSize: 12, color: T.textDim, fontWeight: 400 }}>{sub}</p>}
  </div>
);

const Card = ({ children, style = {}, onClick, hover, accent }) => (
  <div onClick={onClick} style={{ background: T.bgCard, border: `1px solid ${accent ? accent + "40" : T.border}`, borderRadius: 10,
    padding: 18, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", ...style }}
    onMouseEnter={(e) => hover && (e.currentTarget.style.borderColor = T.gold)}
    onMouseLeave={(e) => hover && (e.currentTarget.style.borderColor = accent ? accent + "40" : T.border)}>
    {children}
  </div>
);

const PrincipleCard = ({ num, title, principle }) => {
  const c = principle.pass ? T.green : T.red;
  return (
    <div style={{ padding: 12, background: T.bgElev, borderRadius: 8, border: `1px solid ${c}30` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>PRINCIPLE {num}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'Fraunces', serif" }}>{title}</div>
        </div>
        <span style={{ fontSize: 18, color: c }}>{principle.pass ? "✓" : "✗"}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
        {principle.val}
      </div>
      <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.5 }}>{principle.note}</div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "8px 12px", background: T.bgElev, border: `1px solid ${T.border}`,
  borderRadius: 6, color: T.text, fontSize: 14, outline: "none",
  fontFamily: "'JetBrains Mono', monospace"
};

const ThesisStatus = ({ status }) => {
  const colors = { "INTACT": T.green, "ACTIVE": T.green, "WATCH": T.gold, "BROKEN": T.red, "PENDING": T.blue };
  const c = colors[status] || T.textDim;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700,
      color: c, background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }}></span>
      {status}
    </span>
  );
};


/* PART 3 — Command Center, Macro, Sectors, Screener, Portfolio */

/* ================= COMMAND CENTER ================= */
function CommandCenter({ portfolio, watchlist, setTab, setSelectedStock, dcaPlan, capital }) {
  const topConviction = [...portfolio, ...watchlist].sort((a, b) => b.score - a.score).slice(0, 5);
  const imminentEarnings = UNIVERSE.filter(s => s.earnings).map(s => ({...s, days: daysUntil(s.earnings)})).filter(s => s.days >= 0 && s.days <= 14).sort((a, b) => a.days - b.days);
  const brokenTheses = portfolio.filter(s => s.tacticalThesis && s.score < 65);
  
  // Generate action items
  const actionItems = [];
  imminentEarnings.slice(0, 3).forEach(s => {
    actionItems.push({ icon: Calendar, color: T.gold, text: `${s.t} earnings in ${s.days}d (${s.earnings}) — review thesis` });
  });
  portfolio.filter(s => s.williamsRising && s.williams >= -50 && s.williams <= -35).forEach(s => {
    actionItems.push({ icon: Zap, color: T.green, text: `${s.t} Williams %R approaching -40 — momentum entry trigger` });
  });

  return (
    <div>
      <SectionTitle icon={Activity} sub={`Daily briefing · ${MACRO.asOf}`}>Command Center</SectionTitle>

      <div style={{ background: `linear-gradient(135deg, ${MACRO.regimeColor}15, transparent)`,
        border: `1px solid ${MACRO.regimeColor}50`, borderRadius: 10, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <AlertTriangle size={20} color={MACRO.regimeColor} />
          <div>
            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.1em" }}>MARKET REGIME</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: MACRO.regimeColor, fontFamily: "'Fraunces', serif" }}>{MACRO.regime}</div>
          </div>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: T.text }}>
          <strong>Pro action:</strong> {MACRO.action}
        </p>
      </div>

      {/* DCA Deployment Plan */}
      <Card style={{ marginBottom: 20, borderColor: T.gold + "40", background: `linear-gradient(135deg, ${T.gold}08, transparent)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <DollarSign size={18} color={T.gold} />
          <h3 style={{ margin: 0, fontSize: 15, fontFamily: "'Fraunces', serif", color: T.text }}>This Month's DCA Deployment</h3>
          <Pill color={T.gold}>April 2026</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>MONTHLY DCA</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>${dcaPlan.monthly}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>Regime: {MACRO.regimeShort}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>Deploy: {dcaPlan.deployPct}% = <span style={{ color: T.gold, fontWeight: 700 }}>${dcaPlan.deployAmount}</span></div>
            <div style={{ fontSize: 11, color: T.textDim }}>Reserve: ${dcaPlan.reserveAmount}</div>
          </div>
          <div>
            {dcaPlan.allocations.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < dcaPlan.allocations.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: a.color + "20", border: `1px solid ${a.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, fontSize: 11, fontWeight: 700 }}>{a.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: T.textDim }}>{a.reason}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>${a.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Macro Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "S&P 500", val: MACRO.spx.level, sub: `${pct(MACRO.spx.ytd)} YTD`, color: MACRO.spx.ytd >= 0 ? T.green : T.red },
          { label: "VIX", val: MACRO.vix.level, sub: MACRO.vix.label, color: MACRO.vix.color },
          { label: "Fear & Greed", val: MACRO.fearGreed.val, sub: MACRO.fearGreed.label, color: MACRO.fearGreed.color },
          { label: "Fed Funds", val: MACRO.fed.rate, sub: MACRO.fed.stance, color: T.gold },
          { label: "CPI", val: `${MACRO.inflation.cpi}%`, sub: "Sticky", color: T.orange },
          { label: "10Y Yield", val: `${MACRO.yields.ten}%`, sub: `2s10s ${MACRO.yields.spread}`, color: T.blue },
          { label: "Brent Oil", val: `$${MACRO.oil.brent}`, sub: "Iran tensions", color: T.orange },
          { label: "Recession Prob", val: `${MACRO.recession.prob}%`, sub: MACRO.recession.shift, color: T.red },
        ].map((m, i) => (
          <Card key={i} style={{ padding: 12 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.val}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Action Items + Top Conviction + Earnings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontFamily: "'Fraunces', serif", fontSize: 16, color: T.text }}>⚡ Action Items</h3>
          {actionItems.length === 0 ? <div style={{ color: T.textDim, fontSize: 12, padding: "20px 0" }}>No urgent actions today.</div> :
            actionItems.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <a.icon size={14} color={a.color} />
                <div style={{ fontSize: 12, color: T.text, flex: 1 }}>{a.text}</div>
              </div>
            ))}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 16, color: T.text }}>📅 Imminent Earnings</h3>
          </div>
          {imminentEarnings.slice(0, 5).map(s => (
            <div key={s.t} onClick={() => { setSelectedStock(s.t); setTab("conviction"); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer"
            }}>
              <div style={{ width: 36, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.days <= 3 ? T.red : s.days <= 7 ? T.orange : T.gold, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{s.days}</div>
                <div style={{ fontSize: 9, color: T.textFaint }}>days</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{s.earnings}</div>
              </div>
              <ScoreBadge score={s.score} size="sm" />
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 16, color: T.text }}>🏆 Top 5 Conviction</h3>
          <button onClick={() => setTab("screener")} style={{ background: "none", border: "none", color: T.gold, fontSize: 11, cursor: "pointer" }}>See full screener →</button>
        </div>
        {topConviction.map(s => (
          <div key={s.t} onClick={() => { setSelectedStock(s.t); setTab("conviction"); }} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer"
          }}>
            <ScoreBadge score={s.score} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
                <TierBadge tier={s.tier} />
              </div>
              <div style={{ fontSize: 11, color: T.textDim }}>{s.name} · {s.sector}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{money(s.price)}</div>
              <div style={{ fontSize: 10, color: scoreColor(s.score) }}>{s.verdict}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 16, color: T.text }}>🔄 Sector Rotation</h3>
          <button onClick={() => setTab("macro")} style={{ background: "none", border: "none", color: T.gold, fontSize: 11, cursor: "pointer" }}>Full view →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          {MACRO.rotation.map(r => (
            <div key={r.sec} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.bgElev, borderRadius: 6, border: `1px solid ${r.col}30` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.col }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{r.sec}</div>
                <div style={{ fontSize: 10, color: r.col, letterSpacing: "0.05em" }}>{r.sig}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.col, fontFamily: "'JetBrains Mono', monospace" }}>{r.ret}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Faith note footer */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 11, color: T.textFaint, fontStyle: "italic", fontFamily: "'Fraunces', serif", lineHeight: 1.6 }}>
          "Time will pass anyway. Work gives results — not when we want, but when we are prepared to sustain it."
          <br />
          <span style={{ fontSize: 10, opacity: 0.7 }}>— Mariana, 2026 Objective</span>
        </p>
      </div>
    </div>
  );
}

/* ================= MACRO ================= */
function Macro() {
  return (
    <div>
      <SectionTitle icon={Globe} sub={`Full macro environment read · ${MACRO.asOf}`}>Macro Dashboard</SectionTitle>

      <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${MACRO.regimeColor}12, transparent)`, borderColor: MACRO.regimeColor + "50" }}>
        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT REGIME</div>
        <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 22, color: MACRO.regimeColor, fontWeight: 500 }}>{MACRO.regime}</h2>
        <p style={{ marginTop: 10, marginBottom: 12, fontSize: 13, lineHeight: 1.6, color: T.text }}>{MACRO.action}</p>
        <div style={{ display: "flex", gap: 12, padding: 12, background: T.bgElev, borderRadius: 6, marginTop: 8 }}>
          <Compass size={16} color={T.gold} />
          <div style={{ fontSize: 12, color: T.text }}>
            <strong style={{ color: T.gold }}>Cash reserve target:</strong> {MACRO.regimeCash.min}–{MACRO.regimeCash.max}% of capital. Current regime favors holding dry powder for SPX retest of 6,300 or individual oversold extremes.
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Equity Markets</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <GradedIndicator label="VIX" value={MACRO.vix.level} metric="vix" />
            <GradedIndicator label="Fear & Greed" value={MACRO.fearGreed.val} metric="fearGreed" />
          </div>
          <div style={{ marginTop: 12 }}>
            <StatRow label="S&P 500 Level" value={MACRO.spx.level} mono />
            <StatRow label="YTD Return" value={pct(MACRO.spx.ytd)} mono color={MACRO.spx.ytd >= 0 ? T.green : T.red} />
            <StatRow label="SMA 50" value={MACRO.spx.sma50} mono />
            <StatRow label="SMA 200" value={MACRO.spx.sma200} mono />
            <StatRow label="% above 200DMA" value={`${MACRO.spx.pctAbove200}%`} mono />
            <StatRow label="AAII Bull/Bear" value={`${MACRO.aaii.bull}/${MACRO.aaii.bear}`} mono color={T.gold} />
            <StatRow label="NAAIM Exposure" value={MACRO.naaim.exposure} mono />
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Rates & Fed</h3>
          <StatRow label="Fed Funds" value={MACRO.fed.rate} mono color={T.gold} />
          <StatRow label="Fed Stance" value={MACRO.fed.stance} />
          <StatRow label="Next Meeting" value={MACRO.fed.nextMeet} />
          <StatRow label="2026 Cuts Priced" value={MACRO.fed.cuts2026} />
          <StatRow label="Dot Plot Median EOY" value={MACRO.fed.dotplot} />
          <StatRow label="10Y Treasury" value={`${MACRO.yields.ten}%`} mono />
          <StatRow label="2Y Treasury" value={`${MACRO.yields.two}%`} mono />
          <StatRow label="2s10s Spread" value={`${MACRO.yields.spread}%`} mono color={MACRO.yields.spread > 0 ? T.green : T.red} />
          <StatRow label="3M-10Y Spread" value={`${MACRO.yields.tenMinusThreeM}%`} mono color={T.orange} tooltip={MACRO.yields.interp} />
          <StatRow label="Yield Curve" value={MACRO.yields.shape} />
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Inflation & Growth</h3>
          <StatRow label="Headline CPI" value={`${MACRO.inflation.cpi}%`} mono color={T.orange} />
          <StatRow label="Core CPI" value={`${MACRO.inflation.core}%`} mono color={T.orange} />
          <StatRow label="Core PCE" value={`${MACRO.inflation.pce}%`} mono color={T.orange} />
          <StatRow label="10Y Breakevens" value={`${MACRO.inflation.breakevens}%`} mono />
          <StatRow label="Trend" value={MACRO.inflation.trend} color={T.red} />
          <StatRow label="S&P EPS 2026" value={`$${MACRO.earnings.spxEps2026}`} mono />
          <StatRow label="EPS Growth" value={`${MACRO.earnings.growth}%`} mono color={T.green} />
          <StatRow label="Recession Probability" value={`${MACRO.recession.prob}%`} mono color={T.red} />
          <StatRow label="Shift from Q1" value={MACRO.recession.shift} color={T.red} />
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Commodities & Credit</h3>
          <StatRow label="Brent Crude" value={`$${MACRO.oil.brent}`} mono color={T.orange} />
          <StatRow label="WTI Crude" value={`$${MACRO.oil.wti}`} mono color={T.orange} />
          <StatRow label="Oil Trend" value={MACRO.oil.trend} color={T.orange} />
          <StatRow label="Gold Spot" value={`$${MACRO.gold.spot}`} mono color={T.gold} />
          <StatRow label="Copper" value={`$${MACRO.copper.price}`} mono color={T.green} />
          <StatRow label="DXY (Dollar)" value={MACRO.dollar.dxy} mono />
          <StatRow label="Dollar Trend" value={MACRO.dollar.trend} />
          <StatRow label="HY-IG Spread" value={`${MACRO.creditSpread.hyIg}%`} mono color={T.gold} tooltip={MACRO.creditSpread.interp} />
        </Card>
      </div>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, color: T.gold, fontFamily: "'Fraunces', serif" }}>Sector Rotation — YTD with Themes</h3>
        {MACRO.rotation.map(r => {
          const bar = Math.abs(parseFloat(r.ret));
          return (
            <div key={r.sec} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{r.sec}</span>
                  <span style={{ fontSize: 10, color: T.textDim, marginLeft: 8 }}>· {r.theme}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Pill color={r.col}>{r.sig}</Pill>
                  <span style={{ fontSize: 12, color: r.col, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 48, textAlign: "right" }}>{r.ret}</span>
                </div>
              </div>
              <div style={{ height: 4, background: T.bgElev, borderRadius: 2, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", left: r.ret.startsWith("-") ? `calc(50% - ${bar * 1.2}%)` : "50%", width: `${bar * 1.2}%`, height: "100%", background: r.col, borderRadius: 2 }}></div>
                <div style={{ position: "absolute", left: "50%", width: 1, height: "100%", background: T.borderLight }}></div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ================= SCREENER ================= */
function Screener({ setSelectedStock, setTab }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("score");
  const [query, setQuery] = useState("");

  const filters = [
    { id: "all", label: "All", count: UNIVERSE.length },
    { id: "PORTFOLIO", label: "Portfolio", count: UNIVERSE.filter(s => s.cat === "PORTFOLIO").length },
    { id: "WATCHLIST", label: "Watchlist", count: UNIVERSE.filter(s => s.cat === "WATCHLIST").length },
    { id: "T1", label: "T1 Core", count: UNIVERSE.filter(s => s.tier === "T1").length },
    { id: "T2", label: "T2 ETF", count: UNIVERSE.filter(s => s.tier === "T2").length },
    { id: "T3", label: "T3 Tactical", count: UNIVERSE.filter(s => s.tier === "T3").length },
    { id: "belowSma", label: "Below SMA 200", count: UNIVERSE.filter(s => s.sma200 && s.price < s.sma200).length },
    { id: "highScore", label: "Score ≥80", count: UNIVERSE.filter(s => s.score >= 80).length },
    { id: "all7", label: "All 7 Principles", count: UNIVERSE.filter(s => s.principlesPassed === 7).length },
    { id: "etfs", label: "ETFs", count: UNIVERSE.filter(s => s.sector.includes("ETF")).length },
  ];

  const list = UNIVERSE
    .filter(s => {
      if (query && !s.t.toLowerCase().includes(query.toLowerCase()) && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "all") return true;
      if (filter === "belowSma") return s.sma200 && s.price < s.sma200;
      if (filter === "highScore") return s.score >= 80;
      if (filter === "all7") return s.principlesPassed === 7;
      if (filter === "etfs") return s.sector.includes("ETF");
      if (filter === "T1" || filter === "T2" || filter === "T3") return s.tier === filter;
      return s.cat === filter;
    })
    .sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "principles") return b.principlesPassed - a.principlesPassed;
      if (sort === "upside") return (b.upside || -99) - (a.upside || -99);
      if (sort === "ytd") return a.ytd - b.ytd;
      if (sort === "smaGap") return smaGap(a.price, a.sma200) - smaGap(b.price, b.sma200);
      if (sort === "williams") return a.williams - b.williams;
      return 0;
    });

  return (
    <div>
      <SectionTitle icon={Filter} sub={`7 Principles framework · ${UNIVERSE.length} names`}>Screener</SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <Search size={13} color={T.textDim} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ticker or name…" style={{
            width: "100%", padding: "8px 10px 8px 30px", background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 6, color: T.text, fontSize: 12, outline: "none", fontFamily: "'Inter', sans-serif"
          }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: "8px 10px", background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 6, color: T.text, fontSize: 12, cursor: "pointer", outline: "none"
        }}>
          <option value="score">Sort: Score ↓</option>
          <option value="principles">Sort: Principles passed ↓</option>
          <option value="upside">Sort: Upside ↓</option>
          <option value="ytd">Sort: YTD ↑</option>
          <option value="smaGap">Sort: SMA Gap ↑</option>
          <option value="williams">Sort: Williams %R ↑</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "6px 12px", background: filter === f.id ? `${T.gold}20` : T.bgCard,
            border: `1px solid ${filter === f.id ? T.gold : T.border}`,
            color: filter === f.id ? T.gold : T.textDim, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600
          }}>
            {f.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "55px 1.2fr 0.9fr 70px 0.7fr 0.7fr 0.8fr 0.7fr 1fr",
        gap: 10, padding: "8px 14px", fontSize: 9, color: T.textFaint, letterSpacing: "0.1em",
        borderBottom: `1px solid ${T.border}`, marginBottom: 6
      }}>
        <span>SCORE</span><span>TICKER</span><span>SECTOR</span><span>TIER</span><span>PRICE</span><span>YTD</span><span>vs SMA200</span><span>7P</span><span>VERDICT</span>
      </div>

      {list.map(s => {
        const gap = s.sma200 ? smaGap(s.price, s.sma200) : null;
        return (
          <div key={s.t} onClick={() => { setSelectedStock(s.t); setTab("conviction"); }} style={{
            display: "grid", gridTemplateColumns: "55px 1.2fr 0.9fr 70px 0.7fr 0.7fr 0.8fr 0.7fr 1fr",
            gap: 10, padding: "12px 14px", background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 8, marginBottom: 6, cursor: "pointer", transition: "all 0.15s", alignItems: "center"
          }} onMouseEnter={e => { e.currentTarget.style.background = T.bgCardHover; e.currentTarget.style.borderColor = scoreColor(s.score) + "60"; }}
             onMouseLeave={e => { e.currentTarget.style.background = T.bgCard; e.currentTarget.style.borderColor = T.border; }}>
            <ScoreBadge score={s.score} size="sm" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>{s.name}</div>
            </div>
            <div style={{ fontSize: 10, color: T.textDim }}>{s.sector}</div>
            <TierBadge tier={s.tier} />
            <div style={{ fontSize: 12, color: T.text, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{money(s.price)}</div>
            <div style={{ fontSize: 12, color: s.ytd >= 0 ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pct(s.ytd)}</div>
            <div>
              {gap != null ? (
                <span style={{ fontSize: 11, color: gap < 0 ? T.green : T.orange, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pct(gap)}</span>
              ) : <span style={{ color: T.textFaint, fontSize: 11 }}>—</span>}
            </div>
            <div style={{ fontSize: 11, color: s.principlesPassed === 7 ? T.green : s.principlesPassed >= 5 ? T.gold : T.red, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {s.principlesPassed}/7
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: scoreColor(s.score), letterSpacing: "0.02em" }}>{s.verdict}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= SECTORS ================= */
function Sectors({ setTab, setFilter }) {
  return (
    <div>
      <SectionTitle icon={Layers} sub="Theme identification & sector leadership">Sectors & Themes</SectionTitle>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Sector Performance & Rotation</h3>
        {MACRO.rotation.map(r => {
          // Get top 3 stocks in this sector
          const sectorStocks = UNIVERSE.filter(s => {
            if (r.sec.includes("Energy")) return s.sector.includes("Energy");
            if (r.sec.includes("Defense")) return s.sector.includes("Defense");
            if (r.sec.includes("Utilities") || r.sec.includes("Power")) return s.sector.includes("Nuclear") || s.sector.includes("Utilities");
            if (r.sec.includes("Materials")) return s.sector.includes("Materials");
            if (r.sec.includes("Financials")) return s.sector.includes("Financials");
            if (r.sec.includes("Healthcare")) return s.sector.includes("Healthcare");
            if (r.sec.includes("Mag7")) return ["NVDA","MSFT","META","AMZN","GOOGL","AAPL","TSLA"].includes(s.t);
            if (r.sec.includes("Semis")) return s.sector.includes("Semis");
            return false;
          }).sort((a, b) => b.score - a.score).slice(0, 3);
          
          return (
            <div key={r.sec} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{r.sec}</div>
                  <div style={{ fontSize: 10, color: T.textDim }}>{r.theme}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Pill color={r.col}>{r.sig}</Pill>
                  <span style={{ fontSize: 14, color: r.col, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{r.ret}</span>
                </div>
              </div>
              {sectorStocks.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sectorStocks.map(s => (
                    <span key={s.t} style={{ padding: "3px 8px", background: T.bgElev, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11 }}>
                      <span style={{ color: T.text, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</span>
                      <span style={{ color: scoreColor(s.score), marginLeft: 6, fontFamily: "'JetBrains Mono', monospace" }}>{s.score}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card style={{ background: T.gold + "08", borderColor: T.gold + "30" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>📈 Active Structural Themes</h3>
        {[
          { theme: "AI Infrastructure & Power", desc: "Data center electrification, nuclear baseload, transformer/turbine supply", names: ["CEG","VST","GEV","ETN","AVGO"] },
          { theme: "AI Custom Silicon", desc: "Hyperscaler-designed chips replacing merchant GPU at margin", names: ["AVGO","TSM","NVDA"] },
          { theme: "Defense (Geopolitical)", desc: "Iran tensions, Ukraine continuation, Pacific buildup", names: ["LMT","RTX","PLTR"] },
          { theme: "GLP-1 / Obesity TAM", desc: "Trillion-dollar TAM, 2-player race", names: ["LLY"] },
          { theme: "Copper Supply Deficit", desc: "Electrification + grid demand outstripping new mine supply", names: ["FCX"] },
          { theme: "Cybersecurity Consolidation", desc: "Platform consolidation, AI-native threat detection", names: ["PANW","CRWD"] },
        ].map(t => (
          <div key={t.theme} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>{t.theme}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {t.names.map(n => (
                  <span key={n} style={{ fontSize: 10, color: T.text, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", background: T.bgElev, borderRadius: 3 }}>{n}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.textDim }}>{t.desc}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}


/* PART 4 — Deep Dive (Conviction) Tab — heart of the system */

function Conviction({ selectedStock, setSelectedStock, setTab }) {
  const stock = UNIVERSE.find(s => s.t === selectedStock) || UNIVERSE[0];
  const gap = stock.sma200 ? smaGap(stock.price, stock.sma200) : null;
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptAnalysis, setTranscriptAnalysis] = useState(null);

  const askAI = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const prompt = `You are a senior portfolio manager advising on ${stock.name} (${stock.t}) as of April 19, 2026.

USER'S FRAMEWORK (Abacus Experience course):
- 7 Principles: Price Target, Sales Growth, SMA 200 (buy below), Conference Call, P/E Ratio (20-39 = leader sweet spot), Support/Resistance with R:R 1:3, Williams %R
- Mature + Growth-Leader phases preferred
- Williams %R: rising to -40 = swing entry, at -90 = portfolio entry

STOCK SNAPSHOT:
- Price: $${stock.price}, 52w range $${stock.low52}–$${stock.high52}
- SMA 50: $${stock.sma50}, SMA 200: $${stock.sma200}, EMA 50: $${stock.ema50}
- YTD: ${stock.ytd}%, vs SMA 200: ${gap?.toFixed(1)}%
- Williams %R: ${stock.williams} (rising: ${stock.williamsRising})
- Fwd PE: ${stock.fwdPE}, 5Y avg PE: ${stock.peHist5y}, 6M avg: ${stock.peHist6m}
- ROIC: ${stock.roic}%, Margin: ${stock.margin}%
- Revenue growth: ${stock.revGrowth}%, EPS growth: ${stock.epsGrowth}%
- Lifecycle: ${stock.lifecycle}
- Tier: ${stock.tier}
- Earnings: ${stock.earnings}
- Analyst target: $${stock.analystTarget} (${stock.upside}% upside)
- 7 Principles passed: ${stock.principlesPassed}/7
- Score: ${stock.score}/100, Verdict: ${stock.verdict}

THESIS:
- Structural: ${stock.structuralThesis}
- Tactical: ${stock.tacticalThesis}

Macro context: ${MACRO.regime}. VIX ${MACRO.vix.level}. Fed on hold. Recession prob ${MACRO.recession.prob}%.

User's question: ${aiNote || "Give me a 200-word institutional-grade analysis applying the 7 Principles framework. Cover: which principles pass/fail, entry timing using SMA 200 and Williams %R, position sizing consideration, key risk to monitor, what would change your view. Be direct, professional PM tone."}

Respond concisely, actionable.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").filter(Boolean).join("\n") || "No response";
      setAiResponse(text);
    } catch (err) {
      setAiResponse("Error reaching AI advisor.");
    }
    setAiLoading(false);
  };

  const analyzeTranscript = async () => {
    if (!transcriptInput.trim()) return;
    setTranscriptLoading(true);
    setTranscriptAnalysis(null);
    try {
      const prompt = `You are analyzing an earnings call transcript for ${stock.name} (${stock.t}).

TRANSCRIPT (or summary):
${transcriptInput}

User's framework: Abacus 7 Principles, focus on long-term holding quality. Wants to know:
- Does this company qualify for a long-term portfolio?
- Pros and cons from this call

Provide structured analysis in this exact format:

KEY HIGHLIGHTS (3-5 bullets):
[bullets]

🟢 BULL SIGNALS (what supports buying):
[bullets]

🔴 RED FLAGS (what concerns you):
[bullets]

🎭 TONE: [confident/cautious/defensive — 1 sentence]

🎯 VERDICT: ✓ QUALIFIES / ⚠ WATCH / ✗ NO
[1-2 sentence reasoning re: long-term portfolio fit]

Keep it concise — 250 words max.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").filter(Boolean).join("\n") || "No response";
      setTranscriptAnalysis(text);
    } catch (err) {
      setTranscriptAnalysis("Error analyzing transcript.");
    }
    setTranscriptLoading(false);
  };

  return (
    <div>
      <SectionTitle icon={Brain} sub={`Institutional analysis · ${stock.sector}`}>Deep Dive · {stock.t}</SectionTitle>

      {/* Stock Selector */}
      <div style={{ marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {UNIVERSE.map(s => (
          <button key={s.t} onClick={() => setSelectedStock(s.t)} style={{
            padding: "5px 10px", background: selectedStock === s.t ? `${T.gold}25` : T.bgCard,
            border: `1px solid ${selectedStock === s.t ? T.gold : T.border}`,
            color: selectedStock === s.t ? T.goldBright : T.textDim, borderRadius: 5, cursor: "pointer",
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600
          }}>
            {s.t}
          </button>
        ))}
      </div>

      {/* HERO */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <h1 style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: T.text }}>{stock.t}</h1>
              <span style={{ fontSize: 16, color: T.textDim, fontFamily: "'Fraunces', serif" }}>{stock.name}</span>
              <TierBadge tier={stock.tier} />
            </div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{stock.sector} · {stock.industry} · {big(stock.mcap)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <ScoreBadge score={stock.score} size="lg" />
            <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(stock.score), marginTop: 6, letterSpacing: "0.05em" }}>{stock.verdict}</div>
            <div style={{ fontSize: 10, color: T.gold, marginTop: 4, fontWeight: 700 }}>{stock.principlesPassed}/7 Principles ✓</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
          <div><div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>PRICE</div><div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{money(stock.price)}</div></div>
          <div><div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>YTD</div><div style={{ fontSize: 20, fontWeight: 700, color: stock.ytd >= 0 ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>{pct(stock.ytd)}</div></div>
          <div><div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>vs SMA 200</div><div style={{ fontSize: 20, fontWeight: 700, color: gap < 0 ? T.green : T.orange, fontFamily: "'JetBrains Mono', monospace" }}>{gap != null ? pct(gap) : "—"}</div></div>
          <div><div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>UPSIDE</div><div style={{ fontSize: 20, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{pct(stock.upside)}</div></div>
          <div>
            <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em" }}>EARNINGS</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{stock.earnings || "—"}</div>
            {stock.earnings && <div style={{ fontSize: 10, color: daysUntil(stock.earnings) <= 7 ? T.red : T.textDim, marginTop: 2 }}>in {daysUntil(stock.earnings)}d</div>}
          </div>
        </div>
      </Card>

      {/* WRITTEN THESIS ENGINE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ borderColor: T.green + "40", background: `linear-gradient(135deg, ${T.green}05, transparent)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: T.green, letterSpacing: "0.1em", fontWeight: 700 }}>▲ STRUCTURAL THESIS (T1 Long-term)</div>
            <ThesisStatus status="INTACT" />
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: T.text, fontFamily: "'Fraunces', serif" }}>
            {stock.structuralThesis}
          </p>
          <div style={{ marginTop: 12, padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.red, letterSpacing: "0.1em", marginBottom: 4 }}>BROKEN IF:</div>
            <div style={{ fontSize: 11, color: T.text, lineHeight: 1.5 }}>{stock.structuralInvalidation}</div>
          </div>
        </Card>

        <Card style={{ borderColor: T.purple + "40", background: `linear-gradient(135deg, ${T.purple}05, transparent)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: T.purple, letterSpacing: "0.1em", fontWeight: 700 }}>▲ TACTICAL THESIS (Tactical Overlay)</div>
            <ThesisStatus status="ACTIVE" />
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: T.text, fontFamily: "'Fraunces', serif" }}>
            {stock.tacticalThesis}
          </p>
          {stock.tacticalCompletion && stock.tacticalCompletion !== "N/A" && (
            <div style={{ marginTop: 12, padding: 10, background: T.bgElev, borderRadius: 6 }}>
              <div style={{ fontSize: 9, color: T.green, letterSpacing: "0.1em", marginBottom: 4 }}>COMPLETES ON:</div>
              <div style={{ fontSize: 11, color: T.text, lineHeight: 1.5, marginBottom: 8 }}>{stock.tacticalCompletion}</div>
              <div style={{ fontSize: 9, color: T.red, letterSpacing: "0.1em", marginBottom: 4 }}>INVALIDATES IF:</div>
              <div style={{ fontSize: 11, color: T.text, lineHeight: 1.5 }}>{stock.tacticalInvalidation}</div>
            </div>
          )}
        </Card>
      </div>

      {/* 7 PRINCIPLES MATRIX */}
      <Card style={{ marginBottom: 16, borderColor: T.gold + "30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Crown size={16} color={T.gold} />
          <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>The 7 Principles · Abacus Framework</h3>
          <Pill color={stock.principlesPassed === 7 ? T.green : T.gold}>{stock.principlesPassed}/7 PASSED</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <PrincipleCard num="I" title="Price Target" principle={stock.p1_priceTarget} />
          <PrincipleCard num="II" title="Sales Growth" principle={stock.p2_salesGrowth} />
          <PrincipleCard num="III" title="Ley de 200 días" principle={stock.p3_sma200} />
          <PrincipleCard num="IV" title="Conference Call" principle={stock.p4_confCall} />
          <PrincipleCard num="V" title="P/E Ratio" principle={stock.p5_peRatio} />
          <PrincipleCard num="VI" title="Support/Resist" principle={stock.p6_supportResist} />
          <PrincipleCard num="VII" title="Williams %R" principle={stock.p7_williams} />
        </div>
      </Card>

      {/* 8-STEP VALUATION CALCULATOR */}
      {stock.totalCash && (
        <Card style={{ marginBottom: 16, borderColor: T.blue + "30" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Anchor size={16} color={T.blue} />
            <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>8-Step Valuation · Principio V</h3>
            <Pill color={T.blue}>YOUR ABACUS METHOD</Pill>
          </div>

          {/* Compute valuation */}
          {(() => {
            const projectedNI = stock.revGrowth ? (stock.mcap * 0.07 * (stock.netMargin || stock.margin) / 100) : null;
            // Simplified projection: estimate forward sales using current PE & growth
            const projectedSales = stock.mcap / stock.psRatio * (1 + stock.revGrowth / 100);
            const projectedNetIncome = projectedSales * (stock.netMargin || stock.margin) / 100;
            const projectedMcap = projectedNetIncome * stock.peHist6m;
            const possibleReturn = ((projectedMcap / stock.mcap) - 1) * 100;
            
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STEP 1 · P/E RATIO</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.fwdPE}</div>
                  <div style={{ fontSize: 10, color: grade("peCategory", stock.fwdPE).color, fontWeight: 700, marginTop: 2 }}>
                    {grade("peCategory", stock.fwdPE).label}
                  </div>
                </div>

                <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STEP 2 · CASH RUNWAY</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.cashRunway?.toFixed(1)} mo</div>
                  <div style={{ fontSize: 10, color: grade("cashRunway", stock.cashRunway).color, fontWeight: 700, marginTop: 2 }}>
                    {grade("cashRunway", stock.cashRunway).label}
                  </div>
                  <div style={{ fontSize: 9, color: T.textDim, marginTop: 4 }}>${stock.totalCash}B / (${stock.opEx}B / 12) </div>
                  <div style={{ fontSize: 9, color: T.textDim }}>Debt/Capital: {stock.debtToCapital}% (avg {stock.industryDebtAvg}%)</div>
                </div>

                <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STEP 3 · SALES EST 2026</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>${projectedSales.toFixed(1)}B</div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>Growth: {pct(stock.revGrowth)}</div>
                </div>

                <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STEP 4 · PROFIT MARGIN AVG</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.netMargin || stock.margin}%</div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>Net margin (proxy 4Y avg)</div>
                </div>

                <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STEP 5 · PE 6M AVG</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.peHist6m}</div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>5Y avg: {stock.peHist5y || "—"}</div>
                </div>

                <div style={{ padding: 12, background: `${T.gold}08`, borderRadius: 6, border: `1px solid ${T.gold}40` }}>
                  <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.1em" }}>STEP 6 · NET INCOME PROJ</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>${projectedNetIncome.toFixed(1)}B</div>
                  <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>Sales × Margin</div>
                </div>

                <div style={{ padding: 12, background: `${T.gold}08`, borderRadius: 6, border: `1px solid ${T.gold}40` }}>
                  <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.1em" }}>STEP 7 · MCAP FUTURO</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>${projectedMcap.toFixed(0)}B</div>
                  <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>NI × Avg PE 6M</div>
                </div>

                <div style={{ padding: 12, background: `${T.green}08`, borderRadius: 6, border: `1px solid ${T.green}40` }}>
                  <div style={{ fontSize: 9, color: T.green, letterSpacing: "0.1em" }}>STEP 8 · POSSIBLE RETURN</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>{pct(possibleReturn)}</div>
                  <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>(MC Futuro / MC Presente) − 1</div>
                </div>
              </div>
            );
          })()}

          <div style={{ marginTop: 12, padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 10, color: T.textDim, lineHeight: 1.5 }}>
            <strong style={{ color: T.gold }}>Data sources per Abacus:</strong> Total Cash & Profit Margin → Yahoo Finance/Statistics. 
            Operating Expenses → Wallmine. Debt to Capital → CNBC Profile. Revenue Estimate → Yahoo Finance/Analysis. 
            P/E 6M Avg → YCharts.
          </div>
        </Card>
      )}

      {/* INSTITUTIONAL FUNDAMENTALS */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <BarChart3 size={16} color={T.gold} />
          <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>Institutional Fundamentals</h3>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>QUALITY & MOAT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <GradedIndicator label="ROIC" value={stock.roic} metric="roic" suffix="%" />
            <GradedIndicator label="Op Margin" value={stock.margin} metric="operatingMargin" suffix="%" />
            <GradedIndicator label="Net Margin" value={stock.netMargin} metric="operatingMargin" suffix="%" />
            <GradedIndicator label="FCF Yield" value={stock.fcfYield} metric="fcfYield" suffix="%" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>GROWTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <GradedIndicator label="Revenue Growth" value={stock.revGrowth} metric="revGrowth" suffix="%" />
            <GradedIndicator label="EPS Growth" value={stock.epsGrowth} metric="epsGrowth" suffix="%" />
            <GradedIndicator label="Revenue 3Y CAGR" value={stock.revGrowth3y} metric="revGrowth" suffix="%" />
            <GradedIndicator label="Lifecycle Phase" value={stock.lifecycle} metric="lifecycle" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>SAFETY</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <GradedIndicator label="Debt / EBITDA" value={stock.debtEbitda} metric="debtEbitda" suffix="x" />
            <GradedIndicator label="Altman Z-Score" value={stock.altmanZ} metric="altmanZ" />
            <GradedIndicator label="Piotroski F" value={stock.piotroskiF} metric="piotroskiF" suffix="/9" />
            <GradedIndicator label="Cash Runway" value={stock.cashRunway} metric="cashRunway" suffix="mo" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>VALUATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <GradedIndicator label="Forward PE" value={stock.fwdPE} metric="peCategory" />
            <GradedIndicator label="PE vs 5Y Avg" value={stock.peHist5y ? stock.fwdPE / stock.peHist5y : null} metric="peVsHist" format="raw" />
            <GradedIndicator label="PEG Ratio" value={stock.peg} metric="peg" />
            <GradedIndicator label="Analyst Upside" value={stock.upside} metric="upside" suffix="%" />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>CAPITAL ALLOCATION & OWNERSHIP</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: T.textDim }}>Shareholder Yield</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{stock.shareholderYield != null ? `${stock.shareholderYield}%` : "—"}</div>
              <div style={{ fontSize: 9, color: T.textFaint, marginTop: 2 }}>Buyback {stock.buybackYield}% + Div {stock.divYield}%</div>
            </div>
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: T.textDim }}>Share Count 5Y</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: stock.shareCount5y?.startsWith("-") ? T.green : T.orange, fontFamily: "'JetBrains Mono', monospace" }}>{stock.shareCount5y || "—"}</div>
            </div>
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: T.textDim }}>Insider Ownership</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.insiderOwn != null ? `${stock.insiderOwn}%` : "—"}</div>
              <div style={{ fontSize: 9, color: T.textFaint, marginTop: 2 }}>{stock.insiderTrend || "—"}</div>
            </div>
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: T.textDim }}>Institutional Own</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.instOwn != null ? `${stock.instOwn}%` : "—"}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* CONFERENCE CALL ANALYZER (Principio IV) */}
      {stock.lastCall && (
        <Card style={{ marginBottom: 16, borderColor: T.cyan + "40" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <FileText size={16} color={T.cyan} />
            <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>📞 Conference Call Analysis · Principio IV</h3>
            <Pill color={T.cyan}>{stock.lastCall.date}</Pill>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.green}30` }}>
              <div style={{ fontSize: 10, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>🟢 BULL SIGNALS</div>
              {stock.lastCall.bullSignals.map((sig, i) => (
                <div key={i} style={{ fontSize: 11, color: T.text, lineHeight: 1.6, marginBottom: 4 }}>• {sig}</div>
              ))}
            </div>
            <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.red}30` }}>
              <div style={{ fontSize: 10, color: T.red, letterSpacing: "0.1em", marginBottom: 8 }}>🔴 RED FLAGS</div>
              {stock.lastCall.redFlags.map((flag, i) => (
                <div key={i} style={{ fontSize: 11, color: T.text, lineHeight: 1.6, marginBottom: 4 }}>• {flag}</div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 5 }}>
              <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>🎭 TONE</div>
              <div style={{ fontSize: 11, color: T.text, marginTop: 4 }}>{stock.lastCall.tone}</div>
            </div>
            <div style={{ padding: 10, background: `${T.gold}10`, borderRadius: 5, border: `1px solid ${T.gold}30` }}>
              <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.1em" }}>🎯 VERDICT</div>
              <div style={{ fontSize: 11, color: T.text, marginTop: 4, fontWeight: 600 }}>{stock.lastCall.verdict}</div>
            </div>
          </div>

          {/* On-demand transcript analyzer */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8 }}>
              📋 Analyze a new transcript: paste from <a href="https://www.alphaspread.com" target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>alphaspread.com</a> Investor Relations
            </div>
            <textarea value={transcriptInput} onChange={e => setTranscriptInput(e.target.value)}
              placeholder="Paste transcript or summary here..."
              style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "'Inter', sans-serif", fontSize: 11 }} />
            <button onClick={analyzeTranscript} disabled={transcriptLoading || !transcriptInput.trim()} style={{
              marginTop: 8, padding: "6px 12px", background: T.cyan + "25", border: `1px solid ${T.cyan}`,
              color: T.cyan, borderRadius: 5, cursor: transcriptLoading ? "wait" : "pointer", fontSize: 11, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6, opacity: !transcriptInput.trim() ? 0.5 : 1
            }}>
              {transcriptLoading ? <RefreshCw size={11} className="spin" /> : <Sparkles size={11} />}
              {transcriptLoading ? "Analyzing…" : "Analyze with AI"}
            </button>
            {transcriptAnalysis && (
              <div style={{ marginTop: 10, padding: 12, background: T.bgElev, borderRadius: 5, border: `1px solid ${T.cyan}30` }}>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{transcriptAnalysis}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* NEWS & EARNINGS HISTORY */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>📰 Latest Activity</h3>
          {stock.lastRevision && (
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>{stock.lastRevision.date} · {stock.lastRevision.firm}</div>
              <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>{stock.lastRevision.action}</div>
            </div>
          )}
          {stock.smartMoney13F && (
            <div style={{ padding: 10, background: T.bgElev, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: T.purple, letterSpacing: "0.1em" }}>13F SMART MONEY</div>
              <div style={{ fontSize: 11, color: T.text, marginTop: 4 }}>{stock.smartMoney13F.funds}/20 funds tracked · {stock.smartMoney13F.trend}</div>
              <div style={{ fontSize: 10, color: T.gold, marginTop: 2 }}>{stock.smartMoney13F.highlight}</div>
            </div>
          )}
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 5 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 6 }}>RECENT EARNINGS REACTIONS</div>
            {stock.earningsReaction.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span style={{ fontSize: 11, color: T.textDim }}>{e.q}</span>
                <span style={{ fontSize: 11, color: e.move?.startsWith("+") ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{e.move || "—"}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>🎯 Catalysts & Risks</h3>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 5, marginBottom: 8, border: `1px solid ${T.green}30` }}>
            <div style={{ fontSize: 9, color: T.green, letterSpacing: "0.1em" }}>▲ CATALYSTS</div>
            <p style={{ margin: "6px 0 0", fontSize: 11, lineHeight: 1.6, color: T.text }}>{stock.catalysts}</p>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 5, marginBottom: 8, border: `1px solid ${T.red}30` }}>
            <div style={{ fontSize: 9, color: T.red, letterSpacing: "0.1em" }}>▼ RISKS</div>
            <p style={{ margin: "6px 0 0", fontSize: 11, lineHeight: 1.6, color: T.text }}>{stock.risks}</p>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 5 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>💎 ECONOMIC MOAT</div>
            <p style={{ margin: "6px 0 0", fontSize: 11, lineHeight: 1.6, color: T.text }}>{stock.moat}</p>
          </div>
        </Card>
      </div>

      {/* AI SYNTHESIS */}
      <Card style={{ borderColor: T.purple + "40", background: `linear-gradient(135deg, ${T.purple}08, transparent)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color={T.purple} />
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 15, color: T.text }}>AI Portfolio Manager — Ask about {stock.t}</h3>
        </div>
        <textarea value={aiNote} onChange={e => setAiNote(e.target.value)} placeholder={`Ask anything about ${stock.t}. (Empty = institutional analysis applying your 7 Principles framework.)`} style={{
          ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "'Inter', sans-serif"
        }} />
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={askAI} disabled={aiLoading} style={{
            padding: "8px 16px", background: T.purple + "25", border: `1px solid ${T.purple}`,
            color: T.purple, borderRadius: 6, cursor: aiLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 6
          }}>
            {aiLoading ? <RefreshCw size={12} className="spin" /> : <Send size={12} />}
            {aiLoading ? "Analyzing…" : "Get PM analysis"}
          </button>
          <button onClick={() => { setSelectedStock(stock.t); setTab("technicals"); }} style={{
            padding: "8px 14px", background: T.bgElev, border: `1px solid ${T.gold}`,
            color: T.gold, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
          }}>→ Technicals</button>
          <button onClick={() => { setSelectedStock(stock.t); setTab("kelly"); }} style={{
            padding: "8px 14px", background: T.bgElev, border: `1px solid ${T.gold}`,
            color: T.gold, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
          }}>→ Position Sizing</button>
        </div>
        {aiResponse && (
          <div style={{ marginTop: 14, padding: 14, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.purple}30` }}>
            <div style={{ fontSize: 10, color: T.purple, letterSpacing: "0.1em", marginBottom: 6 }}>AI ANALYSIS</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{aiResponse}</p>
          </div>
        )}
      </Card>
    </div>
  );
}


/* PART 5 — Technicals, Kelly, Portfolio, Weekly Review */

/* ================= TECHNICALS ================= */
function Technicals({ selectedStock, setSelectedStock }) {
  const stock = UNIVERSE.find(s => s.t === selectedStock) || UNIVERSE[0];
  const gap = stock.sma200 ? smaGap(stock.price, stock.sma200) : null;

  // Auto-suggested entry plan
  const inGoldenZone = stock.fibGoldenLow && stock.price >= stock.fibGoldenLow && stock.price <= stock.fibGoldenHigh;
  const suggestedEntry = inGoldenZone ? stock.price : stock.fibGoldenLow;
  const suggestedStop = stock.atr ? Math.max(stock.fibLow * 0.98, suggestedEntry - (stock.atr * 2.5)) : stock.fibLow;
  const suggestedTarget = stock.analystTarget || stock.fibHigh;
  const rrRatio = (suggestedTarget - suggestedEntry) / (suggestedEntry - suggestedStop);

  // 5-step entry checklist evaluation
  const checklist = [
    { num: 1, title: "Bearish structure (penultimate LL)", done: stock.price < stock.sma200 || stock.price < stock.sma50, note: stock.price < stock.sma200 ? "Price below SMA 200 confirms bearish structure" : "Watch for bearish structure" },
    { num: 2, title: "Structure change (HH/HL forming)", done: stock.williamsRising && stock.macd?.hist > -2, note: stock.williamsRising ? "Williams rising suggests momentum shift building" : "Wait for confirmation" },
    { num: 3, title: "Price in Fibonacci Golden Zone (61.8-78.6%)", done: inGoldenZone, note: inGoldenZone ? `In zone $${stock.fibGoldenLow?.toFixed(0)}-$${stock.fibGoldenHigh?.toFixed(0)}` : `Wait for $${stock.fibGoldenLow?.toFixed(0)}-$${stock.fibGoldenHigh?.toFixed(0)}` },
    { num: 4, title: "R:R ≥ 1:3 (portfolio)", done: rrRatio >= 3, note: `Current R:R 1:${rrRatio.toFixed(1)}` },
    { num: 5, title: "EMA 50 break+retest, Williams %R rising thru -40", done: stock.williamsRising && stock.williams >= -45 && stock.williams <= -35, note: stock.williams <= -40 && stock.williamsRising ? "Williams approaching trigger" : "Wait for Williams %R momentum trigger" },
  ];
  const checklistDone = checklist.filter(c => c.done).length;

  // TradeStation order ticket
  const orderTicket = `TRADESTATION ORDER TICKET
─────────────────────────
Symbol: ${stock.t}
Order: BUY LIMIT
Price: $${suggestedEntry.toFixed(2)}
Duration: GTC

After entry, set:
Stop-Limit: $${suggestedStop.toFixed(2)}
Take-Profit: $${suggestedTarget.toFixed(2)}

R:R = 1:${rrRatio.toFixed(2)}`;

  const copyOrder = () => {
    navigator.clipboard?.writeText(orderTicket);
    alert("Order ticket copied to clipboard");
  };

  return (
    <div>
      <SectionTitle icon={LineChartIcon} sub="Multi-timeframe + Fib + Williams %R + liquidity layer">Technicals · {stock.t}</SectionTitle>

      <div style={{ marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {UNIVERSE.filter(s => !s.sector.includes("ETF")).map(s => (
          <button key={s.t} onClick={() => setSelectedStock(s.t)} style={{
            padding: "5px 10px", background: selectedStock === s.t ? `${T.gold}25` : T.bgCard,
            border: `1px solid ${selectedStock === s.t ? T.gold : T.border}`,
            color: selectedStock === s.t ? T.goldBright : T.textDim, borderRadius: 5, cursor: "pointer",
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600
          }}>
            {s.t}
          </button>
        ))}
      </div>

      {/* Multi-timeframe trend */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Multi-Timeframe Trend</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <GradedIndicator label="Price vs SMA 200" value={gap} metric="smaGap200" format="pct" />
          <GradedIndicator label="Williams %R" value={stock.williams} metric="williams" ctx={{ rising: stock.williamsRising }} />
          <GradedIndicator label="RSI (14)" value={stock.rsi} metric="rsi" />
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6, border: `1px solid ${stock.goldenCross ? T.green : stock.deathCross ? T.red : T.border}40` }}>
            <div style={{ fontSize: 10, color: T.textDim }}>Golden/Death Cross</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: stock.goldenCross ? T.green : stock.deathCross ? T.red : T.gold, marginTop: 2 }}>{stock.goldenDeathStatus}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.1em", marginBottom: 6 }}>MOVING AVERAGES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "SMA 50", val: stock.sma50, gap: smaGap(stock.price, stock.sma50) },
              { label: "SMA 200", val: stock.sma200, gap: smaGap(stock.price, stock.sma200) },
              { label: "EMA 50", val: stock.ema50, gap: smaGap(stock.price, stock.ema50) },
              { label: "Price", val: stock.price, gap: 0 },
            ].map((m, i) => (
              <div key={i} style={{ padding: 8, background: T.bgElev, borderRadius: 5 }}>
                <div style={{ fontSize: 9, color: T.textFaint }}>{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{money(m.val)}</div>
                {m.gap !== 0 && <div style={{ fontSize: 10, color: m.gap < 0 ? T.green : T.orange, fontFamily: "'JetBrains Mono', monospace" }}>{pct(m.gap)}</div>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Fibonacci Golden Zone */}
      <Card style={{ marginBottom: 16, borderColor: T.gold + "40" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>📐 Fibonacci Golden Zone (Abacus 61.8% - 78.6%)</h3>
        <div style={{ marginBottom: 12, fontSize: 11, color: T.textDim }}>
          Auto-detected from swing high <strong style={{ color: T.text }}>${stock.fibHigh}</strong> to swing low <strong style={{ color: T.text }}>${stock.fibLow}</strong>
        </div>

        <div style={{ position: "relative", height: 60, background: T.bgElev, borderRadius: 6, marginBottom: 12, overflow: "hidden" }}>
          {/* Golden zone band */}
          <div style={{ position: "absolute", top: 0, bottom: 0,
            left: `${((stock.fibGoldenLow - stock.fibLow) / (stock.fibHigh - stock.fibLow)) * 100}%`,
            width: `${((stock.fibGoldenHigh - stock.fibGoldenLow) / (stock.fibHigh - stock.fibLow)) * 100}%`,
            background: T.gold + "30", border: `1px solid ${T.gold}` }} />
          {/* Current price marker */}
          <div style={{ position: "absolute", top: -3, bottom: -3,
            left: `calc(${((stock.price - stock.fibLow) / (stock.fibHigh - stock.fibLow)) * 100}% - 1px)`,
            width: 2, background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} />
          {/* Labels */}
          <div style={{ position: "absolute", left: 8, top: 8, fontSize: 9, color: T.textDim }}>${stock.fibLow}</div>
          <div style={{ position: "absolute", right: 8, top: 8, fontSize: 9, color: T.textDim }}>${stock.fibHigh}</div>
          <div style={{ position: "absolute", left: "50%", bottom: 4, transform: "translateX(-50%)", fontSize: 10, color: T.gold, fontWeight: 700 }}>GOLDEN ZONE</div>
          <div style={{ position: "absolute", left: `${((stock.price - stock.fibLow) / (stock.fibHigh - stock.fibLow)) * 100}%`, bottom: 4, transform: "translateX(-50%)", fontSize: 10, color: T.cyan, fontWeight: 700 }}>${stock.price}</div>
        </div>

        <div style={{ padding: 12, background: inGoldenZone ? `${T.green}15` : T.bgElev, borderRadius: 6, border: `1px solid ${inGoldenZone ? T.green : T.border}` }}>
          <div style={{ fontSize: 11, color: inGoldenZone ? T.green : T.textDim, fontWeight: 600 }}>
            {inGoldenZone 
              ? `✓ Price IN Golden Zone ($${stock.fibGoldenLow?.toFixed(0)} – $${stock.fibGoldenHigh?.toFixed(0)}) — Abacus entry zone confirmed`
              : `Wait for price to reach Golden Zone ($${stock.fibGoldenLow?.toFixed(0)} – $${stock.fibGoldenHigh?.toFixed(0)})`}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 6 }}>
          {[
            { level: 0, val: stock.fibLow },
            { level: 23.6, val: stock.fibLow + (stock.fibHigh - stock.fibLow) * 0.236 },
            { level: 38.2, val: stock.fibLow + (stock.fibHigh - stock.fibLow) * 0.382 },
            { level: 50, val: stock.fibLow + (stock.fibHigh - stock.fibLow) * 0.5 },
            { level: 61.8, val: stock.fibGoldenLow, golden: true },
            { level: 78.6, val: stock.fibGoldenHigh, golden: true },
            { level: 100, val: stock.fibHigh },
          ].map(f => (
            <div key={f.level} style={{ padding: 6, background: f.golden ? `${T.gold}15` : T.bgElev, borderRadius: 4, border: `1px solid ${f.golden ? T.gold + "50" : T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: f.golden ? T.gold : T.textFaint, fontWeight: 700 }}>{f.level}%</div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>${f.val?.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Liquidity Layer (Anchored VWAP, OBV, CMF) */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>💧 Liquidity & Institutional Demand Zones</h3>
        <div style={{ marginBottom: 10, fontSize: 11, color: T.textDim }}>
          Quantitative version of "lower lows = institutional buying" — what professional traders use beyond chart watching.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>VWAP Daily</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: stock.price > stock.vwap?.daily ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>${stock.vwap?.daily}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>VWAP Weekly</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>${stock.vwap?.weekly}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>VWAP Monthly</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>${stock.vwap?.monthly}</div>
          </div>
          <div style={{ padding: 10, background: `${T.purple}15`, borderRadius: 6, border: `1px solid ${T.purple}40` }} title="Institutional reference price since last earnings">
            <div style={{ fontSize: 10, color: T.purple }}>⚓ VWAP from Last Earnings</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.purple, fontFamily: "'JetBrains Mono', monospace" }}>${stock.vwap?.anchoredEarnings}</div>
            <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>Inst avg cost basis</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>OBV Trend</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: stock.obvTrend?.includes("Up") ? T.green : stock.obvTrend?.includes("Down") ? T.red : T.gold }}>{stock.obvTrend}</div>
            <div style={{ fontSize: 9, color: T.textFaint, marginTop: 4 }}>Cumulative volume direction</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>Chaikin Money Flow</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: stock.cmf > 0.05 ? T.green : stock.cmf < -0.05 ? T.red : T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{stock.cmf > 0 ? "+" : ""}{stock.cmf?.toFixed(2)}</div>
            <div style={{ fontSize: 9, color: T.textFaint, marginTop: 4 }}>{stock.cmf > 0 ? "Accumulation" : "Distribution"}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>RS vs SPY</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: stock.rsVsSpy > 0 ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>{stock.rsVsSpy > 0 ? "+" : ""}{stock.rsVsSpy}%</div>
            <div style={{ fontSize: 9, color: T.textFaint, marginTop: 4 }}>Outperformance vs market</div>
          </div>
        </div>
      </Card>

      {/* MOMENTUM SUITE */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Momentum & Volatility</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>MACD</div>
            <div style={{ fontSize: 12, color: stock.macd?.cross?.includes("Bullish") ? T.green : T.red, fontWeight: 600 }}>{stock.macd?.cross}</div>
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>Hist: {stock.macd?.hist > 0 ? "+" : ""}{stock.macd?.hist}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>Stochastic</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: stock.stoch < 20 ? T.green : stock.stoch > 80 ? T.red : T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{stock.stoch}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>ATR (volatility)</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>${stock.atr}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: T.textDim }}>Beta</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{stock.beta}</div>
          </div>
        </div>
      </Card>

      {/* 5-STEP ENTRY CHECKLIST */}
      <Card style={{ marginBottom: 16, borderColor: T.gold + "40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <CheckCircle2 size={16} color={T.gold} />
          <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>5-Step Entry Checklist · Abacus</h3>
          <Pill color={checklistDone === 5 ? T.green : T.gold}>{checklistDone}/5 GREEN</Pill>
        </div>
        {checklist.map(c => (
          <div key={c.num} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.done ? `${T.green}25` : T.bgElev, border: `1px solid ${c.done ? T.green : T.border}`, color: c.done ? T.green : T.textDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {c.done ? "✓" : c.num}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.title}</div>
              <div style={{ fontSize: 10, color: c.done ? T.green : T.textDim, marginTop: 2 }}>{c.note}</div>
            </div>
          </div>
        ))}
        {checklistDone === 5 && (
          <div style={{ marginTop: 12, padding: 12, background: `${T.green}15`, borderRadius: 6, border: `1px solid ${T.green}50`, fontSize: 12, color: T.green, fontWeight: 700 }}>
            ✓ ALL 5 STEPS GREEN — Ready to size and enter via Kelly tab
          </div>
        )}
      </Card>

      {/* AUTO-SUGGESTED TRADE PLAN */}
      <Card style={{ marginBottom: 16, borderColor: T.green + "40", background: `linear-gradient(135deg, ${T.green}05, transparent)` }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.green, fontFamily: "'Fraunces', serif" }}>📋 Auto-Suggested Trade Plan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>ENTRY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>${suggestedEntry?.toFixed(2)}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>STOP</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.red, fontFamily: "'JetBrains Mono', monospace" }}>${suggestedStop?.toFixed(2)}</div>
          </div>
          <div style={{ padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>TARGET</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>${suggestedTarget?.toFixed(2)}</div>
          </div>
          <GradedIndicator label="R:R Ratio" value={rrRatio} metric="rrRatio" suffix="" />
        </div>

        <div style={{ padding: 12, background: T.bgElev, borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.text, whiteSpace: "pre-wrap", marginBottom: 8 }}>
          {orderTicket}
        </div>
        <button onClick={copyOrder} style={{
          padding: "8px 14px", background: T.gold + "25", border: `1px solid ${T.gold}`,
          color: T.gold, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 6
        }}>
          <Copy size={12} /> Copy TradeStation Order Ticket
        </button>
      </Card>
    </div>
  );
}

/* ================= KELLY & SIZING ================= */
function Kelly({ selectedStock, setSelectedStock, capital, setCapital }) {
  const stock = UNIVERSE.find(s => s.t === selectedStock) || UNIVERSE[0];
  
  // Auto-derive win probability from score
  const autoWinProb = stock.score >= 85 ? 70 : stock.score >= 75 ? 60 : stock.score >= 65 ? 55 : 50;
  
  // Auto-derive R:R from technicals
  const inGoldenZone = stock.fibGoldenLow && stock.price >= stock.fibGoldenLow && stock.price <= stock.fibGoldenHigh;
  const suggestedEntry = inGoldenZone ? stock.price : stock.fibGoldenLow || stock.price;
  const suggestedStop = stock.atr ? Math.max(stock.fibLow * 0.98, suggestedEntry - (stock.atr * 2.5)) : stock.fibLow;
  const suggestedTarget = stock.analystTarget || stock.fibHigh;
  const winAmount = ((suggestedTarget - suggestedEntry) / suggestedEntry) * 100;
  const lossAmount = ((suggestedEntry - suggestedStop) / suggestedEntry) * 100;
  
  const [winProb, setWinProb] = useState(autoWinProb);
  const [riskPct, setRiskPct] = useState(2);
  
  // Override on stock change
  useEffect(() => { setWinProb(autoWinProb); }, [selectedStock]);

  const isETF = stock.sector.includes("ETF");
  const positionCap = isETF ? 25 : 15;
  
  const b = winAmount / lossAmount;
  const p = winProb / 100;
  const q = 1 - p;
  const kellyFull = Math.max(0, (b * p - q) / b) * 100;
  const kellyHalf = kellyFull / 2;
  const kellyQuarter = kellyFull / 4;
  
  // Apply position cap
  const cappedSize = Math.min(kellyHalf, positionCap);
  const dollarSize = (capital * cappedSize) / 100;
  const shares = Math.floor(dollarSize / suggestedEntry);
  const actualDollar = shares * suggestedEntry;
  const actualPct = (actualDollar / capital) * 100;
  
  // Scaling plan
  const tranche1 = Math.floor(shares * 0.4);
  const tranche2 = Math.floor(shares * 0.35);
  const tranche3 = shares - tranche1 - tranche2;

  // Pre-trade checklist
  const macroOk = MACRO.regimeShort !== "Crisis";
  const principlesOk = stock.principlesPassed >= 6;
  const valuationOk = stock.upside >= 20;
  const technicalOk = inGoldenZone || stock.price < stock.sma200;
  const rrOk = (winAmount / lossAmount) >= 3;
  const sizingOk = actualPct <= positionCap;
  
  const allChecks = [
    { label: "Macro regime allows buying", ok: macroOk },
    { label: "Sector on priority list", ok: true }, // simplified
    { label: `7 Principles confirmed (${stock.principlesPassed}/7)`, ok: principlesOk },
    { label: `Analyst upside ≥20% (${stock.upside}%)`, ok: valuationOk },
    { label: "Technical entry zone (Fib GZ or below SMA 200)", ok: technicalOk },
    { label: `R:R ≥ 1:3 (current 1:${(winAmount/lossAmount).toFixed(1)})`, ok: rrOk },
    { label: `Position within ${positionCap}% cap (${actualPct.toFixed(1)}%)`, ok: sizingOk },
  ];
  const passedAll = allChecks.every(c => c.ok);

  return (
    <div>
      <SectionTitle icon={Target} sub="Position sizing gate · Kelly + caps + scaling">Sizing · {stock.t}</SectionTitle>

      <div style={{ marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {UNIVERSE.map(s => (
          <button key={s.t} onClick={() => setSelectedStock(s.t)} style={{
            padding: "5px 10px", background: selectedStock === s.t ? `${T.gold}25` : T.bgCard,
            border: `1px solid ${selectedStock === s.t ? T.gold : T.border}`,
            color: selectedStock === s.t ? T.goldBright : T.textDim, borderRadius: 5, cursor: "pointer",
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600
          }}>
            {s.t}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Inputs (auto-filled from upstream)</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Portfolio capital ($)</label>
            <input type="number" value={capital} onChange={e => setCapital(+e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>
              Win probability (auto from score: {stock.score}/100 → {autoWinProb}%)
            </label>
            <input type="number" value={winProb} onChange={e => setWinProb(+e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Avg win % (from target/entry)</label>
            <div style={{ ...inputStyle, color: T.green, background: T.bgElev }}>{winAmount.toFixed(2)}%</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Avg loss % (from stop)</label>
            <div style={{ ...inputStyle, color: T.red, background: T.bgElev }}>{lossAmount.toFixed(2)}%</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>
              Position cap ({isETF ? "ETF" : "stock"} rule)
            </label>
            <div style={{ ...inputStyle, color: T.gold, background: T.bgElev }}>{positionCap}%</div>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Kelly Output</h3>
          <div style={{ marginBottom: 10, padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>FULL KELLY (THEORETICAL)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{kellyFull.toFixed(2)}%</div>
            <div style={{ fontSize: 9, color: T.red }}>⚠ Too aggressive in practice</div>
          </div>
          <div style={{ marginBottom: 10, padding: 10, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.gold}40` }}>
            <div style={{ fontSize: 9, color: T.gold, letterSpacing: "0.1em" }}>HALF KELLY (PROFESSIONAL)</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{kellyHalf.toFixed(2)}%</div>
          </div>
          <div style={{ marginBottom: 10, padding: 10, background: T.bgElev, borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>QUARTER KELLY (CONSERVATIVE)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.blue, fontFamily: "'JetBrains Mono', monospace" }}>{kellyQuarter.toFixed(2)}%</div>
          </div>
          <div style={{ padding: 14, background: `${T.green}12`, borderRadius: 6, border: `1px solid ${T.green}40` }}>
            <div style={{ fontSize: 9, color: T.green, letterSpacing: "0.1em", marginBottom: 4 }}>FINAL POSITION (HALF KELLY, CAPPED AT {positionCap}%)</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>${actualDollar.toFixed(0)}</div>
            <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>{shares} shares @ ${suggestedEntry?.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{actualPct.toFixed(2)}% of ${capital.toLocaleString()}</div>
          </div>
        </Card>
      </div>

      {/* Scaling Plan */}
      <Card style={{ marginBottom: 16, borderColor: T.purple + "40" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, color: T.purple, fontFamily: "'Fraunces', serif" }}>📐 3-Tranche Scaling Plan</h3>
        <div style={{ marginBottom: 10, fontSize: 11, color: T.textDim }}>
          Build conviction in stages. Reduces risk of being wrong about timing while still allowing full position if thesis confirms.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div style={{ padding: 12, background: T.bgElev, borderRadius: 6 }}>
            <Pill color={T.green}>TRANCHE 1 · DAY 1</Pill>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{tranche1} sh</div>
            <div style={{ fontSize: 11, color: T.textDim }}>${(tranche1 * suggestedEntry).toFixed(0)} (40%)</div>
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>At ${suggestedEntry?.toFixed(2)}</div>
          </div>
          <div style={{ padding: 12, background: T.bgElev, borderRadius: 6 }}>
            <Pill color={T.gold}>TRANCHE 2 · CONFIRMATION</Pill>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{tranche2} sh</div>
            <div style={{ fontSize: 11, color: T.textDim }}>${(tranche2 * suggestedEntry).toFixed(0)} (35%)</div>
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>On break above ${stock.sma200} (SMA 200 reclaim)</div>
          </div>
          <div style={{ padding: 12, background: T.bgElev, borderRadius: 6 }}>
            <Pill color={T.blue}>TRANCHE 3 · THESIS VALIDATION</Pill>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{tranche3} sh</div>
            <div style={{ fontSize: 11, color: T.textDim }}>${(tranche3 * suggestedEntry).toFixed(0)} (25%)</div>
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>After earnings confirms thesis</div>
          </div>
        </div>
      </Card>

      {/* Pre-Trade Checklist */}
      <Card style={{ borderColor: passedAll ? T.green + "40" : T.gold + "40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Shield size={16} color={passedAll ? T.green : T.gold} />
          <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Fraunces', serif", color: T.text }}>Pre-Trade Final Gate</h3>
          <Pill color={passedAll ? T.green : T.gold}>
            {allChecks.filter(c => c.ok).length}/{allChecks.length} PASS
          </Pill>
        </div>
        {allChecks.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < allChecks.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontSize: 14, color: c.ok ? T.green : T.red }}>{c.ok ? "✓" : "✗"}</span>
            <span style={{ fontSize: 12, color: T.text }}>{c.label}</span>
          </div>
        ))}
        {passedAll && (
          <div style={{ marginTop: 14, padding: 14, background: `${T.green}15`, borderRadius: 6, border: `1px solid ${T.green}50` }}>
            <div style={{ fontSize: 13, color: T.green, fontWeight: 700, marginBottom: 4 }}>✓ ALL GATES GREEN — GO</div>
            <div style={{ fontSize: 11, color: T.text }}>Proceed to Journal tab to log this trade pre-execution. Copy order ticket from Technicals tab into TradeStation.</div>
          </div>
        )}
        {!passedAll && (
          <div style={{ marginTop: 14, padding: 14, background: `${T.orange}15`, borderRadius: 6, border: `1px solid ${T.orange}50` }}>
            <div style={{ fontSize: 13, color: T.orange, fontWeight: 700, marginBottom: 4 }}>⚠ NOT ALL GATES PASS — RECONSIDER</div>
            <div style={{ fontSize: 11, color: T.text }}>Fix red items before executing, or pass on this trade. Discipline over impulse.</div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================= PORTFOLIO ================= */
function Portfolio({ setSelectedStock, setTab, capital }) {
  const positions = UNIVERSE.filter(s => s.cat === "PORTFOLIO");
  const allocations = { NVDA: 0.12, MSFT: 0.13, META: 0.10, AMZN: 0.08, AVGO: 0.10, CEG: 0.06, LLY: 0.06, QQQM: 0.18, SMH: 0.12 };
  const totalAlloc = Object.values(allocations).reduce((a, b) => a + b, 0);
  const cash = Math.max(0, 1 - totalAlloc);

  // Compute tier breakdowns
  const tierBreakdown = positions.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] || 0) + (allocations[s.t] || 0);
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle icon={Briefcase} sub={`Current positions · deployed ${(totalAlloc*100).toFixed(0)}% / cash ${(cash*100).toFixed(0)}%`}>Portfolio</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        <Card><div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>VALUE</div><div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>${capital.toLocaleString()}</div></Card>
        <Card><div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>POSITIONS</div><div style={{ fontSize: 20, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{positions.length}</div></Card>
        <Card><div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>T1 CORE</div><div style={{ fontSize: 20, fontWeight: 700, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{((tierBreakdown.T1 || 0) * 100).toFixed(0)}%</div><div style={{ fontSize: 9, color: T.textFaint }}>target 55-65%</div></Card>
        <Card><div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>T2 ETF</div><div style={{ fontSize: 20, fontWeight: 700, color: T.blue, fontFamily: "'JetBrains Mono', monospace" }}>{((tierBreakdown.T2 || 0) * 100).toFixed(0)}%</div><div style={{ fontSize: 9, color: T.textFaint }}>target 20-25%</div></Card>
        <Card><div style={{ fontSize: 9, color: T.textFaint, letterSpacing: "0.1em" }}>CASH</div><div style={{ fontSize: 20, fontWeight: 700, color: T.blue, fontFamily: "'JetBrains Mono', monospace" }}>${(capital*cash).toFixed(0)}</div><div style={{ fontSize: 9, color: T.textFaint }}>target {MACRO.regimeCash.min}-{MACRO.regimeCash.max}%</div></Card>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "55px 1fr 70px 0.8fr 0.7fr 0.8fr 0.7fr 1fr",
        gap: 10, padding: "8px 14px", fontSize: 9, color: T.textFaint, letterSpacing: "0.1em",
        borderBottom: `1px solid ${T.border}`, marginBottom: 6
      }}>
        <span>SCORE</span><span>POSITION</span><span>TIER</span><span>PRICE</span><span>YTD</span><span>vs SMA200</span><span>WEIGHT</span><span>STATUS</span>
      </div>

      {positions.map(s => {
        const gap = s.sma200 ? smaGap(s.price, s.sma200) : null;
        const weight = allocations[s.t] ? (allocations[s.t] * 100).toFixed(0) : "—";
        const status = s.score >= 80 ? "INTACT" : s.score >= 65 ? "WATCH" : "BROKEN";
        return (
          <div key={s.t} onClick={() => { setSelectedStock(s.t); setTab("conviction"); }} style={{
            display: "grid", gridTemplateColumns: "55px 1fr 70px 0.8fr 0.7fr 0.8fr 0.7fr 1fr",
            gap: 10, padding: "14px", background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 8, marginBottom: 6, cursor: "pointer", alignItems: "center"
          }}>
            <ScoreBadge score={s.score} size="sm" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>{s.name}</div>
            </div>
            <TierBadge tier={s.tier} />
            <div style={{ fontSize: 12, color: T.text, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{money(s.price)}</div>
            <div style={{ fontSize: 12, color: s.ytd >= 0 ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>{pct(s.ytd)}</div>
            <div style={{ fontSize: 11, color: gap < 0 ? T.green : T.orange, fontFamily: "'JetBrains Mono', monospace" }}>{gap != null ? pct(gap) : "—"}</div>
            <div style={{ fontSize: 12, color: T.gold, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{weight}%</div>
            <ThesisStatus status={status} />
          </div>
        );
      })}

      <Card style={{ marginTop: 16, background: T.gold + "08", borderColor: T.gold + "30" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Info size={16} color={T.gold} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, lineHeight: 1.6, color: T.text }}>
            <strong style={{ color: T.gold }}>Portfolio rules in effect:</strong> Max 15% per stock, 25% per ETF. Tier 1 Core target 55-65%. T2 ETF 20-25%. Cash {MACRO.regimeCash.min}-{MACRO.regimeCash.max}% in current cautious regime. ETF lookthrough on sector concentration enforced. Drawdown circuits: position -20% triggers thesis review, portfolio -15% from ATH stops new buys for 2 weeks.
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================= WEEKLY REVIEW ================= */
function WeeklyReview({ setTab }) {
  const portfolio = UNIVERSE.filter(s => s.cat === "PORTFOLIO");
  const upcomingCatalysts = UNIVERSE.filter(s => s.earnings).map(s => ({...s, days: daysUntil(s.earnings)})).filter(s => s.days >= 0 && s.days <= 14).sort((a, b) => a.days - b.days);
  
  return (
    <div>
      <SectionTitle icon={Calendar} sub="Sunday 15-minute ritual · informed weekly engagement">Weekly Review</SectionTitle>

      <Card style={{ marginBottom: 16, borderColor: T.cyan + "40", background: `linear-gradient(135deg, ${T.cyan}08, transparent)` }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: T.cyan, fontFamily: "'Fraunces', serif" }}>📅 Week Ahead — Key Events</h3>
        {upcomingCatalysts.slice(0, 8).map(s => (
          <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 60, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.days <= 3 ? T.red : s.days <= 7 ? T.orange : T.gold, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{s.days}</div>
              <div style={{ fontSize: 9, color: T.textFaint }}>days</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
                <TierBadge tier={s.tier} />
              </div>
              <div style={{ fontSize: 11, color: T.textDim }}>Earnings · {s.earnings}</div>
            </div>
            <ScoreBadge score={s.score} size="sm" />
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: T.gold, fontFamily: "'Fraunces', serif" }}>📊 Portfolio Health Check</h3>
        {portfolio.map(s => {
          const gap = s.sma200 ? smaGap(s.price, s.sma200) : 0;
          const status = s.score >= 80 ? "INTACT" : s.score >= 65 ? "WATCH" : "BROKEN";
          return (
            <div key={s.t} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", minWidth: 60 }}>{s.t}</span>
                <ThesisStatus status={status} />
                <span style={{ fontSize: 11, color: T.textDim, marginLeft: "auto" }}>{s.lifecycle}</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>
                {gap < 0 ? `Below SMA 200 by ${Math.abs(gap).toFixed(1)}% — DCA acceleration zone.` : `Above SMA 200 by ${gap.toFixed(1)}% — wait for pullback.`}
                {s.williamsRising && s.williams >= -50 ? " Williams %R rising toward -40 momentum trigger." : ""}
              </div>
            </div>
          );
        })}
      </Card>

      <Card style={{ background: T.purple + "08", borderColor: T.purple + "40" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: T.purple, fontFamily: "'Fraunces', serif" }}>🤔 Sunday Self-Check</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            "Are any of my position theses feeling shakier than last week?",
            "Did anything happen this week that changes a structural thesis?",
            "Am I on plan or drifting (FOMO, revenge trades, missed deployments)?",
            "Any new opportunity surfaced that should go on watchlist?",
            "Is my emotional state aligned with making good decisions this week?",
          ].map((q, i) => (
            <div key={i} style={{ padding: 10, background: T.bgElev, borderRadius: 6, fontSize: 12, color: T.text, lineHeight: 1.6 }}>
              <span style={{ color: T.purple, fontWeight: 700 }}>{i+1}.</span> {q}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


/* PART 6 — Journal, AltData, 13F, AIChat, Settings, Main App */

/* ================= JOURNAL ================= */
function Journal({ selectedStock }) {
  const [entries, setEntries] = useState([]);
  const stockData = UNIVERSE.find(s => s.t === selectedStock);
  const [draft, setDraft] = useState({
    ticker: stockData?.t || "",
    tier: stockData?.tier || "T1",
    action: "BUY",
    price: stockData?.price || "",
    shares: "",
    structuralThesis: stockData?.structuralThesis?.slice(0, 200) || "",
    tacticalThesis: stockData?.tacticalThesis?.slice(0, 200) || "",
    conviction: 7,
    emotion: "",
    decision: "",
    result: ""
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.list("journalv3:");
        if (res?.keys?.length) {
          const items = await Promise.all(res.keys.map(async k => {
            try {
              const r = await window.storage.get(k);
              return JSON.parse(r.value);
            } catch { return null; }
          }));
          setEntries(items.filter(Boolean).sort((a, b) => b.ts - a.ts));
        }
      } catch (err) { console.log("Storage load error", err); }
      setLoading(false);
    })();
  }, []);

  // Auto-fill from selected stock
  useEffect(() => {
    if (stockData && !editingId) {
      setDraft(d => ({
        ...d,
        ticker: stockData.t,
        tier: stockData.tier,
        price: stockData.price,
        structuralThesis: stockData.structuralThesis?.slice(0, 200) || "",
        tacticalThesis: stockData.tacticalThesis?.slice(0, 200) || "",
      }));
    }
  }, [selectedStock]);

  const save = async () => {
    if (!draft.ticker) return;
    const id = editingId || `j_${Date.now()}`;
    const entry = { ...draft, id, ts: editingId ? entries.find(e => e.id === editingId)?.ts || Date.now() : Date.now() };
    try {
      await window.storage.set(`journalv3:${id}`, JSON.stringify(entry));
      setEntries(prev => {
        const filtered = prev.filter(e => e.id !== id);
        return [entry, ...filtered].sort((a, b) => b.ts - a.ts);
      });
      setDraft({ ticker: "", tier: "T1", action: "BUY", price: "", shares: "", structuralThesis: "", tacticalThesis: "", conviction: 7, emotion: "", decision: "", result: "" });
      setEditingId(null);
    } catch (err) { alert("Save failed: " + err.message); }
  };

  const del = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await window.storage.delete(`journalv3:${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const edit = (e) => { setDraft(e); setEditingId(e.id); };

  return (
    <div>
      <SectionTitle icon={BookOpen} sub="Pre-fill from upstream tabs · Log every trade pre-execution">Trade Journal</SectionTitle>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>{editingId ? "Edit entry" : "New entry"} {stockData && !editingId && <span style={{ fontSize: 10, color: T.textDim, fontWeight: 400 }}>· auto-filled from {stockData.t}</span>}</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <input placeholder="Ticker" value={draft.ticker} onChange={e => setDraft({ ...draft, ticker: e.target.value.toUpperCase() })} style={inputStyle} />
          <select value={draft.tier} onChange={e => setDraft({ ...draft, tier: e.target.value })} style={inputStyle}>
            <option>T1</option><option>T2</option><option>T3</option>
          </select>
          <select value={draft.action} onChange={e => setDraft({ ...draft, action: e.target.value })} style={inputStyle}>
            <option>BUY</option><option>SELL</option><option>TRIM</option><option>ADD</option><option>WATCH</option>
          </select>
          <input placeholder="Price" type="number" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} style={inputStyle} />
          <input placeholder="Shares" type="number" value={draft.shares} onChange={e => setDraft({ ...draft, shares: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Structural thesis (long-term)</label>
          <textarea value={draft.structuralThesis} onChange={e => setDraft({ ...draft, structuralThesis: e.target.value })} 
            style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Tactical thesis (this entry)</label>
          <textarea value={draft.tacticalThesis} onChange={e => setDraft({ ...draft, tacticalThesis: e.target.value })} 
            style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "'Inter', sans-serif" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Conviction (1-10)</label>
            <input type="number" min="1" max="10" value={draft.conviction} onChange={e => setDraft({ ...draft, conviction: +e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Emotion check</label>
            <input placeholder="Calm? FOMO? Revenge?" value={draft.emotion} onChange={e => setDraft({ ...draft, emotion: e.target.value })} style={{ ...inputStyle, fontFamily: "'Inter', sans-serif" }} />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Final decision</label>
          <select value={draft.decision} onChange={e => setDraft({ ...draft, decision: e.target.value })} style={inputStyle}>
            <option value="">— select —</option>
            <option>EXECUTE</option><option>WAIT</option><option>PASS</option>
          </select>
        </div>

        <textarea placeholder="Outcome / reflection (post-trade)" value={draft.result} onChange={e => setDraft({ ...draft, result: e.target.value })} 
          style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "'Inter', sans-serif", marginBottom: 10 }} />
        
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} style={{
            padding: "8px 16px", background: T.gold + "25", border: `1px solid ${T.gold}`,
            color: T.gold, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 6
          }}><Save size={12} />{editingId ? "Update" : "Save entry"}</button>
          {editingId && <button onClick={() => { setDraft({ ticker: "", tier: "T1", action: "BUY", price: "", shares: "", structuralThesis: "", tacticalThesis: "", conviction: 7, emotion: "", decision: "", result: "" }); setEditingId(null); }} style={{
            padding: "8px 16px", background: T.bgElev, border: `1px solid ${T.border}`,
            color: T.textDim, borderRadius: 6, cursor: "pointer", fontSize: 12
          }}>Cancel</button>}
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: T.textFaint }}>Entries persist across sessions in browser storage.</div>
      </Card>

      {loading ? <div style={{ color: T.textDim, textAlign: "center", padding: 30 }}>Loading entries…</div> :
       entries.length === 0 ? <Card><div style={{ textAlign: "center", color: T.textDim, padding: 30, fontSize: 13 }}>No entries yet. Log every trade pre-execution to build edge.</div></Card> :
       entries.map(e => (
         <Card key={e.id} style={{ marginBottom: 12 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
             <div>
               <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                 <Pill color={e.action === "BUY" || e.action === "ADD" ? T.green : e.action === "SELL" || e.action === "TRIM" ? T.red : T.gold}>{e.action}</Pill>
                 <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{e.ticker}</span>
                 <TierBadge tier={e.tier} />
                 {e.price && <span style={{ fontSize: 12, color: T.textDim }}>@ ${e.price}</span>}
                 {e.shares && <span style={{ fontSize: 12, color: T.textDim }}>· {e.shares} sh</span>}
                 {e.conviction && <span style={{ fontSize: 11, color: T.gold }}>Conv {e.conviction}/10</span>}
                 {e.decision && <Pill color={e.decision === "EXECUTE" ? T.green : T.gold}>{e.decision}</Pill>}
               </div>
               <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>{new Date(e.ts).toLocaleString()}</div>
             </div>
             <div style={{ display: "flex", gap: 6 }}>
               <button onClick={() => edit(e)} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}><Edit3 size={13} /></button>
               <button onClick={() => del(e.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", padding: 4 }}><Trash2 size={13} /></button>
             </div>
           </div>
           {e.structuralThesis && <div style={{ marginBottom: 8, padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 12, color: T.text, lineHeight: 1.6 }}><div style={{ fontSize: 9, color: T.green, marginBottom: 4, letterSpacing: "0.1em" }}>STRUCTURAL THESIS</div>{e.structuralThesis}</div>}
           {e.tacticalThesis && <div style={{ marginBottom: 8, padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 12, color: T.text, lineHeight: 1.6 }}><div style={{ fontSize: 9, color: T.purple, marginBottom: 4, letterSpacing: "0.1em" }}>TACTICAL THESIS</div>{e.tacticalThesis}</div>}
           {e.emotion && <div style={{ marginBottom: 8, padding: 8, background: T.bgElev, borderRadius: 5, fontSize: 11, color: T.textDim }}><strong>Emotion:</strong> {e.emotion}</div>}
           {e.result && <div style={{ padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 12, color: T.text, lineHeight: 1.6 }}><div style={{ fontSize: 9, color: T.gold, marginBottom: 4, letterSpacing: "0.1em" }}>OUTCOME</div>{e.result}</div>}
         </Card>
       ))}
    </div>
  );
}

/* ================= ALT DATA ================= */
function AltData() {
  const politicos = UNIVERSE.filter(s => (s.politicalSig || 0) >= 4).sort((a, b) => (b.politicalSig || 0) - (a.politicalSig || 0));
  const govContracts = UNIVERSE.filter(s => (s.govContract || 0) >= 4).sort((a, b) => (b.govContract || 0) - (a.govContract || 0));
  
  return (
    <div>
      <SectionTitle icon={Users} sub="Congressional trades, government contracts, insider activity">Alternative Data</SectionTitle>

      <Card style={{ marginBottom: 16, borderColor: T.purple + "30", background: T.purple + "05" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={16} color={T.purple} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 4 }}>The institutional edge</div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: T.text }}>
              STOCK Act requires Congress members to disclose trades within 45 days. Committee alignment, cluster buying (3+ politicians, both parties), and government contract momentum are early signals professional funds track via Quiver Quantitative and Capitol Trades.
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>🏛 Strong Congressional Buying</h3>
          {politicos.map(s => (
            <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ minWidth: 50 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
              </div>
              <Stars count={s.politicalSig || 0} />
              <div style={{ flex: 1, fontSize: 10, color: T.textDim }}>{s.name}</div>
              <ScoreBadge score={s.score} size="sm" />
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>📜 Gov Contract Momentum</h3>
          {govContracts.map(s => (
            <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ minWidth: 50 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
              </div>
              <Stars count={s.govContract || 0} color={T.blue} />
              <div style={{ flex: 1, fontSize: 10, color: T.textDim }}>{s.name}</div>
              <ScoreBadge score={s.score} size="sm" />
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Notable Congressional Traders</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {[
            { name: "Nancy Pelosi (D-CA)", focus: "Tech mega-caps", pattern: "Concentrated, often pre-move", acc: "Historically outperforms S&P" },
            { name: "Markwayne Mullin (R-OK)", focus: "Energy, defense", pattern: "Committee-aligned", acc: "High signal in his areas" },
            { name: "Michael McCaul (R-TX)", focus: "Foreign Affairs, defense", pattern: "Defense primes", acc: "Strong thematic signal" },
            { name: "Tommy Tuberville (R-AL)", focus: "Broad mega-cap", pattern: "Large volume", acc: "Active trader" },
          ].map(p => (
            <div key={p.name} style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: T.textDim, marginBottom: 2 }}>Focus: <span style={{ color: T.gold }}>{p.focus}</span></div>
              <div style={{ fontSize: 10, color: T.textDim, marginBottom: 2 }}>Pattern: {p.pattern}</div>
              <div style={{ fontSize: 10, color: T.green }}>{p.acc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>
          Live tracking: <a href="https://www.capitoltrades.com" target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>capitoltrades.com</a> · <a href="https://www.quiverquant.com" target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>quiverquant.com</a>
        </div>
      </Card>
    </div>
  );
}

/* ================= 13F FILINGS ================= */
function Filings13F() {
  const tracked = [
    { name: "Berkshire Hathaway", manager: "Buffett", style: "Quality value", aum: "$300B" },
    { name: "Pershing Square", manager: "Ackman", style: "Concentrated activist", aum: "$15B" },
    { name: "Appaloosa", manager: "Tepper", style: "Macro/tactical", aum: "$15B" },
    { name: "Baillie Gifford", manager: "Anderson team", style: "Long-term growth", aum: "$300B" },
    { name: "Tiger Global", manager: "Coleman", style: "Tech growth", aum: "$70B" },
    { name: "Lone Pine", manager: "Mandel", style: "Quality growth", aum: "$50B" },
    { name: "Gates Foundation", manager: "Trust", style: "Long-term core", aum: "$50B" },
    { name: "Bridgewater", manager: "Dalio (founder)", style: "Macro all-weather", aum: "$150B" },
    { name: "Renaissance", manager: "Medallion", style: "Quant", aum: "$130B" },
    { name: "Citadel", manager: "Griffin", style: "Multi-strat", aum: "$60B" },
    { name: "Millennium", manager: "Englander", style: "Multi-strat pod", aum: "$70B" },
    { name: "Point72", manager: "Cohen", style: "Multi-strat", aum: "$35B" },
    { name: "Third Point", manager: "Loeb", style: "Activist", aum: "$15B" },
    { name: "Greenlight", manager: "Einhorn", style: "Long/short value", aum: "$2B" },
    { name: "Scion", manager: "Burry", style: "Contrarian deep value", aum: "$200M" },
    { name: "Viking Global", manager: "Halvorsen", style: "Long/short", aum: "$50B" },
    { name: "D1 Capital", manager: "Sundheim", style: "Long-biased growth", aum: "$22B" },
    { name: "Coatue", manager: "Laffont", style: "Tech long/short", aum: "$50B" },
    { name: "D.E. Shaw", manager: "Shaw", style: "Quant/multi-strat", aum: "$70B" },
    { name: "TCI", manager: "Hohn", style: "Concentrated activist", aum: "$60B" },
  ];

  const consensusBuys = UNIVERSE.filter(s => s.smartMoney13F?.trend?.includes("Strong accumulation") || s.smartMoney13F?.trend?.includes("Accumulation"));
  
  return (
    <div>
      <SectionTitle icon={Crown} sub="What institutional money is accumulating · 45-day SEC filing delay">Smart Money — 13F Filings</SectionTitle>

      <Card style={{ marginBottom: 16, borderColor: T.purple + "30", background: T.purple + "05" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={16} color={T.purple} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, lineHeight: 1.6, color: T.text }}>
            <strong style={{ color: T.purple }}>How professionals use 13F:</strong> Institutional managers >$100M must disclose holdings quarterly within 45 days. Value: spotting consensus accumulation (5+ tracked funds adding), new positions from tier-1 managers (Buffett initiating = high signal), and trend reversals (mass trimming after accumulation peak). 13F is best for confirmation, not timing.
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, color: T.gold, fontFamily: "'Fraunces', serif" }}>🔥 Consensus Accumulation in Your Universe</h3>
        <div style={{
          display: "grid", gridTemplateColumns: "55px 1fr 0.6fr 1.2fr 1.5fr",
          gap: 10, padding: "8px 14px", fontSize: 9, color: T.textFaint, letterSpacing: "0.1em",
          borderBottom: `1px solid ${T.border}`, marginBottom: 6
        }}>
          <span>SCORE</span><span>TICKER</span><span>FUNDS</span><span>TREND</span><span>HIGHLIGHT</span>
        </div>
        {consensusBuys.map(s => (
          <div key={s.t} style={{
            display: "grid", gridTemplateColumns: "55px 1fr 0.6fr 1.2fr 1.5fr",
            gap: 10, padding: "12px 14px", background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 8, marginBottom: 6, alignItems: "center"
          }}>
            <ScoreBadge score={s.score} size="sm" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.t}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>{s.name}</div>
            </div>
            <div style={{ fontSize: 13, color: T.gold, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{s.smartMoney13F?.funds}/20</div>
            <div style={{ fontSize: 11, color: T.green }}>{s.smartMoney13F?.trend}</div>
            <div style={{ fontSize: 11, color: T.gold, fontStyle: "italic" }}>{s.smartMoney13F?.highlight}</div>
          </div>
        ))}
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, color: T.gold, fontFamily: "'Fraunces', serif" }}>Tracked Fund Roster (20)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {tracked.map(f => (
            <div key={f.name} style={{ padding: 12, background: T.bgElev, borderRadius: 6, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{f.name}</div>
              <div style={{ fontSize: 10, color: T.gold, marginTop: 2 }}>{f.manager}</div>
              <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>{f.style}</div>
              <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>AUM: {f.aum}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: T.bgElev, borderRadius: 5, fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>
          Live 13F tracking: <a href="https://www.dataroma.com" target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>dataroma.com</a> · <a href="https://whalewisdom.com" target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>whalewisdom.com</a>
        </div>
      </Card>
    </div>
  );
}

/* ================= AI CHAT ================= */
function AIChat({ capital, dcaPlan }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I'm your AI portfolio manager with full context on:\n\n• Your Abacus 7 Principles framework\n• Your 8-step valuation method\n• Your 5-step entry checklist (Golden Zone 61.8-78.6%)\n• Position rules: 15% stock cap, 25% ETF cap, T1/T2/T3 tiers\n• Current macro: Cautious regime, VIX 20.4, recession prob 50%\n• 30-stock universe with full fundamentals\n• Your $10k base + $500/month DCA\n\nAsk me anything:\n\n• \"Walk me through MSFT vs META — which is better entry now?\"\n• \"How should I size NVDA given my framework?\"\n• \"Am I overexposed to tech with ETF lookthrough?\"\n• \"What's my biggest portfolio risk this week?\"\n• \"Apply your 7 Principles to LLY for me\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const systemContext = `You are AlphaDesk AI — institutional investment advisor for Mariana. Date: April 19, 2026.

ABACUS FRAMEWORK (her course - mandatory reference):
7 PRINCIPLES:
I. Price Target (analyst target ≥20% upside ideal)
II. Sales Growth (Mature + Growth-Leader phases preferred)
III. Ley de 200 días (buy below SMA 200)
IV. Conference Call (alphaspread.com transcripts, AI-evaluated)
V. P/E Ratio (20-39 = leader sweet spot per Abacus)
VI. Support/Resistance (R:R 1:3 for portfolio, 1:2 swing)
VII. Williams %R (-90 portfolio entry, rising thru -40 swing trigger)

8-STEP VALUATION (her exact method):
1. PE Ratio + category
2. Cash runway (months) + Debt to Capital
3. Sales growth estimate
4. Profit margin AVG
5. PE 6-month AVG
6. Net Income projection = Sales × Margin
7. Market Cap Futuro = NI × Avg PE
8. Possible Return = (MC Futuro / MC Presente) - 1

5-STEP ENTRY:
1. Bearish structure (penultimate LL)
2. Structure change confirmed
3. Fib Golden Zone 61.8-78.6%
4. R:R ≥1:3 (portfolio) or 1:2 (swing)
5. EMA 50 break+retest, Williams crossing -40

POSITION RULES:
- Max 15% per stock, 25% per ETF
- T1 Core 55-65%, T2 ETF 20-25%, T3 Tactical 10-20%
- Cash reserve regime-driven (currently 25-30% cautious)
- 3-tranche scaling (40/35/25)

MACRO (today):
- Regime: ${MACRO.regime}
- S&P 500: ${MACRO.spx.level} (${MACRO.spx.ytd}% YTD, below SMA 200)
- VIX: ${MACRO.vix.level} (Elevated)
- Fear & Greed: ${MACRO.fearGreed.val} (Fear)
- Fed: ${MACRO.fed.rate} hold
- CPI: ${MACRO.inflation.cpi}% (sticky)
- Recession prob: ${MACRO.recession.prob}%
- Sector leadership: Energy +34%, Defense +18%, Mag7 -8%
- Brent oil: $${MACRO.oil.brent} (Iran tensions)

USER PROFILE:
- Mariana, Hamburg DE, Argentine citizen, TradeStation
- Capital: $${capital}, Monthly DCA: $${dcaPlan?.monthly || 500}
- Long-term focus, swing tactical overlay
- 2026 objective: Don't lose money, build portfolio, gain experience

UNIVERSE TOP CONVICTION:
${UNIVERSE.filter(s => s.score >= 80).map(s => `${s.t} (${s.tier}, ${s.principlesPassed}/7P, score ${s.score}): ${s.thesis?.slice(0, 80) || s.structuralThesis?.slice(0, 80)}`).join("\n")}

RULES:
- Always reference the Abacus framework when applicable
- Be direct, professional PM tone, no fluff
- Apply 7 Principles when evaluating
- Consider regime in all sizing/timing recommendations
- Flag risks clearly
- ~250 word responses unless asked for depth
- Not financial advice — brief acknowledgment for buy/sell calls`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemContext,
          messages: newMessages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").filter(Boolean).join("\n") || "(No response)";
      setMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon={MessageCircle} sub="Full Abacus framework + your portfolio context loaded">AI Portfolio Manager</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", height: "70vh", maxHeight: 700 }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 4, marginBottom: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: m.role === "user" ? T.blue + "20" : T.purple + "20",
                border: `1px solid ${m.role === "user" ? T.blue : T.purple}`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {m.role === "user" ? <Users size={14} color={T.blue} /> : <Sparkles size={14} color={T.purple} />}
              </div>
              <div style={{
                maxWidth: "75%", padding: "12px 16px",
                background: m.role === "user" ? T.blue + "15" : T.bgCard,
                border: `1px solid ${m.role === "user" ? T.blue + "40" : T.border}`,
                borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: T.text,
                whiteSpace: "pre-wrap"
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.purple + "20", border: `1px solid ${T.purple}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} color={T.purple} />
              </div>
              <div style={{ padding: "12px 16px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.textDim }}>
                <RefreshCw size={13} className="spin" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }} /> Analyzing…
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask anything about your portfolio, a stock, or apply your 7 Principles..."
            style={{ flex: 1, padding: "12px 16px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: "none", fontFamily: "'Inter', sans-serif" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            padding: "12px 20px", background: T.purple + "25", border: `1px solid ${T.purple}`,
            color: T.purple, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
            opacity: (loading || !input.trim()) ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 8
          }}>
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
function SettingsTab({ capital, setCapital, dcaPlan, setDcaPlan }) {
  return (
    <div>
      <SectionTitle icon={Settings} sub="Capital, risk rules, DCA schedule">Settings</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Capital</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Total capital ($)</label>
            <input type="number" value={capital} onChange={e => setCapital(+e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: T.textDim, display: "block", marginBottom: 4 }}>Monthly DCA ($)</label>
            <input type="number" value={dcaPlan.monthly} onChange={e => setDcaPlan({ ...dcaPlan, monthly: +e.target.value })} style={inputStyle} />
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Risk Rules (locked)</h3>
          <StatRow label="Max single stock" value="15%" mono color={T.gold} />
          <StatRow label="Max single ETF" value="25%" mono color={T.gold} />
          <StatRow label="Max effective sector" value="35%" mono color={T.gold} />
          <StatRow label="Position drawdown trigger" value="-20%" mono color={T.red} />
          <StatRow label="Portfolio drawdown circuit" value="-15% from ATH" mono color={T.red} />
          <StatRow label="Position sizing method" value="Half Kelly capped" mono />
          <StatRow label="Scaling tranches" value="40/35/25" mono />
          <StatRow label="Max concurrent positions" value="8-12" mono />
        </Card>
      </div>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, color: T.gold, fontFamily: "'Fraunces', serif" }}>Tier Targets</h3>
        <StatRow label="Tier 1 Core (3-10yr holds)" value="55-65%" mono color={T.gold} />
        <StatRow label="Tier 2 ETF Foundation (forever)" value="20-25%" mono color={T.blue} />
        <StatRow label="Tier 3 Tactical (3-18mo)" value="10-20%" mono color={T.purple} />
        <StatRow label="Cash reserve (current cautious)" value={`${MACRO.regimeCash.min}-${MACRO.regimeCash.max}%`} mono color={T.green} />
      </Card>
    </div>
  );
}

/* =============================================================================
   MAIN APP
============================================================================= */
export default function App() {
  const [tab, setTab] = useState("command");
  const [selectedStock, setSelectedStock] = useState("MSFT");
  const [capital, setCapital] = useState(10000);
  const [dcaPlan, setDcaPlan] = useState({
    monthly: 500,
    deployPct: 80,  // current cautious regime
    deployAmount: 400,
    reserveAmount: 100,
    allocations: [
      { priority: 1, label: "QQQM (T2 ETF)", reason: "Below SMA 200 — DCA acceleration zone", amount: 180, color: T.blue },
      { priority: 2, label: "MSFT (T1 Core)", reason: "Highest conviction T1 below SMA 200, earnings Apr 29", amount: 160, color: T.gold },
      { priority: 3, label: "AVGO (T1 Core)", reason: "Highest score (88), deep value, custom AI silicon", amount: 60, color: T.gold },
    ],
  });

  const portfolio = UNIVERSE.filter(s => s.cat === "PORTFOLIO");
  const watchlist = UNIVERSE.filter(s => s.cat === "WATCHLIST");

  const TABS = [
    { id: "command", label: "Command", icon: Activity },
    { id: "macro", label: "Macro", icon: Globe },
    { id: "sectors", label: "Sectors", icon: Layers },
    { id: "screener", label: "Screener", icon: Filter },
    { id: "conviction", label: "Deep Dive", icon: Brain },
    { id: "technicals", label: "Technicals", icon: LineChartIcon },
    { id: "kelly", label: "Sizing", icon: Target },
    { id: "portfolio", label: "Portfolio", icon: Briefcase },
    { id: "weekly", label: "Weekly", icon: Calendar },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "altdata", label: "Alt Data", icon: Users },
    { id: "13f", label: "13F", icon: Crown },
    { id: "ai", label: "AI Chat", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS_CSS}</style>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.borderLight}; }
        input::placeholder, textarea::placeholder { color: ${T.textFaint}; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        a { color: ${T.gold}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${T.border}`, background: T.bg, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, letterSpacing: "-0.03em" }}>
              <span style={{ color: T.text }}>Alpha</span><span style={{ color: T.gold, fontStyle: "italic" }}>Desk</span>
              <span style={{ fontSize: 10, color: T.textFaint, marginLeft: 8, letterSpacing: "0.2em" }}>v3 · ABACUS FRAMEWORK</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 10, color: T.textDim, textAlign: "right" }}>
              <div style={{ color: MACRO.regimeColor, fontWeight: 700 }}>{MACRO.regimeShort.toUpperCase()}</div>
              <div>VIX {MACRO.vix.level} · F&G {MACRO.fearGreed.val} · {MACRO.asOf}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }}></div>
          </div>
        </div>
        <nav style={{ maxWidth: 1500, margin: "0 auto", padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
          {TABS.map(tabDef => {
            const Icon = tabDef.icon;
            const active = tab === tabDef.id;
            return (
              <button key={tabDef.id} onClick={() => setTab(tabDef.id)} style={{
                padding: "12px 14px", background: "none", border: "none",
                color: active ? T.gold : T.textDim, cursor: "pointer",
                fontSize: 12, fontWeight: active ? 600 : 500,
                borderBottom: `2px solid ${active ? T.gold : "transparent"}`,
                display: "inline-flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "'Inter', sans-serif"
              }}>
                <Icon size={13} />
                {tabDef.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main style={{ maxWidth: 1500, margin: "0 auto", padding: "28px 24px 80px" }}>
        {tab === "command" && <CommandCenter portfolio={portfolio} watchlist={watchlist} setTab={setTab} setSelectedStock={setSelectedStock} dcaPlan={dcaPlan} capital={capital} />}
        {tab === "macro" && <Macro />}
        {tab === "sectors" && <Sectors setTab={setTab} />}
        {tab === "screener" && <Screener setSelectedStock={setSelectedStock} setTab={setTab} />}
        {tab === "conviction" && <Conviction selectedStock={selectedStock} setSelectedStock={setSelectedStock} setTab={setTab} />}
        {tab === "technicals" && <Technicals selectedStock={selectedStock} setSelectedStock={setSelectedStock} />}
        {tab === "kelly" && <Kelly selectedStock={selectedStock} setSelectedStock={setSelectedStock} capital={capital} setCapital={setCapital} />}
        {tab === "portfolio" && <Portfolio setSelectedStock={setSelectedStock} setTab={setTab} capital={capital} />}
        {tab === "weekly" && <WeeklyReview setTab={setTab} />}
        {tab === "journal" && <Journal selectedStock={selectedStock} />}
        {tab === "altdata" && <AltData />}
        {tab === "13f" && <Filings13F />}
        {tab === "ai" && <AIChat capital={capital} dcaPlan={dcaPlan} />}
        {tab === "settings" && <SettingsTab capital={capital} setCapital={setCapital} dcaPlan={dcaPlan} setDcaPlan={setDcaPlan} />}
      </main>

      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 8 }}>
          AlphaDesk v3 · Built on Abacus Experience framework · Data as of {MACRO.asOf} · Not financial advice
        </div>
        <div style={{ fontSize: 10, color: T.textFaint, fontStyle: "italic", fontFamily: "'Fraunces', serif", maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
          "Time will pass anyway. Work gives results — not when we want, but when we are prepared to sustain it."
        </div>
      </footer>
    </div>
  );
}



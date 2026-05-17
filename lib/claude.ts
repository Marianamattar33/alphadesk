import Anthropic from '@anthropic-ai/sdk';
import type { StockAnalysis } from '@/types/lookup';

const SYSTEM_PROMPT = `You are an institutional equity analyst advising a private investor who uses the Abacus investment framework. The framework has 7 Principles evaluated as PASS, CAUTION, FAIL, or MANUAL.

Rules:
- Write directly to the investor. Be concise and actionable.
- Use exact numbers from the data (price levels, %, P/E, Williams %R value).
- Reference Abacus principles by Roman numeral (Principio I–VII).
- Do NOT start with "This company" or end with "In conclusion".
- Output valid markdown — bold, bullets, and horizontal rules only. No headers with #.

Structural section: 2-3 sentences of flowing prose on the long-term (3-10yr) moat and compounding driver. End with a bolded Key risk line.

Tactical section: structured markdown exactly as specified — Verdict (one-sentence headline call), then Passes/Fails/Watch as bullet lists, then Confirm and Kill as single bolded lines with specific price levels.`;

function buildPrompt(a: StockAnalysis): string {
  const p = (id: number) => a.principles.find(x => x.id === id);
  const priceDiff = ((a.price - a.sma200) / a.sma200) * 100;
  const mcapB = (a.marketCap / 1e9).toFixed(1);
  const ret = a.valuation.possibleReturn.value;

  return `Analyze ${a.ticker} (${a.name}) — ${a.sector} / ${a.industry}

Data:
- Price: $${a.price.toFixed(2)} | Market Cap: $${mcapB}B | Beta: ${a.beta.toFixed(2)}
- Principio I  (Price Target): ${p(1)?.status} — ${p(1)?.headline}
- Principio II (Sales Growth): ${p(2)?.status} — ${p(2)?.headline}
- Principio III (200-Day Rule): ${p(3)?.status} — price ${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(1)}% vs SMA200 ($${a.sma200.toFixed(2)})
- Principio V  (P/E Ratio): ${p(5)?.status} — ${p(5)?.headline}
- Principio VII (Williams %R): ${p(7)?.status} — ${p(7)?.headline}
- RSI(14): ${a.rsi14.toFixed(0)} | EMA50: $${a.ema50.toFixed(2)}
- Fibonacci Golden Zone (61.8–78.6%): ${a.inFibGoldenZone ? `YES — price $${a.price} is inside zone $${a.fibGoldenZoneLow.toFixed(2)}–$${a.fibGoldenZoneHigh.toFixed(2)}` : `No — zone: $${a.fibGoldenZoneLow.toFixed(2)}–$${a.fibGoldenZoneHigh.toFixed(2)}`}
- Forward revenue (current FY est.): ${a.currentYearRevenueEst !== null ? `$${(a.currentYearRevenueEst / 1e9).toFixed(1)}B` : 'N/A (no analyst coverage)'}${a.forwardGrowthRate !== null ? ` | Forward growth: ${a.forwardGrowthRate >= 0 ? '+' : ''}${a.forwardGrowthRate.toFixed(1)}%` : ''}
- 4yr avg net margin: ${a.netMarginAvg4y.toFixed(1)}%
- 8-step projected return: ${ret !== null ? `${ret >= 0 ? '+' : ''}${ret.toFixed(0)}%` : 'N/A (no analyst coverage)'} (based on projected NI × avg P/E)
- Cash runway: ${a.valuation.cashRunway.months > 200 ? '>200 months (strong)' : a.valuation.cashRunway.months.toFixed(0) + ' months'} | Debt/Capital: ${a.valuation.cashRunway.debtToCapital.toFixed(1)}%

Write two investment theses. Wrap each one in its XML tag exactly as shown.

<structural>
[2-3 sentences of prose on the long-term moat and compounding driver.]

**Key risk:** [specific failure condition — one line]
</structural>

<tactical>
**Verdict:** [one-sentence headline call — what to do, not what is true]

**Passes:**
- [Principio I — upside % if applicable]
- [Principio II — forward growth % if applicable]
[omit any principle that does not apply]

**Fails:**
- [Principio III — price % vs SMA200 if applicable]
- [Principio V — P/E if applicable]
[omit any principle that does not apply]

**Watch:**
- [Principio VII — Williams %R value and trend]

**Confirm:** [specific entry trigger with exact price level]
**Kill:** [specific breakdown level with exact price level]
</tactical>`;
}

function extractTag(text: string, tag: string): string {
  const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}

export async function generateThesis(
  analysis: StockAnalysis,
): Promise<{ structural: string; tactical: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      structural: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local.',
      tactical: '',
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildPrompt(analysis) }],
    });

    const text = response.content.find(b => b.type === 'text')?.text ?? '';
    return {
      structural: extractTag(text, 'structural') || 'Structural thesis unavailable.',
      tactical: extractTag(text, 'tactical') || 'Tactical thesis unavailable.',
    };
  } catch (err) {
    console.error('[claude] generateThesis error:', err);
    return {
      structural: 'Thesis generation failed — check Vercel function logs.',
      tactical: '',
    };
  }
}

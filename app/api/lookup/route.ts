import { NextRequest, NextResponse } from 'next/server';
import { analyzeTicker } from '@/lib/analyze';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  if (!ticker) {
    return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
  }
  try {
    const analysis = await analyzeTicker(ticker);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.startsWith('Ticker not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

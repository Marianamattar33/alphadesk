import { NextRequest, NextResponse } from 'next/server';
import { fetchSearchResults } from '@/lib/fmp';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  try {
    const results = await fetchSearchResults(q);
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json([], { status: 200 }); // fail silently — search is best-effort
  }
}

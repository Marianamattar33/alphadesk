import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Normalize dot-tickers in lookup paths (e.g. BRK.B → BRK-B) before Vercel
  // treats the dot as a file extension and 404s the request.
  const match = pathname.match(/^\/lookup\/(.+)$/);
  if (match && match[1].includes('.')) {
    const normalized = match[1].replace(/\./g, '-');
    return NextResponse.redirect(new URL(`/lookup/${normalized}`, req.url), 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/lookup/:path*',
};

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Platform routes (separate auth) ───────────────────────
  if (pathname.startsWith('/platform')) {
    const platformToken = request.cookies.get('platform_token')?.value;
    if (pathname === '/platform/login') {
      if (platformToken) return NextResponse.redirect(new URL('/platform', request.url));
      return NextResponse.next();
    }
    if (!platformToken) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
    return NextResponse.next();
  }

  // ── Admin routes ───────────────────────────────────────────
  const adminToken = request.cookies.get('admin_token')?.value;

  if (pathname === '/login' || pathname.startsWith('/api/')) {
    if (pathname === '/login' && adminToken) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!adminToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

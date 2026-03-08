import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login' || pathname.startsWith('/api/')) {
    // Login page and API proxy routes don't require auth
    if (pathname === '/login' && token) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // All other routes require auth
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';
const PUBLIC_PATHS = ['/login', '/register'];

/**
 * Route protection at the edge.
 * Only checks cookie *presence* for fast redirects – the signature is
 * verified by the backend on every API call, so a forged cookie gets
 * the user nothing but an immediate 401.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next.js internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

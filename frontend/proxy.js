import { NextResponse } from 'next/server';

/**
 * Next.js 16 proxy (formerly middleware): gate the authenticated areas. We
 * only check for the presence of the session cookie here (fast, no DB call);
 * precise role enforcement happens in the server layouts and the API itself.
 */
export function proxy(request) {
  const token = request.cookies.get('academy_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

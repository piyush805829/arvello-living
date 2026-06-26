import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || 'arvello-default-secret-key-at-least-32-chars'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle Admin Page Protections & Redirects
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value;

    if (pathname === '/admin/login') {
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          // Already logged in, redirect to dashboard
          return NextResponse.redirect(new URL('/admin', request.url));
        } catch (_) {
          // Token invalid, clear it and let them log in
          const response = NextResponse.next();
          response.cookies.delete('admin_session');
          return response;
        }
      }
      return NextResponse.next();
    }

    // Protect all other /admin paths (e.g. /admin, /admin/new-article)
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (_) {
      // Invalid token, redirect to login & clear cookie
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // 2. Handle Admin API Protections
  const isAdminApiPath =
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/generate-product') ||
    pathname.startsWith('/api/generate-article') ||
    (pathname.startsWith('/api/articles') && request.method !== 'GET');

  if (isAdminApiPath) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: No token provided' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (_) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/upload/:path*',
    '/api/generate-product/:path*',
    '/api/generate-article/:path*',
    '/api/articles/:path*',
  ],
};

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from login page
    if (session && pathname === '/login') {
      const userRole = (session.user as any).role;
      return NextResponse.redirect(
        new URL(userRole === 'admin' ? '/admin' : '/staff', request.url)
      );
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect staff routes
  if (pathname.startsWith('/staff')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run proxy on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_PATHS = ['/register', '/admin', '/inventory', '/employeedatabase'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  console.log('[Middleware] Running on:', pathname);
  console.log('[Middleware] Host:', request.headers.get('host'));
  console.log('[Middleware] Environment check - NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);

  // Skip middleware for login page, API routes, and static files
  if (
    pathname === '/login' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    console.log('[Middleware] Skipping middleware for:', pathname);
    return NextResponse.next();
  }

  try {
    // Get session token with Vercel-specific configuration
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      // Let NextAuth handle cookie name detection automatically
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
    });

    console.log('[Middleware] Token retrieval result:', {
      hasToken: !!token,
      tokenRole: token?.role,
      tokenEmail: token?.email,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });

    // Check if this is a protected path
    const isProtected = PROTECTED_PATHS.some((protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
    );

    if (isProtected) {
      console.log(`[Middleware] ${pathname} is a protected path`);
      
      // Not logged in? Redirect to login
      if (!token) {
        console.log('[Middleware] No token found. Redirecting to /login');
        const loginUrl = new URL('/login', url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const role = token.role as string;
      console.log('[Middleware] User role:', role);

      // Check role permissions
      if (role === 'employee') {
        console.log('[Middleware] Blocked: employee not allowed. Redirecting to /unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', url));
      } else if (role === 'admin' || role === 'md') {
        console.log('[Middleware] Access granted to', role);
        return NextResponse.next();
      } else {
        console.log('[Middleware] Unknown role:', role, 'Redirecting to /unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', url));
      }
    }

    console.log('[Middleware] Path not protected, allowing access');
    return NextResponse.next();

  } catch (error) {
    console.error('[Middleware] Error getting token:', error);
    
    // Only redirect to login for protected paths on error
    const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
    if (isProtected) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
}

// More specific matcher to avoid conflicts
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized).*)',
  ],
};
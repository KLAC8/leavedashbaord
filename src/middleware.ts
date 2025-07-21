// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_PATHS = ['/register', '/admin', '/inventory', '/employeedatabase'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  console.log('[Middleware] Running on:', pathname);

  // Get session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in? Redirect to login
  if (!token) {
    console.log('[Middleware] No token found. Redirecting to /login');
    return NextResponse.redirect(new URL('/login', url));
  }

  const role = token.role;
  console.log('[Middleware] User role:', role);

  // Check if this is a protected path
  const isProtected = PROTECTED_PATHS.some((protectedPath) =>
    pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
  );

  if (isProtected) {
    console.log(`[Middleware] ${pathname} is a protected path`);
    if (role === 'employee') {
      console.log('[Middleware] Blocked: employee not allowed. Redirecting to /unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', url));
    } else {
      console.log('[Middleware] Access granted to admin/md');
    }
  }

  return NextResponse.next();
}

// Run middleware only on these routes
export const config = {
  matcher: ['/register', '/admin/:path*', '/inventory/:path*', '/employeedatabase/:path*'],
};

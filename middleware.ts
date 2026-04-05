import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the routes that require authentication
const protectedRoutes = ['/dashboard', '/students', '/staff', '/marks', '/fees', '/result', '/settings'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If no session and trying to access a protected route, redirect to login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If session exists and trying to access login page, redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

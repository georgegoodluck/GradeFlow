import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const ROLE_PREFIXES: Record<string, string[]> = {
  '/admin': ['OWNER', 'ADMIN'],
  '/teacher': ['TEACHER'],
  '/student': ['STUDENT'],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  const protectedPrefix = Object.keys(ROLE_PREFIXES).find((p) => path.startsWith(p));

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  if (protectedPrefix && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(path);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  if (protectedPrefix && isLoggedIn) {
    const role = req.auth?.user?.role;
    const allowed = ROLE_PREFIXES[protectedPrefix];
    if (!role || !allowed.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

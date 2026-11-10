// proxy.ts
import NextAuth from "next-auth";
import { auth } from "@/auth"; // Your auth.ts file
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.userType;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isPublicRoute = nextUrl.pathname === "/" || isApiAuthRoute;

  // 1. Allow public routes and API routes
  if (isPublicRoute) return NextResponse.next();

  // 2. If logged in and trying to access /login or /register, send to their portal
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (userType === "student")
        return NextResponse.redirect(new URL("/student", nextUrl));
      if (role === "teacher")
        return NextResponse.redirect(new URL("/teacher", nextUrl));
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 3. If not logged in and trying to access a protected route, send to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 4. Role-based routing (prevent students from accessing /dashboard)
  if (nextUrl.pathname.startsWith("/dashboard") && userType === "student") {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/dashboard") && role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", nextUrl));
  }

  // 5. Prevent teachers from accessing /student
  if (nextUrl.pathname.startsWith("/student") && userType !== "student") {
    if (role === "teacher")
      return NextResponse.redirect(new URL("/teacher", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 6. Prevent students from accessing /teacher
  if (nextUrl.pathname.startsWith("/teacher") && userType === "student") {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

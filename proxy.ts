import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.userType;
  const role = req.auth?.user?.role;

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isPublicRoute =
    nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api");

  // 1. If logged in and trying to access login/register -> route to portal
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

  if (isPublicRoute) return NextResponse.next();

  // 2. Not logged in -> send to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. Strict Role-Based Routing

  // Students cannot access /dashboard or /teacher
  if (
    userType === "student" &&
    (nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/teacher"))
  ) {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }

  // Teachers cannot access /dashboard or /student
  if (
    role === "teacher" &&
    (nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/student"))
  ) {
    return NextResponse.redirect(new URL("/teacher", nextUrl));
  }

  // Owners and Admins cannot access /student or /teacher
  if (userType === "staff" && (role === "owner" || role === "admin")) {
    if (
      nextUrl.pathname.startsWith("/student") ||
      nextUrl.pathname.startsWith("/teacher")
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

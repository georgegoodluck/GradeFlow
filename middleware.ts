import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  // Protect dashboard, teacher, and student routes
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/teacher") ||
    path.startsWith("/student");

  if (isProtected && !token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Optional: Role-based edge routing
  if (token) {
    if (path.startsWith("/dashboard") && token.role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }
    if (path.startsWith("/dashboard") && token.userType === "student") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/student/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/teacher") ||
    path.startsWith("/student");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Only redirect away from dashboard if the user IS authenticated
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

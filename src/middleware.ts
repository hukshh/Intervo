import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "intervo_session"

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  // Define protected and auth-only routes
  const isProtectedPath = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/interview") || 
    pathname.startsWith("/feedback")

  const isAuthPath = pathname === "/login" || pathname === "/signup"

  // 1. Redirect to login if trying to access protected paths without a session cookie
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Redirect to dashboard if trying to access login/signup while already having a session cookie
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/feedback/:path*",
    "/login",
    "/signup",
  ],
}

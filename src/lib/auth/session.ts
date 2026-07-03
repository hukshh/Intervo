import { cookies, headers } from "next/headers"
import { verifyToken } from "./jwt"
import prisma from "@/lib/db/prisma"

export const COOKIE_NAME = "intervo_session"

export interface SessionUser {
  id: string
  fullName: string
  email: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Resolves the current session user by extracting and verifying the JWT cookie.
 * Returns the authenticated user (excluding password) or null if invalid.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  } catch (error) {
    return null
  }
}

/**
 * Sets the HTTP-only secure session cookie with the given JWT token.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  const headersList = await headers()
  
  // Enable the Secure flag in production OR if proxied through an HTTPS tunnel (e.g. localtunnel)
  const isHttps = headersList.get("x-forwarded-proto") === "https"
  const isSecure = process.env.NODE_ENV === "production" || isHttps

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Deletes the session cookie to log the user out.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

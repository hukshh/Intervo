import jwt from "jsonwebtoken"
import { env } from "@/lib/utils/env"

export interface JWTPayload {
  userId: string
  email: string
}

/**
 * Generates a signed JWT token containing user details with a 7-day expiration.
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" })
}

/**
 * Verifies a JWT token and returns its payload if valid, otherwise returns null.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

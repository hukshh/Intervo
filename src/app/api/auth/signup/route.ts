import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import prisma from "@/lib/db/prisma"
import { generateToken } from "@/lib/auth/jwt"
import { setSessionCookie } from "@/lib/auth/session"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // Check duplicate email (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Neon PostgreSQL
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    })

    // Generate JWT token & set HTTP-only cookie
    const token = generateToken({ userId: user.id, email: user.email })
    await setSessionCookie(token)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal database or server error" },
      { status: 500 }
    )
  }
}

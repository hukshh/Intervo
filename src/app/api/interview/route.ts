import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { createInterviewSchema } from "@/lib/interview/validation"
import { SessionStatus, InterviewStage } from "@prisma/client"

/**
 * POST /api/interview
 * Authenticates user, validates payload, and creates a new InterviewSession in PostgreSQL.
 */
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = createInterviewSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { interviewType, experienceLevel } = result.data

    // Create session in Neon database
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        interviewType,
        experienceLevel,
        status: SessionStatus.CREATED,
        currentStage: InterviewStage.INTRODUCTION,
        startedAt: new Date(),
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({ sessionId: session.id }, { status: 201 })
  } catch (error) {
    console.error("Failed to create interview session:", error)
    return NextResponse.json(
      { error: "Internal database or server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/interview
 * Authenticates user and returns all interview sessions for the current user, newest first.
 */
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        interviewType: true,
        experienceLevel: true,
        status: true,
        currentStage: true,
        startedAt: true,
        endedAt: true,
        duration: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ sessions }, { status: 200 })
  } catch (error) {
    console.error("Failed to retrieve interview sessions:", error)
    return NextResponse.json(
      { error: "Internal database or server error" },
      { status: 500 }
    )
  }
}

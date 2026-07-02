import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { z } from "zod"
import { SessionStatus } from "@prisma/client"

const updateSessionSchema = z.object({
  status: z.nativeEnum(SessionStatus),
  duration: z.number().optional(),
})

/**
 * GET /api/interview/[sessionId]
 * Authenticates user, verifies ownership of the session, and returns details.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Verify ownership
    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ session }, { status: 200 })
  } catch (error) {
    console.error("Failed to retrieve single session details:", error)
    return NextResponse.json(
      { error: "Internal database or server error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/interview/[sessionId]
 * Authenticates user, verifies ownership, and updates session status (lifecycle transitions).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const result = updateSessionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, duration } = result.data

    const updateData: any = { status }
    if (status === SessionStatus.COMPLETED || status === SessionStatus.ABANDONED) {
      updateData.endedAt = new Date()
      if (duration !== undefined) {
        updateData.duration = duration
      }
    }

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: updateData,
    })

    return NextResponse.json({ session: updatedSession }, { status: 200 })
  } catch (error) {
    console.error("Failed to update session status:", error)
    return NextResponse.json(
      { error: "Internal database or server error" },
      { status: 500 }
    )
  }
}

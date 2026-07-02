import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"

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

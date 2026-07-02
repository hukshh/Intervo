import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { z } from "zod"
import { MessageRole } from "@prisma/client"

const chatMessageSchema = z.object({
  role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
  content: z.string().min(1),
})

/**
 * POST /api/interview/[sessionId]/chat
 * Authenticates user, verifies ownership, registers candidate transcript,
 * generates a placeholder response, and stores both sequentially.
 */
export async function POST(
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
    const result = chatMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { role, content } = result.data

    // 1. Resolve current maximum sequence value for messages in this session
    const lastMessage = await prisma.conversationMessage.findFirst({
      where: { sessionId },
      orderBy: { sequence: "desc" },
    })
    const nextSequence = lastMessage ? lastMessage.sequence + 1 : 1

    // 2. Persist message and generate placeholder if role === USER
    if (role === MessageRole.USER) {
      // Save user transcript message
      await prisma.conversationMessage.create({
        data: {
          sessionId,
          sequence: nextSequence,
          role: MessageRole.USER,
          content,
        },
      })

      // Generate assistant placeholder
      const assistantPlaceholder = "Thank you for your response. The interview engine will process this conversation in the next phase."
      
      // Save assistant placeholder message
      await prisma.conversationMessage.create({
        data: {
          sessionId,
          sequence: nextSequence + 1,
          role: MessageRole.ASSISTANT,
          content: assistantPlaceholder,
        },
      })

      // Increment InterviewSession messageCount by 2
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 2 },
        },
      })

      return NextResponse.json(
        {
          role: "ASSISTANT",
          content: assistantPlaceholder,
        },
        { status: 200 }
      )
    }

    // For other roles (e.g. system setup), store single message and increment counter
    const storedMsg = await prisma.conversationMessage.create({
      data: {
        sessionId,
        sequence: nextSequence,
        role,
        content,
      },
    })

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        messageCount: { increment: 1 },
      },
    })

    return NextResponse.json(
      {
        role: storedMsg.role,
        content: storedMsg.content,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Chat persistence error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

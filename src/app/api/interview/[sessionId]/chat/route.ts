import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { z } from "zod"
import { MessageRole } from "@prisma/client"

// Zod validation matching the official OpenAI Chat Completions request format
const openaiMessageSchema = z.object({
  role: z.string(),
  content: z.string().min(1),
})

const chatCompletionsSchema = z.object({
  messages: z.array(openaiMessageSchema).min(1),
})

/**
 * POST /api/interview/[sessionId]/chat
 * Implements the official OpenAI-compatible Chat Completions endpoint.
 * Accepts { messages } and returns { choices: [ { message } ] }.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const body = await request.json()
    const result = chatCompletionsSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { messages } = result.data

    // Locate the user's latest message in the transcript stream
    const userMessages = messages.filter((m) => m.role === "user")
    const lastUserMessage = userMessages[userMessages.length - 1]

    const assistantPlaceholder = "Thank you for your response. The interview engine will process this conversation in the next phase."

    if (lastUserMessage && lastUserMessage.content) {
      // 1. Get current maximum sequence number for this session's messages
      const lastMessage = await prisma.conversationMessage.findFirst({
        where: { sessionId },
        orderBy: { sequence: "desc" },
      })
      const nextSequence = lastMessage ? lastMessage.sequence + 1 : 1

      // 2. Persist the USER message
      await prisma.conversationMessage.create({
        data: {
          sessionId,
          sequence: nextSequence,
          role: MessageRole.USER,
          content: lastUserMessage.content,
        },
      })

      // 3. Persist the ASSISTANT placeholder message
      await prisma.conversationMessage.create({
        data: {
          sessionId,
          sequence: nextSequence + 1,
          role: MessageRole.ASSISTANT,
          content: assistantPlaceholder,
        },
      })

      // 4. Increment the messageCount in InterviewSession by 2
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 2 },
        },
      })
    }

    // Return the official OpenAI completions structure back to Vapi
    return NextResponse.json(
      {
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: assistantPlaceholder,
            },
            finish_reason: "stop",
          },
        ],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Chat completions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

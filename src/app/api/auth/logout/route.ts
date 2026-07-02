import { NextResponse } from "next/server"
import { deleteSessionCookie } from "@/lib/auth/session"

export async function POST() {
  try {
    await deleteSessionCookie()
    return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}

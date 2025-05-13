import { type NextRequest, NextResponse } from "next/server"
import { checkIsAdmin } from "@/lib/admin-server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ isAdmin: false }, { status: 400 })
    }

    const isAdmin = await checkIsAdmin(username)

    // Add a random delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Error verifying admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}

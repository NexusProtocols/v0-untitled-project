import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { hwid, username } = await request.json()

    if (!hwid || !username) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // In a production environment, we would securely store this
    // For now, we're storing in localStorage (client will handle this)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking HWID:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

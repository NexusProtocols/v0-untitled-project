import { NextResponse } from "next/server"
import { saveUserProgress, getUserProgress } from "@/utils/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, gatewayId, progress } = body

    if (!userId || !gatewayId || !progress) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID, Gateway ID, and progress data are required",
        },
        { status: 400 },
      )
    }

    await saveUserProgress(userId, gatewayId, progress)

    return NextResponse.json({
      success: true,
      message: "Progress saved successfully",
    })
  } catch (error) {
    console.error("Error saving progress:", error)
    return NextResponse.json({ success: false, error: "Failed to save progress" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const gatewayId = searchParams.get("gatewayId")

    if (!userId || !gatewayId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and Gateway ID are required",
        },
        { status: 400 },
      )
    }

    const progress = await getUserProgress(userId, gatewayId)

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch progress" }, { status: 500 })
  }
}

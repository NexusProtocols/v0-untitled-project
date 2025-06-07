import { NextResponse } from "next/server"
import { saveCompletedTasks, getCompletedTasks } from "@/utils/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, gatewayId, tasks } = body

    if (!userId || !gatewayId || !tasks) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID, Gateway ID, and tasks are required",
        },
        { status: 400 },
      )
    }

    await saveCompletedTasks(userId, gatewayId, tasks)

    return NextResponse.json({
      success: true,
      message: "Tasks saved successfully",
    })
  } catch (error) {
    console.error("Error saving tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to save tasks" }, { status: 500 })
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

    const tasks = await getCompletedTasks(userId, gatewayId)

    return NextResponse.json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get tracking data from the request body
    const { gatewayId, creatorId, action, taskId } = await request.json()

    if (!gatewayId || !creatorId || !action) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate action type
    const validActions = ["visit", "task_complete", "gateway_complete"]
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action type" }, { status: 400 })
    }

    // If action is task_complete, taskId is required
    if (action === "task_complete" && !taskId) {
      return NextResponse.json(
        { success: false, message: "taskId is required for task_complete action" },
        { status: 400 },
      )
    }

    // In a real implementation, you would store this data in a database
    // For now, we'll just log it
    console.log(`Gateway tracking: ${action} for gateway ${gatewayId} by creator ${creatorId}`)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Tracking data recorded successfully",
    })
  } catch (error) {
    console.error("Error tracking gateway:", error)
    return NextResponse.json({ success: false, message: "An error occurred while tracking gateway" }, { status: 500 })
  }
}

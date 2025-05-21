import { type NextRequest, NextResponse } from "next/server"
import { gatewayDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, creatorId, sessionId, action, taskId, userData } = await request.json()

    if (!gatewayId || !action) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }

    // Log the analytics event
    await gatewayDb.logGatewayAnalytics({
      id: uuidv4(),
      gatewayId,
      sessionId: sessionId || null,
      userId: null, // We could add user ID if available
      action,
      taskId: taskId || null,
      timestamp: new Date().toISOString(),
      metadata: {
        creatorId,
        userData: userData || {},
        userAgent: request.headers.get("user-agent") || "",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
      },
    })

    // If this is a task completion, update the session if we have a session ID
    if (action === "task_complete" && taskId && sessionId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gateway/session?sessionId=${sessionId}`)
        const data = await response.json()

        if (data.success && data.session) {
          const completedTasks = [...(data.session.completedTasks || [])]

          if (!completedTasks.includes(taskId)) {
            completedTasks.push(taskId)

            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gateway/session`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId,
                completedTasks,
                currentStage: data.session.currentStage,
              }),
            })
          }
        }
      } catch (error) {
        console.error("Error updating session:", error)
        // Continue even if session update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    })
  } catch (error) {
    console.error("Error tracking gateway event:", error)
    return NextResponse.json({ success: false, message: "An error occurred while tracking the event" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { sessionDb, gatewayDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, creatorId, token, sessionId } = await request.json()

    if (!gatewayId || !creatorId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Log the task completion in analytics
    await gatewayDb.logGatewayAnalytics({
      id: uuidv4(),
      gatewayId,
      sessionId,
      userId: null,
      action: "task_complete",
      taskId: "task-4",
      timestamp: new Date().toISOString(),
      metadata: {
        creatorId,
        token,
        userAgent: request.headers.get("user-agent") || "",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
      },
    })

    // If we have a session ID, update the session with the completed task
    if (sessionId) {
      try {
        // Get current session
        const session = await sessionDb.getGatewaySession(sessionId)

        if (session) {
          // Add task-4 to completed tasks if not already there
          const completedTasks = session.completedTasks || []
          if (!completedTasks.includes("task-4")) {
            completedTasks.push("task-4")
          }

          // Update session
          await sessionDb.saveGatewaySession({
            id: sessionId,
            completedTasks,
            updatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error updating session:", error)
        // Continue even if session update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Task completed successfully",
    })
  } catch (error) {
    console.error("Error processing task redirect:", error)
    return NextResponse.json({ success: false, error: "An error occurred while processing the task" }, { status: 500 })
  }
}

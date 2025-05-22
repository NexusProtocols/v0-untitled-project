import { type NextRequest, NextResponse } from "next/server"
import { gatewayDb, sessionDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, creatorId, sessionId, action, taskId, userData } = await request.json()

    if (!gatewayId || !action) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }

    console.log(`Gateway track: ${action} for task ${taskId || "unknown"} in session ${sessionId || "unknown"}`)

    // Log the analytics event
    try {
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
    } catch (analyticsError) {
      console.error("Error logging analytics (non-fatal):", analyticsError)
      // Continue even if analytics logging fails
    }

    // If this is a task completion, update the session if we have a session ID
    if (action === "task_complete" && taskId && sessionId) {
      try {
        // Get current session directly from the database
        const session = await sessionDb.getGatewaySession(sessionId)

        if (session) {
          // Add taskId to completed tasks if not already there
          const completedTasks = [...(session.completedTasks || [])]

          if (!completedTasks.includes(taskId)) {
            completedTasks.push(taskId)

            // Update session with new completed tasks
            await sessionDb.saveGatewaySession({
              id: sessionId,
              completedTasks,
              currentStage: session.currentStage,
              updatedAt: new Date().toISOString(),
            })

            console.log(`Updated session ${sessionId} with completed task ${taskId}`)
          }
        } else {
          console.warn(`Session ${sessionId} not found for task completion`)
        }
      } catch (sessionError) {
        console.error("Error updating session:", sessionError)
        // Continue even if session update fails, but return the error in the response
        return NextResponse.json({
          success: true,
          message: "Event tracked successfully, but session update failed",
          error: sessionError.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    })
  } catch (error) {
    console.error("Error tracking gateway event:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while tracking the event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

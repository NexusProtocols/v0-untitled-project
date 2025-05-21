import { type NextRequest, NextResponse } from "next/server"
import { sessionDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, userId, completedTasks, currentStage } = await request.json()

    if (!gatewayId) {
      return NextResponse.json({ success: false, message: "Gateway ID is required" }, { status: 400 })
    }

    // Generate a session ID if not provided
    const sessionId = uuidv4()

    // Save gateway session
    const session = await sessionDb.saveGatewaySession({
      id: sessionId,
      gatewayId,
      userId: userId || null,
      completedTasks: completedTasks || [],
      currentStage: currentStage || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    console.error("Error creating gateway session:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the gateway session" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Session ID is required" }, { status: 400 })
    }

    // Get gateway session
    const session = await sessionDb.getGatewaySession(sessionId)

    if (!session) {
      return NextResponse.json({ success: false, message: "Session not found or expired" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error("Error fetching gateway session:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the gateway session" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, completedTasks, currentStage } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Session ID is required" }, { status: 400 })
    }

    // Update gateway session
    const session = await sessionDb.saveGatewaySession({
      id: sessionId,
      completedTasks,
      currentStage,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error("Error updating gateway session:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the gateway session" },
      { status: 500 },
    )
  }
}

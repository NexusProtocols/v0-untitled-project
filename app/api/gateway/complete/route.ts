import { type NextRequest, NextResponse } from "next/server"
import { gatewayDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, sessionId, userId } = await request.json()

    if (!gatewayId) {
      return NextResponse.json({ success: false, message: "Gateway ID is required" }, { status: 400 })
    }

    // Track gateway completion
    await gatewayDb.trackGatewayActivity(gatewayId, "completion")

    // Log detailed analytics
    await gatewayDb.logGatewayAnalytics({
      id: uuidv4(),
      gatewayId,
      sessionId,
      userId: userId || null,
      action: "completion",
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get("user-agent") || "",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
      },
    })

    // Generate a completion token
    const completionToken = uuidv4()

    return NextResponse.json({
      success: true,
      token: completionToken,
    })
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while completing the gateway" },
      { status: 500 },
    )
  }
}

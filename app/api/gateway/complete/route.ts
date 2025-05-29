import { type NextRequest, NextResponse } from "next/server"
import { gatewayDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, sessionId } = await request.json()

    if (!gatewayId) {
      return NextResponse.json({ success: false, message: "Gateway ID is required" }, { status: 400 })
    }

    // Generate a completion token
    const token = uuidv4()

    // Track gateway completion
    try {
      await gatewayDb.trackGatewayActivity(gatewayId, "completion")
    } catch (error) {
      console.error("Error tracking gateway completion:", error)
      // Continue even if tracking fails
    }

    // Log the completion in analytics
    try {
      await gatewayDb.logGatewayAnalytics({
        id: uuidv4(),
        gatewayId,
        sessionId: sessionId || null,
        userId: null,
        action: "gateway_complete",
        taskId: null,
        timestamp: new Date().toISOString(),
        metadata: {
          token,
          userAgent: request.headers.get("user-agent") || "",
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
        },
      })
    } catch (error) {
      console.error("Error logging gateway completion:", error)
      // Continue even if logging fails
    }

    // Get the gateway to check reward type
    try {
      const gateway = await gatewayDb.getGatewayById(gatewayId)

      if (!gateway) {
        return NextResponse.json({ success: false, message: "Gateway not found" }, { status: 404 })
      }

      // Return success with token
      return NextResponse.json({
        success: true,
        message: "Gateway completed successfully",
        token,
        rewardType: gateway.reward?.type || "unknown",
        rewardContent: gateway.reward?.type === "paste" ? gateway.reward?.content : null,
        rewardUrl: gateway.reward?.type === "url" ? gateway.reward?.url : null,
      })
    } catch (error) {
      console.error("Error getting gateway for completion:", error)
      // Return success with token even if gateway fetch fails
      return NextResponse.json({
        success: true,
        message: "Gateway completed successfully, but reward details could not be fetched",
        token,
      })
    }
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while completing the gateway", error: error.message },
      { status: 500 },
    )
  }
}

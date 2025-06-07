// Update the route to handle gateway completion without requiring secure auth
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, token, completed, stages, currentStage } = await request.json()

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Missing gateway ID" }, { status: 400 })
    }

    // For client-side storage, we'll just generate a completion token
    // In a real implementation, you would validate against a database

    // Generate a completion token
    const completionToken = generateCompletionToken(gatewayId)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Gateway completed successfully",
      token: completionToken,
      gatewayId,
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while completing the gateway" },
      { status: 500 },
    )
  }
}

// Helper function to generate a completion token
function generateCompletionToken(gatewayId: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${gatewayId}-${timestamp}-${randomString}`
}

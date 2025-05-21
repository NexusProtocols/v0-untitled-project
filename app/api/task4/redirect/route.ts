import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const gatewayId = searchParams.get("gateway") || ""
    const creatorId = searchParams.get("creator") || ""
    const token = searchParams.get("token") || ""

    if (!gatewayId || !token) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Validate token
    const isValidToken = validateToken(token, gatewayId)

    if (!isValidToken) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    // Store completion in session storage
    try {
      const sessionKey = `gateway_${gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")

      // Mark task 4 as completed
      progress.completedTasks = progress.completedTasks || []
      if (!progress.completedTasks.includes("task-4")) {
        progress.completedTasks.push("task-4")
      }

      // Set expiration time (15 minutes from now)
      progress.expiresAt = Date.now() + 15 * 60 * 1000

      sessionStorage.setItem(sessionKey, JSON.stringify(progress))
    } catch (error) {
      console.error("Error storing completion in sessionStorage:", error)
    }

    // Redirect back to gateway
    const redirectUrl = `/gateway/${gatewayId}?creator=${creatorId}&token=${token}&task=4&completed=true`
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Error processing redirect:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while processing the redirect" },
      { status: 500 },
    )
  }
}

// Validate token
function validateToken(token: string, gatewayId: string): boolean {
  try {
    // In a real implementation, you would validate the token against a database
    // For now, we'll just check if it's a valid timestamp within the last hour
    const timestamp = Number.parseInt(token, 10)
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    return !isNaN(timestamp) && timestamp > oneHourAgo && timestamp <= now
  } catch (error) {
    return false
  }
}

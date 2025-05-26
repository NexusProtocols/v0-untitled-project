import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { key, hwid, scriptId, gameId } = await request.json()

    // Validate required parameters
    if (!key) {
      return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 })
    }

    // Check if request is from Roblox
    const userAgent = headers().get("user-agent") || ""
    const isRoblox = userAgent.includes("Roblox") || request.headers.get("Roblox-Id")

    // Get stored keys from localStorage (in production this would be a database)
    // For Roblox requests, we need to handle differently since localStorage isn't available
    let storedKeys = []

    if (isRoblox) {
      // For Roblox requests, validate against server-side storage
      // This is a simplified example - in production use a database
      const validKeys = process.env.VALID_KEYS ? process.env.VALID_KEYS.split(",") : []
      const keyExists = validKeys.includes(key)

      if (!keyExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid license! Script features will be disabled.",
            code: "INVALID_LICENSE",
          },
          { status: 403 },
        )
      }

      // If scriptId is provided, validate it's the correct script
      if (scriptId) {
        // In production, check if this key is valid for this specific script
        // For now, we'll assume it's valid
      }

      return NextResponse.json({
        success: true,
        data: {
          keyType: "premium",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageCount: 1,
          maxUsage: 5,
          scriptAccess: true,
        },
      })
    } else {
      // For web requests, use the existing validation logic
      try {
        // In a real implementation, this would be fetched from a database
        storedKeys = typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("nexus_keys") || "[]") : []
      } catch (error) {
        console.error("Error parsing stored keys:", error)
        storedKeys = []
      }

      // Mock key validation for initial deployment
      const isValid = key && key.startsWith("NEXUS-")

      return NextResponse.json({
        success: true,
        valid: isValid,
        message: isValid ? "Key is valid" : "Invalid key",
      })
    }
  } catch (error) {
    console.error("Error validating key:", error)
    return NextResponse.json({ success: false, error: "An error occurred while validating the key" }, { status: 500 })
  }
}

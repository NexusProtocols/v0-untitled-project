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

      // Find the key
      const keyData = storedKeys.find((k: any) => k.key === key)

      if (!keyData) {
        return NextResponse.json({ success: false, error: "Invalid key" }, { status: 403 })
      }

      // Check if key is expired
      if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
        return NextResponse.json({ success: false, error: "Key has expired" }, { status: 403 })
      }

      // Check if key has reached max usage
      if (keyData.maxUsage && keyData.usageCount >= keyData.maxUsage) {
        return NextResponse.json({ success: false, error: "Key has reached maximum usage" }, { status: 403 })
      }

      // Check HWID if provided and required
      if (hwid && keyData.hwid && keyData.hwid !== hwid) {
        return NextResponse.json({ success: false, error: "Key is bound to another device" }, { status: 403 })
      }

      // If scriptId is provided, check if key has access to this script
      if (scriptId && keyData.scriptAccess === false) {
        return NextResponse.json({ success: false, error: "Key does not have access to this script" }, { status: 403 })
      }

      // Update usage count
      keyData.usageCount = (keyData.usageCount || 0) + 1

      // If HWID is provided and key is not bound, bind it
      if (hwid && !keyData.hwid) {
        keyData.hwid = hwid
      }

      // Update key in localStorage
      localStorage.setItem("nexus_keys", JSON.stringify(storedKeys.map((k: any) => (k.key === key ? keyData : k))))

      return NextResponse.json({
        success: true,
        data: {
          keyType: keyData.type || "standard",
          expiresAt: keyData.expiresAt,
          usageCount: keyData.usageCount,
          maxUsage: keyData.maxUsage || Number.POSITIVE_INFINITY,
          scriptAccess: keyData.scriptAccess !== false,
        },
      })
    }
  } catch (error) {
    console.error("Error validating key:", error)
    return NextResponse.json({ success: false, error: "An error occurred while validating the key" }, { status: 500 })
  }
}

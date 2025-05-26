import { type NextRequest, NextResponse } from "next/server"
import { decryptData, generateEncryptionKey } from "@/lib/ad-utils"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    // Get the token from the query parameters
    const token = request.nextUrl.searchParams.get("token")

    // Get the API key from the authorization header
    const apiKey = request.headers.get("x-api-key")

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 401 })
    }

    // Verify the API key
    // In a real implementation, this would check against a database
    // For now, we'll use a simple check against environment variables or stored keys
    const creatorApiKeys = process.env.CREATOR_API_KEYS ? JSON.parse(process.env.CREATOR_API_KEYS) : {}
    const creatorId = Object.keys(creatorApiKeys).find((id) => creatorApiKeys[id] === apiKey)

    if (!creatorId) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 })
    }

    // Decrypt the token
    try {
      const encryptionKey = generateEncryptionKey(env.API_ENCRYPTION_KEY)
      const decryptedData = decryptData(token, encryptionKey)
      const sessionData = JSON.parse(decryptedData)

      // Check if token is expired
      if (sessionData.expiresAt < Date.now()) {
        return NextResponse.json({ success: false, error: "Token has expired" }, { status: 401 })
      }

      // Check if the token belongs to the creator
      if (sessionData.creatorId && sessionData.creatorId !== creatorId) {
        return NextResponse.json({ success: false, error: "Token does not belong to this creator" }, { status: 403 })
      }

      // Return the session data
      return NextResponse.json({
        success: true,
        data: {
          CreatorId: sessionData.creatorId,
          GatewayID: sessionData.gatewayId,
          UserHWID: sessionData.hwid || "unknown",
          UserIP: sessionData.ip,
          AdLevel: sessionData.adLevel || 3,
          TaskLevel: sessionData.taskLevel || 2,
          TotalStages: sessionData.totalStages || 4,
          TokenCreatedDate: new Date(sessionData.timestamp).toISOString(),
          TokenExpirationDate: new Date(sessionData.expiresAt).toISOString(),
          Completed: sessionData.completed || false,
        },
      })
    } catch (error) {
      console.error("Error decrypting token:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ success: false, error: "An error occurred while verifying the token" }, { status: 500 })
  }
}

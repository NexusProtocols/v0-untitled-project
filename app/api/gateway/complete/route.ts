import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { decryptData, encryptData, generateEncryptionKey } from "@/lib/ad-utils"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, token, completed, stages, currentStage } = await request.json()

    if (!gatewayId || !token) {
      return NextResponse.json({ success: false, error: "Gateway ID and token are required" }, { status: 400 })
    }

    // Get client IP and user agent
    const ip = headers().get("x-forwarded-for") || request.ip || "unknown"
    const userAgent = headers().get("user-agent") || "unknown"

    try {
      // Decrypt the existing token
      const encryptionKey = generateEncryptionKey(env.API_ENCRYPTION_KEY)
      const decryptedData = decryptData(token, encryptionKey)
      const sessionData = JSON.parse(decryptedData)

      // Check if token is expired
      if (sessionData.expiresAt < Date.now()) {
        return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
      }

      // Get the gateway data
      // In a real implementation, this would fetch from a database
      const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const gateway = gateways.find((g: any) => g.id === gatewayId)

      if (!gateway) {
        return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 })
      }

      // Update the session data
      const updatedSessionData = {
        ...sessionData,
        completed: completed || false,
        gatewayId,
        creatorId: gateway.creatorId,
        adLevel: gateway.settings?.adLevel || 3,
        taskLevel: gateway.settings?.taskLevel || 2,
        totalStages: stages || 4,
        currentStage: currentStage || 0,
        completedAt: Date.now(),
        // Extend expiration time
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      }

      // Encrypt the updated session data
      const newToken = encryptData(JSON.stringify(updatedSessionData), encryptionKey)

      return NextResponse.json({
        success: true,
        message: "Gateway completed successfully",
        token: newToken,
      })
    } catch (error) {
      console.error("Error processing token:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while completing the gateway" },
      { status: 500 },
    )
  }
}

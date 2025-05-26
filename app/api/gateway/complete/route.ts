import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Secret key for token encryption (in a real app, this would be in environment variables)
const SECRET_KEY = process.env.API_ENCRYPTION_KEY || "your-secret-key-for-encryption-minimum-32-chars"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gatewayId, completed, stages, currentStage } = body

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    // Generate a token with gateway completion data
    const tokenData = {
      gatewayId,
      completed,
      timestamp: Date.now(),
      stages,
      currentStage,
      userAgent: request.headers.get("user-agent") || "unknown",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    }

    // Encrypt the token
    const token = encryptToken(tokenData)

    return NextResponse.json({
      success: true,
      message: "Gateway completed successfully",
      token,
    })
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while completing the gateway" },
      { status: 500 },
    )
  }
}

// Function to encrypt token data
function encryptToken(data: any): string {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data)

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16)

    // Create cipher using AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY.slice(0, 32)), iv)

    // Encrypt the data
    let encrypted = cipher.update(jsonData, "utf8", "base64")
    encrypted += cipher.final("base64")

    // Combine IV and encrypted data
    const token = iv.toString("hex") + ":" + encrypted

    return token
  } catch (error) {
    console.error("Error encrypting token:", error)
    throw new Error("Failed to encrypt token")
  }
}

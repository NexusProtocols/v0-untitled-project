import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Secret key for token decryption (in a real app, this would be in environment variables)
const SECRET_KEY = process.env.API_ENCRYPTION_KEY || "your-secret-key-for-encryption-minimum-32-chars"

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

    // Verify the API key (in a real app, this would check against a database)
    const validApiKeys = process.env.CREATOR_API_KEYS?.split(",") || ["test-api-key-1", "test-api-key-2"]

    if (!validApiKeys.includes(apiKey)) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 })
    }

    // Decrypt the token
    const decryptedData = decryptToken(token)

    if (!decryptedData) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 })
    }

    // Check if the token is expired (24 hours)
    const tokenTimestamp = decryptedData.timestamp
    const currentTime = Date.now()
    const tokenAge = currentTime - tokenTimestamp

    if (tokenAge > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ success: false, error: "Token expired" }, { status: 400 })
    }

    // Return the decrypted data
    return NextResponse.json({
      success: true,
      data: {
        CreatorId: decryptedData.creatorId || "unknown",
        GatewayID: decryptedData.gatewayId,
        UserHWID: "not-implemented", // In a real app, this would be the actual HWID
        UserIP: decryptedData.ip,
        AdLevel: 3, // Default ad level
        TaskLevel: 2, // Default task level
        TotalStages: decryptedData.stages || 5,
        TokenCreatedDate: new Date(tokenTimestamp).toISOString(),
        TokenExpirationDate: new Date(tokenTimestamp + 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ success: false, error: "An error occurred while verifying the token" }, { status: 500 })
  }
}

// Function to decrypt token
function decryptToken(token: string): any {
  try {
    // Split the token into IV and encrypted data
    const parts = token.split(":")
    if (parts.length !== 2) {
      throw new Error("Invalid token format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const encrypted = parts[1]

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SECRET_KEY.slice(0, 32)), iv)

    // Decrypt the data
    let decrypted = decipher.update(encrypted, "base64", "utf8")
    decrypted += decipher.final("utf8")

    // Parse the JSON data
    return JSON.parse(decrypted)
  } catch (error) {
    console.error("Error decrypting token:", error)
    return null
  }
}

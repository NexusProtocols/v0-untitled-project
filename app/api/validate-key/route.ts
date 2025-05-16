import { NextResponse } from "next/server"
import crypto from "crypto"
import { isValidKeyFormat } from "@/lib/crypto"
import { generateHWID } from "@/lib/hwid"

// Simulated database of keys (in production, use a real database)
const keyDatabase: Record<string, any> = {}

// Initialize some test keys
if (Object.keys(keyDatabase).length === 0) {
  const testKeys = [
    {
      key: "NEXUS-1234-5678-ABCD",
      hwid: generateHWID(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 0,
      maxUsage: 5,
      keyType: "premium",
      gatewayId: "gateway-123456",
      scriptId: "script-123456",
      isValid: true,
    },
  ]

  testKeys.forEach((keyData) => {
    keyDatabase[keyData.key] = keyData
  })
}

export async function POST(request: Request) {
  try {
    const { key, hwid, gameId } = await request.json()

    if (!key) {
      return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 })
    }

    // Check key format
    if (!isValidKeyFormat(key)) {
      return NextResponse.json({ success: false, error: "Invalid key format" }, { status: 400 })
    }

    // Check if key exists in database
    if (!keyDatabase[key]) {
      return NextResponse.json({ success: false, error: "Key not found" }, { status: 404 })
    }

    const keyData = keyDatabase[key]

    // Check if key is valid
    if (!keyData.isValid) {
      return NextResponse.json({ success: false, error: "Key is invalid or revoked" }, { status: 403 })
    }

    // Check if key has expired
    if (new Date(keyData.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: "Key has expired" }, { status: 403 })
    }

    // Check if key has reached max usage
    if (keyData.usageCount >= keyData.maxUsage) {
      return NextResponse.json({ success: false, error: "Key has reached maximum usage" }, { status: 403 })
    }

    // Check HWID if provided and HWID lock is enabled
    if (hwid && keyData.hwid && keyData.hwid !== hwid) {
      // Log the HWID mismatch for analysis
      console.warn(`HWID mismatch for key ${key}: expected ${keyData.hwid}, got ${hwid}`)

      // Update the database with the HWID attempt
      keyData.hwidAttempts = keyData.hwidAttempts || []
      keyData.hwidAttempts.push({
        hwid,
        timestamp: new Date().toISOString(),
        gameId: gameId || "unknown",
      })

      return NextResponse.json(
        {
          success: false,
          error: "HWID mismatch. This key is locked to another device.",
        },
        { status: 403 },
      )
    }

    // Update usage count
    keyData.usageCount += 1
    keyData.lastUsed = new Date().toISOString()

    // If HWID is not set yet, set it now
    if (hwid && !keyData.hwid) {
      keyData.hwid = hwid
    }

    // Update usage logs
    keyData.usageLogs = keyData.usageLogs || []
    keyData.usageLogs.push({
      timestamp: new Date().toISOString(),
      hwid: hwid || "unknown",
      gameId: gameId || "unknown",
    })

    // In a real implementation, you would save these changes to a database
    keyDatabase[key] = keyData

    // Return success with key details
    return NextResponse.json({
      success: true,
      message: "Key validated successfully",
      data: {
        keyType: keyData.keyType,
        expiresAt: keyData.expiresAt,
        usageCount: keyData.usageCount,
        maxUsage: keyData.maxUsage,
        createdAt: keyData.createdAt,
        // Generate a secure session token
        sessionToken: crypto.randomBytes(32).toString("hex"),
        // Don't return sensitive data like HWID to the client
      },
    })
  } catch (error) {
    console.error("Error validating key:", error)
    return NextResponse.json({ success: false, error: "Failed to validate key" }, { status: 500 })
  }
}

// Admin-only route to get all keys (would require authentication in production)
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: keyDatabase,
    })
  } catch (error) {
    console.error("Error getting keys:", error)
    return NextResponse.json({ success: false, error: "Failed to get keys" }, { status: 500 })
  }
}

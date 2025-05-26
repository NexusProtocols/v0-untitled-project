import { NextResponse } from "next/server"
import crypto from "crypto"
import { generateHWID } from "@/lib/hwid"

// Simulated database for generated keys (use a real database in production)
const generatedKeys: Record<string, any> = {}

export async function POST(request: Request) {
  try {
    const {
      prefix = "NEXUS",
      scriptId,
      gatewayId,
      keyType = "standard",
      duration = 7, // days
      maxUses = 1,
      hwidLock = true,
    } = await request.json()

    if (!scriptId) {
      return NextResponse.json({ success: false, error: "Script ID is required" }, { status: 400 })
    }

    // Generate a cryptographically secure key
    const segment1 = crypto.randomBytes(2).toString("hex").toUpperCase()
    const segment2 = crypto.randomBytes(2).toString("hex").toUpperCase()
    const segment3 = crypto.randomBytes(2).toString("hex").toUpperCase()

    const key = `${prefix}-${segment1}-${segment2}-${segment3}`

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + duration)

    // Generate HWID if HWID lock is enabled
    const hwid = hwidLock ? generateHWID() : null

    // Store the key in the database
    const keyData = {
      key,
      scriptId,
      gatewayId,
      keyType,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      usageCount: 0,
      maxUses,
      hwid,
      hwidLock,
      isValid: true,
    }

    // In a real implementation, you would save this to a database
    generatedKeys[key] = keyData

    return NextResponse.json({
      success: true,
      message: "Key generated successfully",
      data: {
        key,
        expiresAt: keyData.expiresAt,
        keyType,
        maxUses,
      },
    })
  } catch (error) {
    console.error("Error generating key:", error)
    return NextResponse.json({ success: false, error: "Failed to generate key" }, { status: 500 })
  }
}

// Admin-only route to get all generated keys (would require authentication in production)
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: generatedKeys,
    })
  } catch (error) {
    console.error("Error getting generated keys:", error)
    return NextResponse.json({ success: false, error: "Failed to get generated keys" }, { status: 500 })
  }
}

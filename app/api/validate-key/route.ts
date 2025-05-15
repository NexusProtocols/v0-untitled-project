import { NextResponse } from "next/server"
import { isValidKeyFormat } from "@/lib/crypto"

export async function POST(request: Request) {
  try {
    const { key, hwid } = await request.json()

    if (!key || !hwid) {
      return NextResponse.json({ success: false, error: "Key and HWID are required" }, { status: 400 })
    }

    // Check key format
    if (!isValidKeyFormat(key)) {
      return NextResponse.json({ success: false, error: "Invalid key format" }, { status: 400 })
    }

    // Get keys from localStorage (in a real app, this would be from a database)
    // For this example, we'll simulate the validation process

    // In a real implementation, you would:
    // 1. Query the database for the key
    // 2. Check if it's expired
    // 3. Verify HWID if HWID lock is enabled
    // 4. Update usage count
    // 5. Return success or appropriate error

    // Simulate a successful validation
    return NextResponse.json({
      success: true,
      message: "Key validated successfully",
      data: {
        keyType: "premium",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        usageCount: 1,
        maxUsage: 5,
      },
    })
  } catch (error) {
    console.error("Error validating key:", error)
    return NextResponse.json({ success: false, error: "Failed to validate key" }, { status: 500 })
  }
}

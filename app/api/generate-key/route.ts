import { NextResponse } from "next/server"
import { encrypt, generateIV, generateKey } from "@/lib/crypto"

export async function POST(request: Request) {
  try {
    const { gatewayId, adLevel, adultAds, scriptData, hwidLock, maxUses, duration, keyPrefix } = await request.json()

    if (!scriptData && !gatewayId) {
      return NextResponse.json({ success: false, error: "Script data or gateway ID is required" }, { status: 400 })
    }

    // Generate a new key
    const key = generateKey(keyPrefix || "NEXUS-")

    // Generate IV for encryption
    const iv = generateIV()

    // Encrypt the script data if provided
    let encryptedData = ""
    if (scriptData) {
      const result = encrypt(JSON.stringify(scriptData), iv)
      encryptedData = result.encryptedData
    }

    // In a real implementation, you would save this to a database
    // For this example, we'll just return the generated key

    return NextResponse.json({
      success: true,
      key: key,
      metadata: {
        hwidLock: hwidLock || true,
        maxUses: maxUses || 1,
        duration: duration || 7,
        adLevel: adLevel || 1,
        adultAds: adultAds || false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000).toISOString(),
        encryptedData: encryptedData ? encryptedData : undefined,
        iv: encryptedData ? iv : undefined,
      },
    })
  } catch (error) {
    console.error("Error generating key:", error)
    return NextResponse.json({ success: false, error: "Failed to generate key" }, { status: 500 })
  }
}

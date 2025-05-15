import { NextResponse } from "next/server"
import { encrypt, generateIV, generateKey } from "@/lib/crypto"

export async function POST(request: Request) {
  try {
    const { prefix, keyData, hwidLock, maxUses, duration, adLevel, adultAds } = await request.json()

    if (!keyData) {
      return NextResponse.json({ success: false, error: "Key data is required" }, { status: 400 })
    }

    // Generate a new key
    const key = generateKey(prefix || "NEXUS-")

    // Generate IV for encryption
    const iv = generateIV()

    // Encrypt the key data
    const { encryptedData } = encrypt(JSON.stringify(keyData), iv)

    // In a real implementation, you would save this to a database
    // For this example, we'll just return the generated key

    return NextResponse.json({
      success: true,
      key: key,
      metadata: {
        hwidLock,
        maxUses,
        duration,
        adLevel,
        adultAds,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating key:", error)
    return NextResponse.json({ success: false, error: "Failed to generate key" }, { status: 500 })
  }
}

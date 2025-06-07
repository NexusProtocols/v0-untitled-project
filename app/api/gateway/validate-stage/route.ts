import { NextResponse } from "next/server"
import crypto from "crypto"

// AES-256 encryption/decryption functions
const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32 // 256 bits = 32 bytes
const IV_LENGTH = 16 // 16 bytes for AES

// Get encryption key from environment or generate a secure one
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_SECRET
  if (envKey && Buffer.from(envKey).length >= KEY_LENGTH) {
    return Buffer.from(envKey).slice(0, KEY_LENGTH)
  }

  // If no valid key in env, generate a secure one (for development only)
  console.warn("Warning: Using generated encryption key. Set ENCRYPTION_SECRET in environment for production.")
  return crypto.scryptSync("nexus-secure-gateway-key", "nexus-salt", KEY_LENGTH)
}

// Encrypt data with AES-256
const encrypt = (text: string): { encryptedData: string; iv: string } => {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  }
}

// Decrypt data with AES-256
const decrypt = (encryptedData: string, ivHex: string): string => {
  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stageData, validationToken } = body

    if (!stageData || !validationToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data",
        },
        { status: 400 },
      )
    }

    // Parse the stage data
    const parsedStageData = JSON.parse(stageData)
    const { gatewayId, userId, currentStage, nextStage, timestamp } = parsedStageData

    // Validate the data
    if (!gatewayId || !userId || currentStage === undefined || nextStage === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid stage data",
        },
        { status: 400 },
      )
    }

    // Check if the timestamp is recent (within 30 seconds)
    const now = Date.now()
    if (now - timestamp > 30000) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation expired",
        },
        { status: 400 },
      )
    }

    // Validate that nextStage is currentStage + 1
    if (nextStage !== currentStage + 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid stage progression",
        },
        { status: 400 },
      )
    }

    // Generate a new secure token for the next stage
    const newTokenData = {
      gatewayId,
      userId,
      stage: nextStage,
      timestamp: now,
    }

    const newTokenString = JSON.stringify(newTokenData)
    const { encryptedData, iv } = encrypt(newTokenString)

    // Return success with the new encrypted token
    return NextResponse.json({
      success: true,
      token: `${encryptedData}:${iv}`,
      message: "Stage validation successful",
    })
  } catch (error) {
    console.error("Error validating stage:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate stage",
      },
      { status: 500 },
    )
  }
}

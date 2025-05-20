import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { encryptData, generateEncryptionKey } from "@/lib/ad-utils"
import { env } from "@/lib/env"

// Cloudflare Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function POST(request: NextRequest) {
  try {
    const { captchaResponse, captchaType, gatewayId, creatorId } = await request.json()

    if (!captchaResponse) {
      return NextResponse.json({ success: false, error: "CAPTCHA response is required" }, { status: 400 })
    }

    // Get client IP address
    const ip = headers().get("x-forwarded-for") || request.ip || "unknown"

    // Validate based on CAPTCHA type
    if (captchaType === "cloudflare") {
      // Verify with Cloudflare Turnstile
      const formData = new URLSearchParams()
      formData.append("secret", env.CLOUDFLARE_SECRET_KEY)
      formData.append("response", captchaResponse)
      formData.append("remoteip", ip)

      const result = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const outcome = await result.json()

      if (!outcome.success) {
        return NextResponse.json(
          {
            success: false,
            error: "CAPTCHA validation failed",
          },
          { status: 400 },
        )
      }
    } else {
      // Legacy CAPTCHA validation (for backward compatibility)
      // This would be your existing validation logic
      // ...
    }

    // Generate session data
    const sessionData = {
      ip,
      userAgent: headers().get("user-agent") || "unknown",
      timestamp: Date.now(),
      gatewayId: gatewayId || null,
      creatorId: creatorId || null,
      validated: true,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    }

    // Encrypt the session data
    const encryptionKey = generateEncryptionKey(env.API_ENCRYPTION_KEY)
    const token = encryptData(JSON.stringify(sessionData), encryptionKey)

    return NextResponse.json({
      success: true,
      message: "Access granted",
      token,
    })
  } catch (error) {
    console.error("Error validating CAPTCHA:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while validating the CAPTCHA" },
      { status: 500 },
    )
  }
}

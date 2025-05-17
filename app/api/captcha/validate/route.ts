import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// In-memory storage for demo purposes (use a database in production)
const validatedUsers: Record<string, { timestamp: number; ip: string }> = {}

export async function POST(request: NextRequest) {
  try {
    const { captchaResponse, fingerprint } = await request.json()

    if (!captchaResponse || !fingerprint) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get client IP
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"

    // Check if IP is from a VPN or proxy (simplified check)
    const isVpn = await checkIfVpn(ip)
    if (isVpn) {
      return NextResponse.json({ success: false, error: "VPN or proxy detected" }, { status: 403 })
    }

    // Validate CAPTCHA (in a real implementation, verify with a service like reCAPTCHA)
    const isValidCaptcha = captchaResponse.length > 0

    if (!isValidCaptcha) {
      return NextResponse.json({ success: false, error: "Invalid CAPTCHA response" }, { status: 400 })
    }

    // Generate a validation token
    const token = crypto.randomBytes(32).toString("hex")

    // Store validation for 30 minutes
    validatedUsers[token] = {
      timestamp: Date.now(),
      ip,
    }

    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error validating CAPTCHA:", error)
    return NextResponse.json({ success: false, error: "Failed to validate CAPTCHA" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    // Check if token exists and is not expired
    const validation = validatedUsers[token]

    if (!validation) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 })
    }

    // Check if validation has expired (30 minutes)
    const isExpired = Date.now() - validation.timestamp > 30 * 60 * 1000

    if (isExpired) {
      delete validatedUsers[token]
      return NextResponse.json({ success: false, error: "Token has expired" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        expiresAt: new Date(validation.timestamp + 30 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error checking CAPTCHA validation:", error)
    return NextResponse.json({ success: false, error: "Failed to check validation" }, { status: 500 })
  }
}

// Simplified VPN check (in production, use a proper IP intelligence service)
async function checkIfVpn(ip: string): Promise<boolean> {
  // Known VPN IP ranges (simplified example)
  const vpnRanges = ["103.21.244.0/22", "104.16.0.0/12", "108.162.192.0/18"]

  // Check if IP is in any of the VPN ranges
  // This is a simplified check - in production use a proper IP intelligence service
  return vpnRanges.some((range) => isIpInRange(ip, range))
}

function isIpInRange(ip: string, range: string): boolean {
  // Simplified IP range check
  return ip.startsWith(range.split("/")[0].split(".").slice(0, 2).join("."))
}

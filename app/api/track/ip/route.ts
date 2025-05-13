import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get IP from request
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : request.ip || "unknown"

  // In a production environment, you would securely log this
  // For security, we don't return the actual IP to the client
  return NextResponse.json({ success: true })
}

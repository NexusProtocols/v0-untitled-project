import { type NextRequest, NextResponse } from "next/server"
import { DIRECT_LINK, encryptData, generateEncryptionKey, API_KEY } from "@/lib/ad-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gatewayId = searchParams.get("gatewayId")
    const creatorId = searchParams.get("creatorId")
    const token = searchParams.get("token")

    if (!gatewayId || !creatorId || !token) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // In a real implementation, validate the token
    // For now, we'll assume it's valid

    // Generate a secure encryption key
    const encryptionKey = generateEncryptionKey(API_KEY)

    // Encrypt the direct link with the creator and gateway IDs
    const linkWithParams = `${DIRECT_LINK}&creatorId=${creatorId}&gatewayId=${gatewayId}`
    const encryptedLink = encryptData(linkWithParams, encryptionKey)

    return NextResponse.json({
      success: true,
      data: {
        link: encryptedLink,
      },
    })
  } catch (error) {
    console.error("Error generating direct link:", error)
    return NextResponse.json({ success: false, error: "Failed to generate direct link" }, { status: 500 })
  }
}

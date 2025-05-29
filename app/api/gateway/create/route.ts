import { type NextRequest, NextResponse } from "next/server"
import { encryptData, generateEncryptionKey } from "@/lib/ad-utils"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    // Get the API key from the authorization header
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 401 })
    }

    // Verify the API key
    // In a real implementation, this would check against a database
    const creatorApiKeys = process.env.CREATOR_API_KEYS ? JSON.parse(process.env.CREATOR_API_KEYS) : {}
    const creatorId = Object.keys(creatorApiKeys).find((id) => creatorApiKeys[id] === apiKey)

    if (!creatorId) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 })
    }

    // Get gateway data from request body
    const gatewayData = await request.json()

    // Validate required fields
    if (!gatewayData.title || !gatewayData.description || !gatewayData.reward) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description, and reward are required",
        },
        { status: 400 },
      )
    }

    // Generate a unique gateway ID
    const gatewayId = `gateway-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create the gateway object
    const gateway = {
      id: gatewayId,
      title: gatewayData.title,
      description: gatewayData.description,
      imageUrl: gatewayData.imageUrl || "",
      creatorId,
      creatorName: gatewayData.creatorName || "Creator",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      stages: gatewayData.stages || [{ id: 1, level: 3, taskCount: 2 }],
      reward: gatewayData.reward,
      settings: gatewayData.settings || {
        showSubscriptionOptions: true,
        showOperaGxOffer: true,
        blockVpnUsers: true,
        rateLimit: {
          enabled: true,
          count: 5,
          period: "day",
        },
      },
      stats: {
        visits: 0,
        completions: 0,
        conversionRate: 0,
        revenue: 0,
      },
    }

    // In a real implementation, save to database
    // For now, save to localStorage
    const existingGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
    existingGateways.push(gateway)
    localStorage.setItem("nexus_gateways", JSON.stringify(existingGateways))

    // Generate a session token for this gateway
    const sessionData = {
      gatewayId,
      creatorId,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    // Encrypt the session data
    const encryptionKey = generateEncryptionKey(env.API_ENCRYPTION_KEY)
    const token = encryptData(JSON.stringify(sessionData), encryptionKey)

    // Generate the gateway URL
    const gatewayUrl = `${request.nextUrl.origin}/gateway/${gatewayId}?token=${token}`

    return NextResponse.json({
      success: true,
      message: "Gateway created successfully",
      gatewayId,
      gatewayUrl,
      token,
    })
  } catch (error) {
    console.error("Error creating gateway:", error)
    return NextResponse.json({ success: false, error: "An error occurred while creating the gateway" }, { status: 500 })
  }
}

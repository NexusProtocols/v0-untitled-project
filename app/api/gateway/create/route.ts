import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Get gateway data from request body
    const gatewayData = await request.json()

    // Validate required fields
    if (!gatewayData.title || !gatewayData.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and description are required",
        },
        { status: 400 },
      )
    }

    // Generate IDs if not provided
    const gatewayId = gatewayData.id || uuidv4()
    const creatorId = gatewayData.creator_id || `cr-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Create the gateway object for Supabase
    const gateway = {
      id: gatewayId,
      title: gatewayData.title,
      description: gatewayData.description,
      image_url: gatewayData.image_url || "",
      creator_id: creatorId,
      creator_name: gatewayData.creator_name || session.user.user_metadata?.username || "Unknown",
      stages: gatewayData.stages || [{ id: 1, level: 3, taskCount: 2 }],
      reward: gatewayData.reward || { type: "url", url: "" },
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
      stats: gatewayData.stats || {
        visits: 0,
        completions: 0,
        conversionRate: 0,
        revenue: 0,
      },
    }

    // Save to Supabase
    const { data: savedGateway, error } = await supabaseAdmin.from("gateways").insert([gateway]).select().single()

    if (error) {
      console.error("Error saving gateway to Supabase:", error)
      return NextResponse.json({ success: false, error: "Failed to save gateway to database" }, { status: 500 })
    }

    // Generate the gateway URL
    const gatewayUrl = `${request.nextUrl.origin}/${creatorId}/${gatewayId}`

    return NextResponse.json({
      success: true,
      message: "Gateway created successfully",
      gatewayId,
      creatorId,
      gatewayUrl,
      gateway: savedGateway,
    })
  } catch (error) {
    console.error("Error creating gateway:", error)
    return NextResponse.json({ success: false, error: "An error occurred while creating the gateway" }, { status: 500 })
  }
}

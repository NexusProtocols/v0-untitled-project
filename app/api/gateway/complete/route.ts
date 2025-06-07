import { NextResponse } from "next/server"
import { supabase, incrementGatewayCompletion } from "@/utils/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gatewayId, token } = body

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    // Only increment if Supabase is available
    if (supabase) {
      await incrementGatewayCompletion(gatewayId)
    }

    // Generate a completion token
    const completionToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    return NextResponse.json({
      success: true,
      token: completionToken,
      message: "Gateway completion recorded successfully",
    })
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json({ success: false, error: "Failed to complete gateway" }, { status: 500 })
  }
}

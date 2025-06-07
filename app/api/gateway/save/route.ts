import { type NextRequest, NextResponse } from "next/server"
import { saveGateway } from "@/utils/supabase"

export async function POST(request: NextRequest) {
  try {
    const gateway = await request.json()

    if (!gateway) {
      return NextResponse.json({ success: false, error: "Gateway data is required" }, { status: 400 })
    }

    // Generate ID if not provided
    if (!gateway.id) {
      gateway.id = `gateway-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    // Add timestamps if not present
    if (!gateway.created_at) {
      gateway.created_at = new Date().toISOString()
    }
    gateway.updated_at = new Date().toISOString()

    const savedGateway = await saveGateway(gateway)

    return NextResponse.json({ success: true, gateway: savedGateway })
  } catch (error) {
    console.error("Error saving gateway:", error)
    return NextResponse.json({ success: false, error: "Failed to save gateway" }, { status: 500 })
  }
}

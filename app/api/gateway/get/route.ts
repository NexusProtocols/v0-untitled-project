import { NextResponse } from "next/server"
import { getGateway } from "@/utils/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gatewayId = searchParams.get("id")

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    const gateway = await getGateway(gatewayId)

    if (!gateway) {
      return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, gateway })
  } catch (error) {
    console.error("Error in gateway get API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

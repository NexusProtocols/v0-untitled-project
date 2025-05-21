import { type NextRequest, NextResponse } from "next/server"
import { gatewayDb } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gatewayId = params.id

    if (!gatewayId) {
      return NextResponse.json({ success: false, message: "Gateway ID is required" }, { status: 400 })
    }

    // Get gateway from database
    const gateway = await gatewayDb.getGatewayById(gatewayId)

    if (!gateway) {
      return NextResponse.json({ success: false, message: "Gateway not found" }, { status: 404 })
    }

    // Track gateway visit
    await gatewayDb.trackGatewayActivity(gatewayId, "visit")

    return NextResponse.json({
      success: true,
      gateway,
    })
  } catch (error) {
    console.error("Error fetching gateway:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the gateway" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gatewayId = params.id

    if (!gatewayId) {
      return NextResponse.json({ success: false, message: "Gateway ID is required" }, { status: 400 })
    }

    const updates = await request.json()

    // Update gateway in database
    const updatedGateway = await gatewayDb.updateGateway(gatewayId, updates)

    return NextResponse.json({
      success: true,
      gateway: updatedGateway,
    })
  } catch (error) {
    console.error("Error updating gateway:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the gateway" },
      { status: 500 },
    )
  }
}

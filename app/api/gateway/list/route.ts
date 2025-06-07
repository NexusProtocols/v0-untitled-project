import { NextResponse } from "next/server"
import { getAllGateways, getUserGateways } from "@/utils/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let gateways
    if (userId) {
      gateways = await getUserGateways(userId)
    } else {
      gateways = await getAllGateways()
    }

    return NextResponse.json({ success: true, gateways })
  } catch (error) {
    console.error("Error listing gateways:", error)
    return NextResponse.json({ success: false, error: "Failed to list gateways" }, { status: 500 })
  }
}

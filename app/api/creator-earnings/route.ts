import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes (use a database in production)
const creatorEarnings: Record<string, any> = {}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get("creatorId")

    if (!creatorId) {
      return NextResponse.json({ success: false, error: "Creator ID is required" }, { status: 400 })
    }

    // Get earnings data for the creator
    const earningsData = creatorEarnings[creatorId] || {
      total: 0,
      monthly: 0,
      daily: [],
      gateways: [],
    }

    return NextResponse.json({
      success: true,
      data: earningsData,
    })
  } catch (error) {
    console.error("Error getting creator earnings:", error)
    return NextResponse.json({ success: false, error: "Failed to get earnings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { creatorId, gatewayId, amount, type } = await request.json()

    if (!creatorId || !gatewayId || amount === undefined || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Initialize creator earnings if not exists
    if (!creatorEarnings[creatorId]) {
      creatorEarnings[creatorId] = {
        total: 0,
        monthly: 0,
        daily: [],
        gateways: [],
      }
    }

    const earnings = creatorEarnings[creatorId]

    // Update total earnings
    earnings.total += amount

    // Update monthly earnings
    earnings.monthly += amount

    // Update daily earnings
    const today = new Date().toISOString().split("T")[0]
    const dailyEntry = earnings.daily.find((entry: any) => entry.date === today)

    if (dailyEntry) {
      dailyEntry.amount += amount
    } else {
      earnings.daily.push({
        date: today,
        amount,
      })
    }

    // Update gateway earnings
    const gatewayEntry = earnings.gateways.find((entry: any) => entry.gatewayId === gatewayId)

    if (gatewayEntry) {
      gatewayEntry.amount += amount
    } else {
      earnings.gateways.push({
        gatewayId,
        amount,
      })
    }

    // Save updated earnings
    creatorEarnings[creatorId] = earnings

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating creator earnings:", error)
    return NextResponse.json({ success: false, error: "Failed to update earnings" }, { status: 500 })
  }
}

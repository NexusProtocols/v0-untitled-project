import { type NextRequest, NextResponse } from "next/server"
import { calculateCreatorEarnings } from "@/lib/ad-utils"

// In-memory storage for demo purposes (use a database in production)
const adImpressions: Record<string, any[]> = {}
const creatorEarnings: Record<string, number> = {}

export async function POST(request: NextRequest) {
  try {
    const { adKey, creatorId, timestamp } = await request.json()

    if (!adKey || !creatorId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Store the impression
    if (!adImpressions[creatorId]) {
      adImpressions[creatorId] = []
    }

    adImpressions[creatorId].push({
      adKey,
      timestamp,
      revenue: 0.001, // Simulated revenue per impression
    })

    // Update creator earnings
    const totalImpressionRevenue = adImpressions[creatorId].reduce((sum, imp) => sum + imp.revenue, 0)
    creatorEarnings[creatorId] = calculateCreatorEarnings(totalImpressionRevenue)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking ad impression:", error)
    return NextResponse.json({ success: false, error: "Failed to track impression" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get("creatorId")

    if (!creatorId) {
      return NextResponse.json({ success: false, error: "Creator ID is required" }, { status: 400 })
    }

    // Get earnings for the creator
    const earnings = creatorEarnings[creatorId] || 0
    const impressions = adImpressions[creatorId]?.length || 0

    return NextResponse.json({
      success: true,
      data: {
        earnings,
        impressions,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error getting creator earnings:", error)
    return NextResponse.json({ success: false, error: "Failed to get earnings" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

// Simulated database for gateway statistics (use a real database in production)
const gatewayStats: Record<string, any> = {}

export async function POST(request: Request) {
  try {
    const { gatewayId, stepId, action, validationToken, userData } = await request.json()

    if (!gatewayId || !action) {
      return NextResponse.json({ success: false, error: "Gateway ID and action are required" }, { status: 400 })
    }

    // Initialize stats for this gateway if they don't exist
    if (!gatewayStats[gatewayId]) {
      gatewayStats[gatewayId] = {
        visits: 0,
        completions: 0,
        stepStats: {},
        lastUpdated: new Date().toISOString(),
      }
    }

    const stats = gatewayStats[gatewayId]

    // Update stats based on action
    switch (action) {
      case "visit":
        stats.visits += 1
        break
      case "complete":
        stats.completions += 1
        // Calculate conversion rate
        stats.conversionRate = stats.completions / stats.visits
        break
      case "step_start":
        if (!stepId) {
          return NextResponse.json({ success: false, error: "Step ID is required for step tracking" }, { status: 400 })
        }
        if (!stats.stepStats[stepId]) {
          stats.stepStats[stepId] = { starts: 0, completes: 0, skips: 0 }
        }
        stats.stepStats[stepId].starts += 1
        break
      case "step_complete":
        if (!stepId) {
          return NextResponse.json({ success: false, error: "Step ID is required for step tracking" }, { status: 400 })
        }
        if (!stats.stepStats[stepId]) {
          stats.stepStats[stepId] = { starts: 0, completes: 0, skips: 0 }
        }
        stats.stepStats[stepId].completes += 1
        break
      case "step_skip":
        if (!stepId) {
          return NextResponse.json({ success: false, error: "Step ID is required for step tracking" }, { status: 400 })
        }
        if (!stats.stepStats[stepId]) {
          stats.stepStats[stepId] = { starts: 0, completes: 0, skips: 0 }
        }
        stats.stepStats[stepId].skips += 1
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    // Store user data if provided
    if (userData) {
      stats.userData = stats.userData || []
      stats.userData.push({
        ...userData,
        action,
        stepId: stepId || null,
        timestamp: new Date().toISOString(),
        validationToken: validationToken || null,
      })
    }

    stats.lastUpdated = new Date().toISOString()

    // In a real implementation, you would save these changes to a database
    gatewayStats[gatewayId] = stats

    return NextResponse.json({
      success: true,
      message: "Gateway tracking updated successfully",
    })
  } catch (error) {
    console.error("Error tracking gateway:", error)
    return NextResponse.json({ success: false, error: "Failed to track gateway" }, { status: 500 })
  }
}

// Admin-only route to get gateway stats (would require authentication in production)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gatewayId = searchParams.get("gatewayId")

    if (gatewayId) {
      // Return stats for a specific gateway
      if (!gatewayStats[gatewayId]) {
        return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: gatewayStats[gatewayId],
      })
    } else {
      // Return all gateway stats
      return NextResponse.json({
        success: true,
        data: gatewayStats,
      })
    }
  } catch (error) {
    console.error("Error getting gateway stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get gateway stats" }, { status: 500 })
  }
}

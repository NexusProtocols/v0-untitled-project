// Update the route to handle gateway completion without requiring secure auth
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { gatewayId, token, completed, stages, currentStage } = await request.json()

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Missing gateway ID" }, { status: 400 })
    }

    // Get the gateway data
    const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
    const gateway = gateways.find((g: any) => g.id === gatewayId)

    if (!gateway) {
      return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 })
    }

    // If secure auth is disabled, skip token validation
    if (!gateway.settings?.secureAuth?.enabled) {
      // Generate a completion token
      const completionToken = generateCompletionToken(gatewayId)

      // Update gateway stats
      incrementGatewayCompletions(gatewayId)

      return NextResponse.json({
        success: true,
        message: "Gateway completed successfully",
        token: completionToken,
      })
    }

    // Otherwise, validate the token
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 })
    }

    // In a real implementation, you would validate the token against a database
    // For now, we'll just check if it's a valid CAPTCHA token
    const isValidToken = validateCaptchaToken(token)

    if (!isValidToken) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Generate a completion token
    const completionToken = generateCompletionToken(gatewayId)

    // Update gateway stats
    incrementGatewayCompletions(gatewayId)

    return NextResponse.json({
      success: true,
      message: "Gateway completed successfully",
      token: completionToken,
    })
  } catch (error) {
    console.error("Error completing gateway:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while completing the gateway" },
      { status: 500 },
    )
  }
}

// Helper function to validate CAPTCHA token
function validateCaptchaToken(token: string): boolean {
  // In a real implementation, you would validate the token against the CAPTCHA service
  // For now, we'll just check if it exists
  return !!token
}

// Helper function to generate a completion token
function generateCompletionToken(gatewayId: string): string {
  return `${gatewayId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Helper function to increment gateway completions
function incrementGatewayCompletions(gatewayId: string) {
  try {
    const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
    const updatedGateways = allGateways.map((g: any) => {
      if (g.id === gatewayId) {
        // Initialize stats if not present
        if (!g.stats) {
          g.stats = { visits: 1, completions: 0, conversionRate: 0, revenue: 0 }
        }

        // Increment completions
        const completions = (g.stats?.completions || 0) + 1
        const visits = g.stats?.visits || 1
        return {
          ...g,
          stats: {
            ...g.stats,
            completions,
            conversionRate: (completions / visits) * 100,
            revenue: calculateEstimatedRevenue(visits, completions, g.settings?.adLevel || 3),
          },
        }
      }
      return g
    })

    localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
  } catch (error) {
    console.error("Error incrementing gateway completions:", error)
  }
}

// Helper function to calculate estimated revenue
function calculateEstimatedRevenue(visits: number, completions: number, adLevel: number): number {
  // Base CPM rate ($ per 1000 visits)
  const baseCPM = 2.5

  // Adjust based on ad level
  const adLevelMultiplier = 0.8 + adLevel * 0.2

  // Adjust based on completion rate
  const completionRate = visits > 0 ? completions / visits : 0
  const completionMultiplier = 1 + completionRate * 0.5

  // Calculate revenue
  const revenue = (visits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier

  return Number.parseFloat(revenue.toFixed(2))
}

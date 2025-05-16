import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gatewayId = searchParams.get("gatewayId")

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    // In a real implementation, this would fetch data from a database
    // For now, we'll return mock data
    const mockStats = {
      visits: Math.floor(Math.random() * 1000) + 100,
      completions: Math.floor(Math.random() * 500) + 50,
      conversionRate: Math.random() * 0.5 + 0.1, // 10-60%
      revenue: (Math.random() * 100 + 10).toFixed(2),
      stepData: [
        {
          stepId: "step-1",
          views: Math.floor(Math.random() * 1000) + 100,
          completions: Math.floor(Math.random() * 500) + 50,
          skips: Math.floor(Math.random() * 100),
        },
        {
          stepId: "step-2",
          views: Math.floor(Math.random() * 800) + 80,
          completions: Math.floor(Math.random() * 400) + 40,
          skips: Math.floor(Math.random() * 80),
        },
      ],
    }

    return NextResponse.json({ success: true, data: mockStats })
  } catch (error) {
    console.error("Error fetching gateway stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch gateway stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gatewayId, stepId, action, validationToken, userData } = body

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 })
    }

    // In a real implementation, this would validate the token and store the tracking data
    console.log(`Tracking gateway ${gatewayId}, action: ${action}`, {
      stepId,
      validationToken,
      userData,
    })

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking gateway action:", error)
    return NextResponse.json({ success: false, error: "Failed to track gateway action" }, { status: 500 })
  }
}

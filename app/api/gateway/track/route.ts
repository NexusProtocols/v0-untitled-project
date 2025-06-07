import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get tracking data from the request body
    const { gatewayId, creatorId, action, taskId, validationToken, userData } = await request.json()

    if (!gatewayId || !creatorId || !action) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate action type
    const validActions = ["visit", "task_start", "task_complete", "task_skip", "stage_complete", "gateway_complete"]
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action type" }, { status: 400 })
    }

    // If action is task_complete or task_start, taskId is required
    if ((action === "task_complete" || action === "task_start") && !taskId) {
      return NextResponse.json(
        { success: false, message: "taskId is required for task_complete and task_start actions" },
        { status: 400 },
      )
    }

    // Get the gateway data to check for secure authentication
    const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
    const gateway = gateways.find((g: any) => g.id === gatewayId)

    // If secure authentication is enabled, validate the token
    if (
      gateway?.settings?.secureAuth?.enabled &&
      action === "task_complete" &&
      gateway.settings.secureAuth.apiEndpoint
    ) {
      try {
        // Prepare the validation data
        const validationData = {
          gatewayId,
          creatorId,
          taskId,
          action,
          timestamp: Date.now(),
          token: validationToken,
        }

        // If encryption is enabled, encrypt the data
        let requestBody = validationData
        if (gateway.settings.secureAuth.encryptionEnabled && gateway.settings.secureAuth.apiKey) {
          const encryptionKey = gateway.settings.secureAuth.apiKey
          const encryptedData = encryptData(JSON.stringify(validationData), encryptionKey)
          requestBody = { encryptedData }
        }

        // Send validation request to the creator's API
        const response = await fetch(gateway.settings.secureAuth.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": gateway.settings.secureAuth.apiKey,
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!data.success) {
          return NextResponse.json({ success: false, message: "Task validation failed" }, { status: 401 })
        }
      } catch (error) {
        console.error("Error validating task:", error)
        return NextResponse.json({ success: false, message: "Error validating task" }, { status: 500 })
      }
    }

    // Store tracking data
    // In a real implementation, you would store this in a database
    console.log(`Gateway tracking: ${action} for gateway ${gatewayId} by creator ${creatorId}`)

    // For task_complete actions, update gateway stats
    if (action === "task_complete" || action === "gateway_complete") {
      try {
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const updatedGateways = gateways.map((g: any) => {
          if (g.id === gatewayId) {
            // Initialize stats if not present
            if (!g.stats) {
              g.stats = { visits: 0, completions: 0, conversionRate: 0, revenue: 0, taskCompletions: 0 }
            }

            // Update stats
            const taskCompletions = (g.stats.taskCompletions || 0) + 1
            let completions = g.stats.completions || 0

            if (action === "gateway_complete") {
              completions += 1
            }

            const visits = g.stats.visits || 1
            return {
              ...g,
              stats: {
                ...g.stats,
                taskCompletions,
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
        console.error("Error updating gateway stats:", error)
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Tracking data recorded successfully",
    })
  } catch (error) {
    console.error("Error tracking gateway:", error)
    return NextResponse.json({ success: false, message: "An error occurred while tracking gateway" }, { status: 500 })
  }
}

// Helper function to calculate estimated revenue
function calculateEstimatedRevenue(visits: number, completions: number, adLevel: number) {
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

// Helper function to encrypt data with AES-256
function encryptData(data: string, key: string): string {
  try {
    const crypto = require("crypto")
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(key).digest("base64").substring(0, 32),
      iv,
    )
    let encrypted = cipher.update(data, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    return ""
  }
}

"use server"

import { revalidatePath } from "next/cache"

// This would be stored in environment variables in a real application
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1363692804865396989/fqIA-uwyByrtZX-OuzGg8vI_42zcXU_muNkZOUBy6U0N3OmuM5DoQAfKoTXLkiYhIcHw"

export async function sendSupportWebhook(data: {
  username: string
  requestId: string
  timestamp: string
  issue: string
}) {
  try {
    // Validate input
    if (!data.username || !data.requestId || !data.issue) {
      return { success: false, error: "Missing required fields" }
    }

    // Sanitize input
    const sanitizedData = {
      username: sanitizeInput(data.username),
      requestId: sanitizeInput(data.requestId),
      timestamp: data.timestamp,
      issue: sanitizeInput(data.issue),
    }

    // Format message for Discord
    const webhookData = {
      content: null,
      embeds: [
        {
          title: "New Support Request",
          color: 3447003, // Blue color
          fields: [
            {
              name: "Username",
              value: sanitizedData.username,
              inline: true,
            },
            {
              name: "Request ID",
              value: sanitizedData.requestId,
              inline: true,
            },
            {
              name: "Time",
              value: new Date(sanitizedData.timestamp).toLocaleString(),
              inline: true,
            },
            {
              name: "Issue",
              value: sanitizedData.issue,
            },
          ],
          footer: {
            text: "NEXUS Support System",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Send to Discord webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Discord webhook error:", await response.text())
      return { success: false, error: "Failed to send webhook" }
    }

    revalidatePath("/support")
    return { success: true }
  } catch (error) {
    console.error("Error sending support webhook:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Simple sanitization function
function sanitizeInput(input: string): string {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

"use server"

import { Nexus_READ_WRITE_TOKEN } from "@/lib/env"

type ReportData = {
  scriptId: string
  scriptTitle: string
  reportReason: string
  additionalInfo: string
  reportedBy: string
}

export async function sendReportToDiscord(data: ReportData) {
  try {
    const webhookUrl =
      "https://discord.com/api/webhooks/1362261739424448512/eVbzUaLJjGBKRwM5NeqLjmhK9GeubVoQH4u_6ETwvNvXzN8AvO43LTdGv6vef_Z_leFm"

    // Create an embed for Discord
    const embed = {
      title: "Script Report",
      color: 0xff0000, // Red color
      fields: [
        {
          name: "Script",
          value: data.scriptTitle || "Unknown",
        },
        {
          name: "Script ID",
          value: data.scriptId || "Unknown",
        },
        {
          name: "Reason",
          value: data.reportReason || "Not specified",
        },
        {
          name: "Additional Information",
          value: data.additionalInfo || "None provided",
        },
        {
          name: "Reported By",
          value: data.reportedBy || "Anonymous",
        },
        {
          name: "Time",
          value: new Date().toISOString(),
        },
      ],
    }

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Nexus_READ_WRITE_TOKEN}`, // Using the token for authorization
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending report:", error)
    return { success: false, error: "Failed to send report. Please try again later." }
  }
}

"use server"

export async function sendSupportWebhook(data: {
  username: string
  requestId: string
  timestamp: string
  issue: string
}) {
  try {
    const webhookUrl =
      "https://discord.com/api/webhooks/1363692804865396989/fqIA-uwyByrtZX-OuzGg8vI_42zcXU_muNkZOUBy6U0N3OmuM5DoQAfKoTXLkiYhIcHw"

    const payload = {
      embeds: [
        {
          title: `New Support Request: ${data.requestId}`,
          color: 0xff3e3e,
          fields: [
            {
              name: "User",
              value: data.username,
              inline: true,
            },
            {
              name: "Request ID",
              value: data.requestId,
              inline: true,
            },
            {
              name: "Time",
              value: new Date(data.timestamp).toLocaleString(),
              inline: true,
            },
            {
              name: "Issue",
              value: data.issue,
            },
          ],
          footer: {
            text: "Nexus Support System",
          },
          timestamp: data.timestamp,
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending Discord webhook:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

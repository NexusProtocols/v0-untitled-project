import { type NextRequest, NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    // List all gateways from Vercel Blob
    const { blobs } = await list({
      prefix: "gateways/",
    })

    const gateways = []
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        if (response.ok) {
          const gateway = await response.json()
          gateways.push(gateway)
        }
      } catch (error) {
        console.error(`Error fetching gateway from ${blob.url}:`, error)
      }
    }

    return NextResponse.json({ success: true, gateways })
  } catch (error) {
    console.error("Error listing gateways from blob storage:", error)
    return NextResponse.json({ success: false, error: "Failed to list gateways" }, { status: 500 })
  }
}

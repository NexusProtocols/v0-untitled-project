import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const gateway = await request.json()

    if (!gateway.id) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    // Save to Vercel Blob
    const blob = await put(`gateways/${gateway.id}.json`, JSON.stringify(gateway), {
      access: "public",
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error("Error saving gateway to blob storage:", error)
    return NextResponse.json({ success: false, error: "Failed to save gateway" }, { status: 500 })
  }
}

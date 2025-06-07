import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gatewayId = searchParams.get("id")

    if (!gatewayId) {
      return NextResponse.json({ success: false, error: "Gateway ID is required" }, { status: 400 })
    }

    // Try to fetch from Vercel Blob
    try {
      const response = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN}/gateways/${gatewayId}.json`)
      if (response.ok) {
        const gateway = await response.json()
        return NextResponse.json({ success: true, gateway })
      }
    } catch (error) {
      console.error("Error fetching from blob storage:", error)
    }

    return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 })
  } catch (error) {
    console.error("Error in gateway get API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

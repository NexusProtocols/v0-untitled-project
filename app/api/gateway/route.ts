import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Your gateway logic here
    const data = {
      status: "success",
      message: "Gateway is working",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Gateway error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process the request
    const response = {
      success: true,
      data: body,
      processed: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 400 })
  }
}

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const universeId = searchParams.get("universeId")

  if (!universeId) {
    return NextResponse.json({ success: false, error: "Universe ID is required" }, { status: 400 })
  }

  try {
    // Fetch thumbnail from Roblox API
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Roblox API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Thumbnail not found", imageUrl: "/placeholder.svg?height=512&width=512" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].imageUrl,
    })
  } catch (error) {
    console.error("Error fetching game thumbnail:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch thumbnail", imageUrl: "/placeholder.svg?height=512&width=512" },
      { status: 500 },
    )
  }
}

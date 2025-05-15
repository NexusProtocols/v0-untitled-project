import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const universeId = searchParams.get("universeId")

  if (!universeId) {
    return NextResponse.json({ success: false, error: "Universe ID is required" }, { status: 400 })
  }

  try {
    // Fetch game details from Roblox API
    const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Roblox API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 })
    }

    const gameData = data.data[0]

    // Fetch thumbnail
    const thumbnailResponse = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    const thumbnailData = await thumbnailResponse.json()
    const imageUrl =
      thumbnailData.data && thumbnailData.data.length > 0
        ? thumbnailData.data[0].imageUrl
        : "/placeholder.svg?height=512&width=512"

    return NextResponse.json({
      success: true,
      data: {
        name: gameData.name,
        description: gameData.description || "",
        imageUrl: imageUrl,
        gameId: universeId,
        stats: {
          playing: gameData.playing || 0,
          visits: gameData.visits || 0,
          likes: gameData.totalUpVotes || 0,
          dislikes: gameData.totalDownVotes || 0,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching game details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch game details" }, { status: 500 })
  }
}

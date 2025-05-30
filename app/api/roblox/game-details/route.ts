import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const universeId = searchParams.get("universeId")

  if (!universeId) {
    return NextResponse.json({ success: false, error: "Universe ID is required" }, { status: 400 })
  }

  try {
    // Fetch game details from Roblox API
    const detailsResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!detailsResponse.ok) {
      throw new Error(`Roblox API error: ${detailsResponse.status}`)
    }

    const detailsData = await detailsResponse.json()

    if (!detailsData.data || detailsData.data.length === 0) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 })
    }

    const gameData = detailsData.data[0]

    // Fetch game icon
    const iconResponse = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    const iconData = await iconResponse.json()
    const iconUrl = iconData.data?.[0]?.imageUrl || null

    // Fetch game media (screenshots)
    const mediaResponse = await fetch(`https://games.roblox.com/v2/games/${universeId}/media`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const mediaData = await mediaResponse.json()
    const screenshots = mediaData.data || []

    // Get the main image (first screenshot) or fallback to icon
    const mainImageUrl = screenshots?.[0]?.imageUrl || iconUrl || "/placeholder.svg?height=512&width=512"

    // Format the response
    return NextResponse.json({
      success: true,
      data: {
        name: gameData.name,
        description: gameData.description || "",
        gameId: universeId,
        creatorName: gameData.creator?.name || "Unknown",
        creatorId: gameData.creator?.id || null,
        iconUrl,
        mainImageUrl,
        images: screenshots.map((screenshot: any) => screenshot.imageUrl),
        stats: {
          playing: gameData.playing || 0,
          visits: gameData.visits || 0,
          likes: gameData.totalUpVotes || 0,
          dislikes: gameData.totalDownVotes || 0,
          created: gameData.created || null,
          updated: gameData.updated || null,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching game details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch game details" }, { status: 500 })
  }
}

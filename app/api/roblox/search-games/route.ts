import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword")

  if (!keyword) {
    return NextResponse.json({ success: false, error: "Keyword is required" }, { status: 400 })
  }

  try {
    // Fetch games from Roblox API
    const response = await fetch(
      `https://games.roblox.com/v1/games/list?model.keyword=${encodeURIComponent(
        keyword,
      )}&model.maxRows=10&model.startRowIndex=0`,
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

    if (!data.games || data.games.length === 0) {
      return NextResponse.json({ success: false, error: "No games found" }, { status: 404 })
    }

    // Map the results to our format
    const games = data.games.map((game: any) => ({
      name: game.name,
      imageUrl: game.imageUrl,
      gameId: game.universeId.toString(),
      stats: {
        playing: game.playerCount || 0,
        visits: game.visitCount || 0,
        likes: game.totalUpVotes || 0,
        dislikes: game.totalDownVotes || 0,
      },
    }))

    return NextResponse.json({
      success: true,
      data: games,
    })
  } catch (error) {
    console.error("Error searching games:", error)
    return NextResponse.json({ success: false, error: "Failed to search games" }, { status: 500 })
  }
}

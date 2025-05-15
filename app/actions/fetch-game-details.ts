"use server"

export async function fetchGameDetailsById(gameId: string) {
  try {
    // Call the client function but from the server
    const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${gameId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return { success: false, error: "Game not found" }
    }

    const gameData = data.data[0]

    // Fetch thumbnail
    const thumbnailResponse = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${gameId}&size=512x512&format=Png&isCircular=false`,
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

    return {
      success: true,
      data: {
        name: gameData.name,
        description: gameData.description || "",
        imageUrl: imageUrl,
        gameId: gameId,
        stats: {
          playing: gameData.playing || 0,
          visits: gameData.visits || 0,
          likes: gameData.totalUpVotes || 0,
          dislikes: gameData.totalDownVotes || 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching game details:", error)
    return { success: false, error: "Failed to fetch game details" }
  }
}

export async function fetchGameDetailsByName(gameName: string) {
  try {
    // Call the client function but from the server
    const response = await fetch(
      `https://games.roblox.com/v1/games/list?model.keyword=${encodeURIComponent(gameName)}&model.maxRows=10&model.startRowIndex=0`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.games || data.games.length === 0) {
      return { success: false, error: "No games found matching that name" }
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

    return {
      success: true,
      data: games,
    }
  } catch (error) {
    console.error("Error searching games:", error)
    return { success: false, error: "Failed to search games" }
  }
}

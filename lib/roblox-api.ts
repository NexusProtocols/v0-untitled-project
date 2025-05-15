/**
 * Utility functions for interacting with the Roblox API
 */

// Fetch game details by universe ID
export async function fetchGameDetailsById(gameId: string) {
  try {
    // Use a proxy to avoid CORS issues
    const response = await fetch(`/api/roblox/game-details?universeId=${gameId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching game details:", error)
    throw error
  }
}

// Search games by name
export async function searchGamesByName(gameName: string) {
  try {
    // Use a proxy to avoid CORS issues
    const response = await fetch(`/api/roblox/search-games?keyword=${encodeURIComponent(gameName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error searching games:", error)
    throw error
  }
}

// Get game thumbnail by universe ID
export async function getGameThumbnail(universeId: string) {
  try {
    const response = await fetch(`/api/roblox/game-thumbnail?universeId=${universeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error("Error fetching game thumbnail:", error)
    return "/placeholder.svg?height=512&width=512"
  }
}

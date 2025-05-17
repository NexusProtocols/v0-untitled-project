"use server"

import { JSDOM } from "jsdom"

export async function fetchGameDetailsById(gameId: string) {
  try {
    // Use the direct Roblox game URL
    const url = `https://www.roblox.com/games/${gameId}/`

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch game details: ${response.status} ${response.statusText}`,
      }
    }

    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Extract game name
    const gameName =
      document.querySelector("h1.game-name")?.textContent?.trim() ||
      document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      `Game ${gameId}`

    // Extract game image
    const gameImage =
      document.querySelector("meta[property='og:image']")?.getAttribute("content") ||
      document.querySelector(".game-thumbnail-img")?.getAttribute("src") ||
      `/placeholder.svg?height=512&width=512`

    // Extract game description
    const gameDescription =
      document.querySelector("meta[property='og:description']")?.getAttribute("content") ||
      document.querySelector(".game-description")?.textContent?.trim() ||
      ""

    return {
      success: true,
      data: {
        name: gameName,
        description: gameDescription,
        imageUrl: gameImage,
        gameId: gameId,
        stats: {
          playing: "N/A",
          visits: "N/A",
          likes: "N/A",
          dislikes: "N/A",
        },
      },
    }
  } catch (error) {
    console.error("Error fetching game details:", error)
    return {
      success: false,
      error: "An unexpected error occurred while fetching game details",
    }
  }
}

export async function fetchGameDetailsByName(gameName: string) {
  try {
    // In a real implementation, you would scrape search results from Roblox
    // For now, we'll return mock data
    const mockResults = Array.from({ length: 5 }).map((_, index) => ({
      name: `${gameName} ${index + 1}`,
      imageUrl: `/placeholder.svg?height=512&width=512`,
      gameId: `${1000 + index}`,
      link: `https://www.roblox.com/games/${1000 + index}/`,
      stats: {
        playing: `${Math.floor(Math.random() * 10000)}`,
        likes: `${Math.floor(Math.random() * 100000)}`,
      },
    }))

    return {
      success: true,
      data: mockResults,
    }
  } catch (error) {
    console.error("Error searching games:", error)
    return {
      success: false,
      error: "An unexpected error occurred while searching games",
    }
  }
}

"use server"

import { load } from "cheerio"

// Function to fetch game details by ID
export async function fetchGameDetailsById(gameId: string) {
  try {
    // Validate game ID
    if (!gameId || !/^\d+$/.test(gameId)) {
      return { success: false, error: "Invalid game ID. Please enter a valid Roblox game ID." }
    }

    const url = `https://www.roblox.com/games/${gameId}`

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return { success: false, error: `Failed to fetch game details. Status: ${response.status}` }
    }

    const html = await response.text()

    // Use cheerio to parse the HTML
    const $ = load(html)

    // Extract the game title from the h1 element with class "game-name"
    const title = $("h1.game-name").attr("title") || $("h1.game-name").text()

    // Extract the game image from meta tag
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    const imageUrl = imageMatch ? imageMatch[1] : null

    if (!title || !imageUrl) {
      return { success: false, error: "Could not extract game details from the page." }
    }

    return {
      success: true,
      data: {
        name: title,
        imageUrl: imageUrl,
        gameId: gameId,
      },
    }
  } catch (error) {
    console.error("Error fetching game details:", error)
    return { success: false, error: "An error occurred while fetching game details." }
  }
}

// Function to search games by name
export async function fetchGameDetailsByName(gameName: string) {
  try {
    if (!gameName || gameName.trim() === "") {
      return { success: false, error: "Please enter a game name." }
    }

    // Encode the game name for URL
    const encodedName = encodeURIComponent(gameName)
    const url = `https://www.roblox.com/discover/?Keyword=${encodedName}`

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return { success: false, error: `Failed to fetch game details. Status: ${response.status}` }
    }

    const html = await response.text()

    // Use cheerio to parse the HTML
    const $ = load(html)

    // Find all game cards
    const gameResults = []

    // Process each game card
    $("a.game-card-link").each((index, element) => {
      const $element = $(element)

      // Extract game ID and link from href attribute
      const href = $element.attr("href")
      let gameId = ""

      if (href) {
        const gameIdMatch = href.match(/\/games\/(\d+)/)
        if (gameIdMatch && gameIdMatch[1]) {
          gameId = gameIdMatch[1]
        }
      }

      // Extract game name
      const gameName = $element.find(".game-card-name").attr("title") || $element.find(".game-card-name").text()

      // Extract thumbnail
      const thumbnail = $element.find("img").attr("src")

      // Extract stats (likes and playing count)
      const likePercentage = $element.find(".vote-percentage-label").text()
      const playingCount = $element.find(".playing-counts-label").text()

      if (gameId && gameName && thumbnail) {
        gameResults.push({
          gameId,
          name: gameName,
          imageUrl: thumbnail,
          link: href,
          stats: {
            likes: likePercentage,
            playing: playingCount,
          },
        })
      }
    })

    if (gameResults.length === 0) {
      return { success: false, error: "No games found with that name." }
    }

    return {
      success: true,
      data: gameResults,
    }
  } catch (error) {
    console.error("Error searching games by name:", error)
    return { success: false, error: "An error occurred while searching for games." }
  }
}

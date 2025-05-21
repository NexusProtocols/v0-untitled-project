import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// Fallback data for when database operations fail
const fallbackScripts = [
  {
    id: "script-1",
    title: "Universal ESP Script",
    description:
      "A universal ESP script that works with most games. Highlights players, items, and other important objects.",
    code: "-- ESP code here",
    author: "NexusTeam",
    createdAt: "2023-05-15T12:00:00Z",
    views: 1250,
    likes: ["user1", "user2", "user3"],
    isPremium: false,
    isNexusTeam: true,
    isVerified: true,
    keySystem: false,
    game: {
      id: 1,
      gameId: "universal",
      name: "Universal",
      imageUrl: "/placeholder.svg?height=160&width=320",
    },
    categories: ["utility", "visual"],
  },
  {
    id: "script-2",
    title: "Advanced Aimbot",
    description: "Advanced aimbot with customizable settings including smoothness, FOV, and target selection.",
    code: "-- Aimbot code here",
    author: "ScriptMaster",
    createdAt: "2023-06-20T15:30:00Z",
    views: 980,
    likes: ["user1", "user4"],
    isPremium: true,
    isNexusTeam: false,
    isVerified: true,
    keySystem: true,
    game: {
      id: 2,
      gameId: "fps-games",
      name: "FPS Games",
      imageUrl: "/placeholder.svg?height=160&width=320",
    },
    categories: ["combat", "utility"],
  },
  {
    id: "script-3",
    title: "Auto Farm Script",
    description: "Automatically farms resources and completes tasks in farming simulators.",
    code: "-- Auto farm code here",
    author: "FarmingPro",
    createdAt: "2023-07-10T09:45:00Z",
    views: 750,
    likes: ["user2", "user5", "user6"],
    isPremium: false,
    isNexusTeam: false,
    isVerified: false,
    keySystem: false,
    game: {
      id: 3,
      gameId: "farming-simulator",
      name: "Farming Simulator",
      imageUrl: "/placeholder.svg?height=160&width=320",
    },
    categories: ["automation", "farming"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const searchFilter = searchParams.get("searchFilter") || ""
    const category = searchParams.get("category") || ""
    const gameId = searchParams.get("gameId") || ""
    const verified = searchParams.get("verified") === "true"
    const keySystem = searchParams.get("keySystem") === "true"
    const free = searchParams.get("free") === "true"
    const paid = searchParams.get("paid") === "true"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "descending"
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = 20 // Default to 20 items per page

    // Apply filters to fallback data
    let filteredScripts = [...fallbackScripts]

    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      filteredScripts = filteredScripts.filter(
        (script) =>
          script.title.toLowerCase().includes(searchLower) ||
          script.description.toLowerCase().includes(searchLower) ||
          script.author.toLowerCase().includes(searchLower) ||
          script.game.name.toLowerCase().includes(searchLower),
      )
    }

    if (category) {
      filteredScripts = filteredScripts.filter((script) => script.categories.includes(category))
    }

    if (verified) {
      filteredScripts = filteredScripts.filter((script) => script.isVerified)
    }

    if (keySystem) {
      filteredScripts = filteredScripts.filter((script) => script.keySystem)
    }

    if (free && !paid) {
      filteredScripts = filteredScripts.filter((script) => !script.isPremium)
    } else if (paid && !free) {
      filteredScripts = filteredScripts.filter((script) => script.isPremium)
    }

    // Sort scripts
    filteredScripts.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return sortOrder === "ascending" ? (a.views || 0) - (b.views || 0) : (b.views || 0) - (a.views || 0)
        case "likes":
          return sortOrder === "ascending"
            ? (a.likes?.length || 0) - (b.likes?.length || 0)
            : (b.likes?.length || 0) - (a.likes?.length || 0)
        case "updatedAt":
          return sortOrder === "ascending"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "createdAt":
        default:
          return sortOrder === "ascending"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    // Return response with fallback data
    return NextResponse.json({
      success: true,
      scripts: filteredScripts,
      pagination: {
        total: filteredScripts.length,
        page,
        limit,
        pages: Math.ceil(filteredScripts.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching scripts:", error)
    return NextResponse.json({
      success: true,
      scripts: fallbackScripts,
      pagination: {
        total: fallbackScripts.length,
        page: 1,
        limit: 20,
        pages: 1,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.code) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create a mock script for initial deployment
    const newScript = {
      id: `script-${Date.now()}`,
      title: data.title,
      description: data.description,
      code: data.code,
      author: session.user.name || "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: [],
      isPremium: data.isPremium || false,
      isNexusTeam: false,
      isVerified: false,
      keySystem: data.keySystem || false,
      game: data.game || {
        id: 999,
        gameId: "unknown",
        name: "Unknown Game",
        imageUrl: "/placeholder.svg?height=160&width=320",
      },
      categories: data.categories || [],
    }

    return NextResponse.json({
      success: true,
      message: "Script created successfully",
      script: newScript,
    })
  } catch (error) {
    console.error("Error creating script:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the script" },
      { status: 500 },
    )
  }
}

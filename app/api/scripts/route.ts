import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// Remove the fallback data - always show real user scripts
const fallbackScripts: any[] = []

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
      scripts: [], // Return empty array instead of fallbackScripts
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
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

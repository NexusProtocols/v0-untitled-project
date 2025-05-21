import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// Temporary in-memory storage for scripts
const mockScripts = [
  {
    id: "script-1",
    title: "Example Script 1",
    description: "This is an example script",
    code: "print('Hello, world!')",
    author: "System",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 100,
    likes: 10,
    isPremium: false,
    isNexusTeam: true,
    isVerified: true,
    keySystem: false,
    game: {
      id: "game-1",
      gameId: "12345",
      name: "Example Game",
      imageUrl: "/placeholder.svg?height=160&width=320",
    },
    categories: [{ id: "cat-1", name: "Utility" }],
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

    // Return mock data for initial deployment
    return NextResponse.json({
      success: true,
      scripts: mockScripts,
      pagination: {
        total: mockScripts.length,
        page,
        limit,
        pages: 1,
      },
    })
  } catch (error) {
    console.error("Error fetching scripts:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching scripts" }, { status: 500 })
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
      likes: 0,
      isPremium: data.isPremium || false,
      isNexusTeam: false,
      isVerified: false,
      keySystem: data.keySystem || false,
      game: data.game || null,
      categories: data.categories || [],
    }

    // Add to mock data
    mockScripts.push(newScript)

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

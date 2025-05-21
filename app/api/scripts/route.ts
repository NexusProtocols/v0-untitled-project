import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { scriptDb } from "@/lib/db"

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
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = 20 // Default to 20 items per page

    // Get scripts from database
    const result = await scriptDb.getScripts({
      searchFilter,
      category,
      gameId,
      verified,
      keySystem,
      free,
      paid,
      sortBy,
      sortOrder,
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      scripts: result.scripts,
      pagination: result.pagination,
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

    // Create script in database
    const newScript = await scriptDb.createScript({
      title: data.title,
      description: data.description,
      code: data.code,
      author: data.author || session.user.name || "Unknown",
      isPremium: data.isPremium || false,
      isNexusTeam: data.isNexusTeam || false,
      keySystem: data.keySystem || false,
      game: data.game,
      categories: data.categories || [],
    })

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

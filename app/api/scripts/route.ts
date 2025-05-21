import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

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
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    if (searchFilter) {
      where.OR = [
        { title: { contains: searchFilter, mode: "insensitive" } },
        { description: { contains: searchFilter, mode: "insensitive" } },
        { author: { contains: searchFilter, mode: "insensitive" } },
        { gameName: { contains: searchFilter, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categoriesJson = { contains: category }
    }

    if (gameId) {
      where.gameId = gameId
    }

    if (verified) {
      where.isVerified = true
    }

    if (keySystem) {
      where.keySystem = true
    }

    if (free && !paid) {
      where.isPremium = false
    } else if (paid && !free) {
      where.isPremium = true
    }

    // Build the orderBy clause for sorting
    const orderBy: any = {}

    switch (sortBy) {
      case "views":
        orderBy.views = sortOrder === "ascending" ? "asc" : "desc"
        break
      case "updatedAt":
        orderBy.updatedAt = sortOrder === "ascending" ? "asc" : "desc"
        break
      case "createdAt":
      default:
        orderBy.createdAt = sortOrder === "ascending" ? "asc" : "desc"
        break
    }

    // Get scripts from database
    const scripts = await prisma.script.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.script.count({ where })

    // Transform scripts to include parsed categories
    const transformedScripts = scripts.map((script) => {
      const categories = script.categoriesJson ? JSON.parse(script.categoriesJson) : []

      return {
        ...script,
        categories,
        game: {
          id: script.id,
          gameId: script.gameId || "unknown",
          name: script.gameName || "Unknown Game",
          imageUrl: script.gameImage || "/placeholder.svg?height=160&width=320",
        },
      }
    })

    return NextResponse.json({
      success: true,
      scripts: transformedScripts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching scripts:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching scripts",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
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
    const newScript = await prisma.script.create({
      data: {
        title: data.title,
        description: data.description,
        code: data.code,
        author: data.author || session.user.name || "Unknown",
        isPremium: data.isPremium || false,
        isNexusTeam: data.isNexusTeam || false,
        isVerified: false,
        keySystem: data.keySystem || false,
        gameId: data.game?.gameId || "unknown",
        gameName: data.game?.name || "Unknown Game",
        gameImage: data.game?.imageUrl || "/placeholder.svg?height=160&width=320",
        categoriesJson: JSON.stringify(data.categories || []),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Script created successfully",
      script: {
        ...newScript,
        categories: data.categories || [],
        game: {
          id: newScript.id,
          gameId: newScript.gameId || "unknown",
          name: newScript.gameName || "Unknown Game",
          imageUrl: newScript.gameImage || "/placeholder.svg?height=160&width=320",
        },
      },
    })
  } catch (error) {
    console.error("Error creating script:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the script",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

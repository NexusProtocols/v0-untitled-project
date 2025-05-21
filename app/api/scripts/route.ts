import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// Initialize Prisma client
const prisma = new PrismaClient()

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
    const total = Number.parseInt(searchParams.get("total") || "0", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = total > 0 ? total : 20 // Default to 20 items per page if total not specified
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    // Search filter
    if (searchFilter) {
      where.OR = [
        { title: { contains: searchFilter, mode: "insensitive" } },
        { description: { contains: searchFilter, mode: "insensitive" } },
        { author: { contains: searchFilter, mode: "insensitive" } },
        { game: { name: { contains: searchFilter, mode: "insensitive" } } },
      ]
    }

    // Category filter
    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      }
    }

    // Game filter
    if (gameId) {
      where.gameId = gameId
    }

    // Verified filter
    if (verified) {
      where.isVerified = true
    }

    // Key system filter
    if (keySystem) {
      where.keySystem = true
    }

    // Free/Paid filters
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
      case "likes":
        orderBy.likes = { _count: sortOrder === "ascending" ? "asc" : "desc" }
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
    let scripts = []
    let totalCount = 0

    try {
      // Try to get scripts from database
      ;[scripts, totalCount] = await Promise.all([
        prisma.script.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            game: {
              select: {
                id: true,
                gameId: true,
                name: true,
                imageUrl: true,
              },
            },
            categories: {
              select: {
                id: true,
                name: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
          },
        }),
        prisma.script.count({ where }),
      ])
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Fallback to localStorage if database fails
      const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

      // Apply filters
      let filteredScripts = allScripts

      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase()
        filteredScripts = filteredScripts.filter(
          (script: any) =>
            script.title.toLowerCase().includes(searchLower) ||
            script.description.toLowerCase().includes(searchLower) ||
            script.author.toLowerCase().includes(searchLower) ||
            (script.game?.name && script.game.name.toLowerCase().includes(searchLower)),
        )
      }

      if (category) {
        filteredScripts = filteredScripts.filter(
          (script: any) => script.categories && script.categories.includes(category),
        )
      }

      if (gameId) {
        filteredScripts = filteredScripts.filter((script: any) => script.game && script.game.id === gameId)
      }

      if (verified) {
        filteredScripts = filteredScripts.filter((script: any) => script.isVerified)
      }

      if (keySystem) {
        filteredScripts = filteredScripts.filter((script: any) => script.keySystem)
      }

      if (free && !paid) {
        filteredScripts = filteredScripts.filter((script: any) => !script.isPremium)
      } else if (paid && !free) {
        filteredScripts = filteredScripts.filter((script: any) => script.isPremium)
      }

      // Sort scripts
      filteredScripts.sort((a: any, b: any) => {
        let aValue, bValue

        switch (sortBy) {
          case "views":
            aValue = a.views || 0
            bValue = b.views || 0
            break
          case "likes":
            aValue = a.likes?.length || 0
            bValue = b.likes?.length || 0
            break
          case "updatedAt":
            aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime()
            bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime()
            break
          case "createdAt":
          default:
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
        }

        return sortOrder === "ascending" ? aValue - bValue : bValue - aValue
      })

      totalCount = filteredScripts.length
      scripts = filteredScripts.slice(skip, skip + limit)
    }

    // Format scripts for response
    const formattedScripts = scripts.map((script: any) => {
      // If using localStorage fallback, the structure might be different
      if (script.game && typeof script.game === "object") {
        return {
          id: script.id,
          title: script.title,
          description: script.description,
          code: script.code,
          author: script.author,
          createdAt: script.createdAt,
          updatedAt: script.updatedAt,
          views: script.views || 0,
          likes: Array.isArray(script.likes) ? script.likes.length : script.likes?._count || 0,
          isPremium: script.isPremium || false,
          isNexusTeam: script.isNexusTeam || false,
          isVerified: script.isVerified || false,
          keySystem: script.keySystem || false,
          game: script.game,
          categories: Array.isArray(script.categories)
            ? script.categories
            : script.categories?.map((cat: any) => cat.id) || [],
        }
      } else {
        // Direct localStorage structure
        return script
      }
    })

    // Return response
    return NextResponse.json({
      success: true,
      scripts: formattedScripts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
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

    // Check if user is admin for certain operations
    const isAdmin = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"].includes(
      session.user.name || "",
    )

    // Create script in database
    let script

    try {
      script = await prisma.script.create({
        data: {
          title: data.title,
          description: data.description,
          code: data.code,
          author: session.user.name || "Unknown",
          isPremium: data.isPremium || false,
          isNexusTeam: isAdmin,
          isVerified: isAdmin, // Auto-verify admin scripts
          keySystem: data.keySystem || false,
          game: {
            connectOrCreate: {
              where: {
                gameId: data.game?.gameId || "unknown",
              },
              create: {
                gameId: data.game?.gameId || "unknown",
                name: data.game?.name || "Unknown Game",
                imageUrl: data.game?.imageUrl || "/placeholder.svg?height=160&width=320",
              },
            },
          },
          categories: {
            connect: (data.categories || []).map((categoryId: string) => ({ id: categoryId })),
          },
        },
      })
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Fallback to localStorage if database fails
      const newScript = {
        id: `script-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: data.title,
        description: data.description,
        code: data.code,
        author: session.user.name || "Unknown",
        createdAt: new Date().toISOString(),
        views: 0,
        likes: [],
        isPremium: data.isPremium || false,
        isNexusTeam: isAdmin,
        isVerified: isAdmin,
        keySystem: data.keySystem || false,
        game: data.game || null,
        categories: data.categories || [],
      }

      const existingScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
      existingScripts.push(newScript)
      localStorage.setItem("nexus_scripts", JSON.stringify(existingScripts))

      script = newScript
    }

    return NextResponse.json({
      success: true,
      message: "Script created successfully",
      script,
    })
  } catch (error) {
    console.error("Error creating script:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the script" },
      { status: 500 },
    )
  }
}

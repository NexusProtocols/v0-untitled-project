import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { validateApiKey, extractApiKey } from "@/lib/auth-key"
import { v4 as uuidv4 } from "uuid"

// Helper function to get scripts from Supabase
async function getScriptsFromDatabase({
  searchFilter = "",
  category = "",
  gameId = "",
  verified = false,
  keySystem = false,
  free = false,
  paid = false,
  sortBy = "created_at",
  sortOrder = "desc",
  page = 1,
  limit = 20,
}) {
  try {
    const offset = (page - 1) * limit

    // Build the query
    let query = supabase.from("scripts").select("*", { count: "exact" })

    // Apply filters
    if (searchFilter) {
      query = query.or(
        `title.ilike.%${searchFilter}%,description.ilike.%${searchFilter}%,author.ilike.%${searchFilter}%,game_name.ilike.%${searchFilter}%`,
      )
    }

    if (category) {
      query = query.ilike("categories_json", `%${category}%`)
    }

    if (gameId) {
      query = query.eq("game_id", gameId)
    }

    if (verified) {
      query = query.eq("is_verified", true)
    }

    if (keySystem) {
      query = query.eq("key_system", true)
    }

    if (free && !paid) {
      query = query.eq("is_premium", false)
    } else if (paid && !free) {
      query = query.eq("is_premium", true)
    }

    // Apply sorting and pagination
    const {
      data: scripts,
      error,
      count,
    } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching scripts from Supabase:", error)
      throw error
    }

    return {
      scripts: (scripts || []).map((script) => ({
        ...script,
        categories: script.categories_json ? JSON.parse(script.categories_json) : [],
        game: {
          id: script.id,
          gameId: script.game_id || "unknown",
          name: script.game_name || "Unknown Game",
          imageUrl: script.game_image || "/placeholder.svg?height=160&width=320",
        },
      })),
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    }
  } catch (error) {
    console.error("Database error in getScriptsFromDatabase:", error)
    throw error
  }
}

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
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = 20 // Default to 20 items per page

    // Get scripts from database - this endpoint is public for reading
    const result = await getScriptsFromDatabase({
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
    console.error("Error in GET /api/scripts:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch scripts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let user = null
    let authMethod = "none"

    // Try API key authentication first
    const apiKey = extractApiKey(request)
    if (apiKey) {
      const keyValidation = await validateApiKey(apiKey)
      if (keyValidation.isValid && keyValidation.user) {
        user = keyValidation.user
        authMethod = "api_key"
      } else {
        return NextResponse.json({ success: false, message: keyValidation.error || "Invalid API key" }, { status: 401 })
      }
    } else {
      // Fall back to session authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        user = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email,
          permissions: { scripts: { read: true, write: true, delete: false } },
        }
        authMethod = "session"
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check write permissions
    if (!user.permissions?.scripts?.write) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions to create scripts" },
        { status: 403 },
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.code) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: title, description, and code" },
        { status: 400 },
      )
    }

    // Create script in database
    const scriptId = uuidv4()
    const { data: newScript, error } = await supabaseAdmin
      .from("scripts")
      .insert([
        {
          id: scriptId,
          title: data.title,
          description: data.description,
          code: data.code,
          author: data.author || user.username || "Unknown",
          author_id: user.id,
          is_premium: data.isPremium || false,
          is_nexus_team: data.isNexusTeam || false,
          is_verified: false,
          key_system: data.keySystem || false,
          game_id: data.game?.gameId || "unknown",
          game_name: data.game?.name || "Unknown Game",
          game_image: data.game?.imageUrl || "/placeholder.svg?height=160&width=320",
          categories_json: JSON.stringify(data.categories || []),
          views: 0,
          likes_count: 0,
          dislikes_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating script in Supabase:", error)
      return NextResponse.json({ success: false, message: "Failed to create script in database" }, { status: 500 })
    }

    const responseScript = {
      ...newScript,
      categories: data.categories || [],
      game: {
        id: newScript.id,
        gameId: newScript.game_id || "unknown",
        name: newScript.game_name || "Unknown Game",
        imageUrl: newScript.game_image || "/placeholder.svg?height=160&width=320",
      },
    }

    return NextResponse.json({
      success: true,
      message: "Script created successfully",
      script: responseScript,
      authMethod,
    })
  } catch (error) {
    console.error("Error in POST /api/scripts:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the script",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

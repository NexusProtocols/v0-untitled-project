import { supabase, supabaseAdmin } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Script-related database operations
export const scriptDb = {
  // Get all scripts with filtering and pagination
  getScripts: async ({
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
  }) => {
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
      console.error("Error fetching scripts:", error)
      throw error
    }

    return {
      scripts: scripts.map((script) => ({
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
  },

  // Get a single script by ID
  getScriptById: async (id: string) => {
    try {
      const { data: script, error } = await supabase.from("scripts").select("*").eq("id", id).single()

      if (error) throw error
      if (!script) return null

      return {
        ...script,
        categories: script.categories_json ? JSON.parse(script.categories_json) : [],
        game: {
          id: script.id,
          gameId: script.game_id || "unknown",
          name: script.game_name || "Unknown Game",
          imageUrl: script.game_image || "/placeholder.svg?height=160&width=320",
        },
      }
    } catch (error) {
      console.error("Error fetching script by ID:", error)
      throw error
    }
  },

  // Create a new script
  createScript: async (data: any) => {
    try {
      const scriptId = uuidv4()

      const { data: newScript, error } = await supabaseAdmin
        .from("scripts")
        .insert([
          {
            id: scriptId,
            title: data.title,
            description: data.description,
            code: data.code,
            author: data.author,
            author_id: data.authorId,
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

      if (error) throw error

      return {
        ...newScript,
        categories: data.categories || [],
        game: {
          id: newScript.id,
          gameId: newScript.game_id || "unknown",
          name: newScript.game_name || "Unknown Game",
          imageUrl: newScript.game_image || "/placeholder.svg?height=160&width=320",
        },
      }
    } catch (error) {
      console.error("Error creating script:", error)
      throw error
    }
  },

  // Update script views
  incrementViews: async (id: string) => {
    try {
      const { error } = await supabaseAdmin
        .from("scripts")
        .update({ views: supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "views" }) })
        .eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error incrementing script views:", error)
      return false
    }
  },

  // Handle script likes/dislikes
  updateScriptRating: async (id: string, userId: string, isLike: boolean) => {
    try {
      // First check if user has already rated this script
      const { data: existingRating, error: fetchError } = await supabase
        .from("script_ratings")
        .select("*")
        .eq("script_id", id)
        .eq("user_id", userId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError // PGRST116 is "no rows returned"

      if (existingRating) {
        // If rating type is the same, remove the rating
        if (existingRating.is_like === isLike) {
          const { error: deleteError } = await supabaseAdmin
            .from("script_ratings")
            .delete()
            .eq("script_id", id)
            .eq("user_id", userId)

          if (deleteError) throw deleteError

          // Update the script's like/dislike count
          const { error: updateError } = await supabaseAdmin
            .from("scripts")
            .update({
              likes_count: isLike
                ? supabase.rpc("decrement", { row_id: id, table_name: "scripts", column_name: "likes_count" })
                : supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "likes_count" }),
              dislikes_count: isLike
                ? supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "dislikes_count" })
                : supabase.rpc("decrement", { row_id: id, table_name: "scripts", column_name: "dislikes_count" }),
            })
            .eq("id", id)

          if (updateError) throw updateError

          return { action: "removed" }
        } else {
          // If rating type is different, update the rating
          const { error: updateRatingError } = await supabaseAdmin
            .from("script_ratings")
            .update({ is_like: isLike })
            .eq("script_id", id)
            .eq("user_id", userId)

          if (updateRatingError) throw updateRatingError

          // Update the script's like/dislike count
          const { error: updateScriptError } = await supabaseAdmin
            .from("scripts")
            .update({
              likes_count: isLike
                ? supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "likes_count" })
                : supabase.rpc("decrement", { row_id: id, table_name: "scripts", column_name: "likes_count" }),
              dislikes_count: isLike
                ? supabase.rpc("decrement", { row_id: id, table_name: "scripts", column_name: "dislikes_count" })
                : supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "dislikes_count" }),
            })
            .eq("id", id)

          if (updateScriptError) throw updateScriptError

          return { action: "changed" }
        }
      } else {
        // Create a new rating
        const { error: insertError } = await supabaseAdmin.from("script_ratings").insert([
          {
            id: uuidv4(),
            script_id: id,
            user_id: userId,
            is_like: isLike,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (insertError) throw insertError

        // Update the script's like/dislike count
        const { error: updateError } = await supabaseAdmin
          .from("scripts")
          .update({
            likes_count: isLike
              ? supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "likes_count" })
              : supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "likes_count" }),
            dislikes_count: isLike
              ? supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "dislikes_count" })
              : supabase.rpc("increment", { row_id: id, table_name: "scripts", column_name: "dislikes_count" }),
          })
          .eq("id", id)

        if (updateError) throw updateError

        return { action: "added" }
      }
    } catch (error) {
      console.error("Error updating script rating:", error)
      throw error
    }
  },
}

// Gateway-related database operations
export const gatewayDb = {
  // Get a gateway by ID
  getGatewayById: async (id: string) => {
    try {
      const { data, error } = await supabase.from("gateways").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching gateway:", error)
      return null
    }
  },

  // Create a new gateway
  createGateway: async (gatewayData: any) => {
    try {
      const gatewayId = uuidv4()
      const { data, error } = await supabaseAdmin
        .from("gateways")
        .insert([
          {
            id: gatewayId,
            ...gatewayData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating gateway:", error)
      throw error
    }
  },

  // Update a gateway
  updateGateway: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("gateways")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating gateway:", error)
      throw error
    }
  },

  // Track gateway visits and completions
  trackGatewayActivity: async (gatewayId: string, activity: "visit" | "completion") => {
    try {
      // First get the current gateway stats
      const gateway = await gatewayDb.getGatewayById(gatewayId)

      if (!gateway) {
        throw new Error(`Gateway with ID ${gatewayId} not found`)
      }

      // Update the stats
      const stats = gateway.stats || { visits: 0, completions: 0, conversionRate: 0 }

      if (activity === "visit") {
        stats.visits += 1
      } else if (activity === "completion") {
        stats.completions += 1
      }

      // Calculate conversion rate
      stats.conversionRate = stats.visits > 0 ? (stats.completions / stats.visits) * 100 : 0

      // Update the gateway with new stats
      await gatewayDb.updateGateway(gatewayId, { stats })

      return true
    } catch (error) {
      console.error(`Error tracking gateway ${activity}:`, error)
      return false
    }
  },

  // Track detailed gateway analytics
  logGatewayAnalytics: async (data: any) => {
    try {
      const analyticsId = uuidv4()
      const { error } = await supabaseAdmin.from("gateway_analytics").insert([
        {
          id: analyticsId,
          ...data,
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error logging gateway analytics:", error)
      return false
    }
  },
}

// Session-related database operations
export const sessionDb = {
  // Create or update a gateway session
  saveGatewaySession: async (sessionData: any) => {
    try {
      const sessionId = sessionData.id || uuidv4()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now

      const { data, error } = await supabaseAdmin
        .from("gateway_sessions")
        .upsert([
          {
            id: sessionId,
            ...sessionData,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error saving gateway session:", error)
      throw error
    }
  },

  // Get a gateway session
  getGatewaySession: async (sessionId: string) => {
    try {
      const { data, error } = await supabase.from("gateway_sessions").select("*").eq("id", sessionId).single()

      if (error) throw error

      // Check if session is expired
      if (new Date(data.expires_at) < new Date()) {
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching gateway session:", error)
      return null
    }
  },
}

// User-related database operations
export const userDb = {
  // Get user by ID
  getUserById: async (id: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      throw error
    }
  },

  // Get user by username
  getUserByUsername: async (username: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching user by username:", error)
      throw error
    }
  },

  // Create a new user
  createUser: async (userData: any) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").insert([userData]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  // Update user
  updateUser: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },
}

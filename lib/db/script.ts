import { supabase, supabaseAdmin } from "../supabase"
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
      const { error } = await supabaseAdmin.rpc("increment_script_views", { script_id: id })

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
          if (isLike) {
            await supabaseAdmin.rpc("decrement_script_likes", { script_id: id })
          } else {
            await supabaseAdmin.rpc("decrement_script_dislikes", { script_id: id })
          }

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
          if (isLike) {
            await supabaseAdmin.rpc("increment_script_likes", { script_id: id })
            await supabaseAdmin.rpc("decrement_script_dislikes", { script_id: id })
          } else {
            await supabaseAdmin.rpc("decrement_script_likes", { script_id: id })
            await supabaseAdmin.rpc("increment_script_dislikes", { script_id: id })
          }

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
        if (isLike) {
          await supabaseAdmin.rpc("increment_script_likes", { script_id: id })
        } else {
          await supabaseAdmin.rpc("increment_script_dislikes", { script_id: id })
        }

        return { action: "added" }
      }
    } catch (error) {
      console.error("Error updating script rating:", error)
      throw error
    }
  },
}

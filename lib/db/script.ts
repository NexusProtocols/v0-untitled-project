import { supabase, supabaseAdmin } from "@/lib/supabase"

export interface Script {
  id: string
  title: string
  description: string
  code: string
  author: string
  author_id: string
  game_id?: string
  game_name?: string
  game_image?: string
  categories_json: string
  views: number
  likes_count: number
  is_premium: boolean
  is_nexus_team: boolean
  is_verified: boolean
  key_system: boolean
  created_at: string
  updated_at: string
}

export interface ScriptFilters {
  searchFilter?: string
  category?: string
  gameId?: string
  verified?: boolean
  keySystem?: boolean
  free?: boolean
  paid?: boolean
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}

export const scriptDb = {
  async getScripts(filters: ScriptFilters = {}) {
    const {
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
    } = filters

    const offset = (page - 1) * limit

    try {
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
      console.error("Database error in getScripts:", error)
      throw error
    }
  },

  async createScript(scriptData: {
    title: string
    description: string
    code: string
    author: string
    authorId: string
    isPremium?: boolean
    isNexusTeam?: boolean
    keySystem?: boolean
    game?: any
    categories?: string[]
  }) {
    try {
      const { data, error } = await supabaseAdmin
        .from("scripts")
        .insert([
          {
            title: scriptData.title,
            description: scriptData.description,
            code: scriptData.code,
            author: scriptData.author,
            author_id: scriptData.authorId,
            is_premium: scriptData.isPremium || false,
            is_nexus_team: scriptData.isNexusTeam || false,
            key_system: scriptData.keySystem || false,
            game_id: scriptData.game?.gameId || "unknown",
            game_name: scriptData.game?.name || "Unknown Game",
            game_image: scriptData.game?.imageUrl || "/placeholder.svg?height=160&width=320",
            categories_json: JSON.stringify(scriptData.categories || []),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating script:", error)
        throw error
      }

      return {
        ...data,
        categories: data.categories_json ? JSON.parse(data.categories_json) : [],
        game: {
          id: data.id,
          gameId: data.game_id || "unknown",
          name: data.game_name || "Unknown Game",
          imageUrl: data.game_image || "/placeholder.svg?height=160&width=320",
        },
      }
    } catch (error) {
      console.error("Database error in createScript:", error)
      throw error
    }
  },

  async getScriptById(id: string) {
    try {
      const { data, error } = await supabase.from("scripts").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching script:", error)
        throw error
      }

      return {
        ...data,
        categories: data.categories_json ? JSON.parse(data.categories_json) : [],
        game: {
          id: data.id,
          gameId: data.game_id || "unknown",
          name: data.game_name || "Unknown Game",
          imageUrl: data.game_image || "/placeholder.svg?height=160&width=320",
        },
      }
    } catch (error) {
      console.error("Database error in getScriptById:", error)
      throw error
    }
  },

  async updateScript(id: string, updates: Partial<Script>) {
    try {
      const { data, error } = await supabaseAdmin.from("scripts").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating script:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in updateScript:", error)
      throw error
    }
  },

  async deleteScript(id: string) {
    try {
      const { error } = await supabaseAdmin.from("scripts").delete().eq("id", id)

      if (error) {
        console.error("Error deleting script:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Database error in deleteScript:", error)
      throw error
    }
  },

  async incrementViews(id: string) {
    try {
      const { error } = await supabaseAdmin.rpc("increment_script_views", { script_id: id })

      if (error) {
        console.error("Error incrementing views:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Database error in incrementViews:", error)
      throw error
    }
  },
}

import { prisma } from "./prisma"
import { supabase, supabaseAdmin } from "./supabase"

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
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  }) => {
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
    orderBy[sortBy] = sortOrder

    try {
      const [scripts, total] = await Promise.all([
        prisma.script.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.script.count({ where }),
      ])

      return {
        scripts: scripts.map((script) => ({
          ...script,
          categories: script.categoriesJson ? JSON.parse(script.categoriesJson) : [],
          game: {
            id: script.id,
            gameId: script.gameId || "unknown",
            name: script.gameName || "Unknown Game",
            imageUrl: script.gameImage || "/placeholder.svg?height=160&width=320",
          },
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching scripts:", error)
      throw error
    }
  },

  // Get a single script by ID
  getScriptById: async (id: string) => {
    try {
      const script = await prisma.script.findUnique({
        where: { id },
      })

      if (!script) return null

      return {
        ...script,
        categories: script.categoriesJson ? JSON.parse(script.categoriesJson) : [],
        game: {
          id: script.id,
          gameId: script.gameId || "unknown",
          name: script.gameName || "Unknown Game",
          imageUrl: script.gameImage || "/placeholder.svg?height=160&width=320",
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
      const newScript = await prisma.script.create({
        data: {
          title: data.title,
          description: data.description,
          code: data.code,
          author: data.author,
          isPremium: data.isPremium || false,
          isNexusTeam: data.isNexusTeam || false,
          isVerified: false,
          keySystem: data.keySystem || false,
          gameId: data.game?.gameId || "unknown",
          gameName: data.game?.name || "Unknown Game",
          gameImage: data.game?.imageUrl || "/placeholder.svg?height=160&width=320",
          categoriesJson: JSON.stringify(data.categories || []),
          views: 0,
          likesCount: 0,
          dislikesCount: 0,
        },
      })

      return {
        ...newScript,
        categories: data.categories || [],
        game: {
          id: newScript.id,
          gameId: newScript.gameId || "unknown",
          name: newScript.gameName || "Unknown Game",
          imageUrl: newScript.gameImage || "/placeholder.svg?height=160&width=320",
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
      await prisma.script.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      })
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
      const existingRating = await prisma.scriptRating.findUnique({
        where: {
          scriptId_userId: {
            scriptId: id,
            userId,
          },
        },
      })

      if (existingRating) {
        // If rating type is the same, remove the rating
        if (existingRating.isLike === isLike) {
          await prisma.scriptRating.delete({
            where: {
              scriptId_userId: {
                scriptId: id,
                userId,
              },
            },
          })

          // Update the script's like/dislike count
          await prisma.script.update({
            where: { id },
            data: {
              likesCount: isLike ? { decrement: 1 } : { increment: 0 },
              dislikesCount: isLike ? { increment: 0 } : { decrement: 1 },
            },
          })

          return { action: "removed" }
        } else {
          // If rating type is different, update the rating
          await prisma.scriptRating.update({
            where: {
              scriptId_userId: {
                scriptId: id,
                userId,
              },
            },
            data: { isLike },
          })

          // Update the script's like/dislike count
          await prisma.script.update({
            where: { id },
            data: {
              likesCount: isLike ? { increment: 1 } : { decrement: 1 },
              dislikesCount: isLike ? { decrement: 1 } : { increment: 1 },
            },
          })

          return { action: "changed" }
        }
      } else {
        // Create a new rating
        await prisma.scriptRating.create({
          data: {
            scriptId: id,
            userId,
            isLike,
          },
        })

        // Update the script's like/dislike count
        await prisma.script.update({
          where: { id },
          data: {
            likesCount: isLike ? { increment: 1 } : { increment: 0 },
            dislikesCount: isLike ? { increment: 0 } : { increment: 1 },
          },
        })

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
      // First try to get from Prisma
      try {
        const gateway = await prisma.gateway.findUnique({
          where: { id },
        })

        if (gateway) return gateway
      } catch (prismaError) {
        console.warn("Prisma gateway fetch failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { data, error } = await supabase.from("gateways").select("*").eq("id", id).single()

      if (error) {
        console.error("Supabase gateway fetch error:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching gateway:", error)
      return null
    }
  },

  // Create a new gateway
  createGateway: async (gatewayData: any) => {
    try {
      // First try to create with Prisma
      try {
        const gateway = await prisma.gateway.create({
          data: gatewayData,
        })

        return gateway
      } catch (prismaError) {
        console.warn("Prisma gateway creation failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { data, error } = await supabaseAdmin.from("gateways").insert([gatewayData]).select()

      if (error) {
        console.error("Supabase gateway creation error:", error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error("Error creating gateway:", error)
      throw error
    }
  },

  // Update a gateway
  updateGateway: async (id: string, updates: any) => {
    try {
      // First try to update with Prisma
      try {
        const gateway = await prisma.gateway.update({
          where: { id },
          data: updates,
        })

        return gateway
      } catch (prismaError) {
        console.warn("Prisma gateway update failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { data, error } = await supabaseAdmin.from("gateways").update(updates).eq("id", id).select()

      if (error) {
        console.error("Supabase gateway update error:", error)
        throw error
      }

      return data[0]
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
      // First try to create with Prisma
      try {
        await prisma.gatewayAnalytics.create({
          data,
        })

        return true
      } catch (prismaError) {
        console.warn("Prisma analytics logging failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { error } = await supabaseAdmin.from("gateway_analytics").insert([data])

      if (error) {
        console.error("Supabase analytics logging error:", error)
        throw error
      }

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
      // First try to upsert with Prisma
      try {
        const session = await prisma.gatewaySession.upsert({
          where: { id: sessionData.id || "" },
          update: {
            ...sessionData,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          },
          create: {
            ...sessionData,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          },
        })

        return session
      } catch (prismaError) {
        console.warn("Prisma session save failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { data, error } = await supabaseAdmin
        .from("gateway_sessions")
        .upsert([
          {
            ...sessionData,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
          },
        ])
        .select()

      if (error) {
        console.error("Supabase session save error:", error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error("Error saving gateway session:", error)
      throw error
    }
  },

  // Get a gateway session
  getGatewaySession: async (sessionId: string) => {
    try {
      // First try to get from Prisma
      try {
        const session = await prisma.gatewaySession.findUnique({
          where: { id: sessionId },
        })

        if (session) {
          // Check if session is expired
          if (new Date(session.expiresAt) < new Date()) {
            return null
          }
          return session
        }
      } catch (prismaError) {
        console.warn("Prisma session fetch failed, falling back to Supabase:", prismaError)
      }

      // Fallback to Supabase if Prisma fails
      const { data, error } = await supabase.from("gateway_sessions").select("*").eq("id", sessionId).single()

      if (error) {
        console.error("Supabase session fetch error:", error)
        throw error
      }

      // Check if session is expired
      if (new Date(data.expiresAt) < new Date()) {
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
      const user = await prisma.user.findUnique({
        where: { id },
      })
      return user
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      throw error
    }
  },

  // Get user by username
  getUserByUsername: async (username: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      })
      return user
    } catch (error) {
      console.error("Error fetching user by username:", error)
      throw error
    }
  },

  // Create a new user
  createUser: async (userData: any) => {
    try {
      const newUser = await prisma.user.create({
        data: userData,
      })
      return newUser
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  // Update user
  updateUser: async (id: string, updates: any) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
      })
      return updatedUser
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },
}

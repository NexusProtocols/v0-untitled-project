import { supabase, supabaseAdmin } from "../supabase"
import { v4 as uuidv4 } from "uuid"

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

  // Get gateways by creator ID
  getGatewaysByCreator: async (creatorId: string) => {
    try {
      const { data, error } = await supabase
        .from("gateways")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching gateways by creator:", error)
      return []
    }
  },

  // Get all gateways (admin only)
  getAllGateways: async () => {
    try {
      const { data, error } = await supabase.from("gateways").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching all gateways:", error)
      return []
    }
  },

  // Delete a gateway
  deleteGateway: async (id: string) => {
    try {
      const { error } = await supabaseAdmin.from("gateways").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting gateway:", error)
      return false
    }
  },
}

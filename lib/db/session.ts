import { supabase, supabaseAdmin } from "../supabase"
import { v4 as uuidv4 } from "uuid"

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

  // Update a gateway session
  updateGatewaySession: async (sessionId: string, updates: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("gateway_sessions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating gateway session:", error)
      throw error
    }
  },

  // Delete expired sessions
  cleanupExpiredSessions: async () => {
    try {
      const { error } = await supabaseAdmin.from("gateway_sessions").delete().lt("expires_at", new Date().toISOString())

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error)
      return false
    }
  },
}

import { supabase, supabaseAdmin } from "../supabase"

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

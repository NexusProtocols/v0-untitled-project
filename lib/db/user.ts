import { supabase, supabaseAdmin } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  username: string
  discord_id?: string
  discord_username?: string
  discord_avatar?: string
  upload_token: string
  is_admin: boolean
  is_banned: boolean
  is_premium: boolean
  premium_expires?: string
  created_at: string
  updated_at: string
}

export const userDb = {
  async createUser(userData: {
    email: string
    username: string
    discordId?: string
    discordUsername?: string
    discordAvatar?: string
  }) {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .insert([
          {
            email: userData.email,
            username: userData.username,
            discord_id: userData.discordId,
            discord_username: userData.discordUsername,
            discord_avatar: userData.discordAvatar,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating user:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in createUser:", error)
      throw error
    }
  },

  async getUserById(id: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching user:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in getUserById:", error)
      throw error
    }
  },

  async getUserByUsername(username: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

      if (error) {
        console.error("Error fetching user by username:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in getUserByUsername:", error)
      throw error
    }
  },

  async getUserByUploadToken(token: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("upload_token", token).single()

      if (error) {
        console.error("Error fetching user by upload token:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in getUserByUploadToken:", error)
      throw error
    }
  },

  async updateUser(id: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabaseAdmin.from("users").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating user:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in updateUser:", error)
      throw error
    }
  },

  async regenerateUploadToken(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .update({ upload_token: crypto.randomUUID() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error regenerating upload token:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Database error in regenerateUploadToken:", error)
      throw error
    }
  },
}

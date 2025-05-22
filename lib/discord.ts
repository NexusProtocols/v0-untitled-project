import axios from "axios"

// Types for Discord API responses
export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string | null
  verified: boolean
}

export interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

// Discord API service
export const discordApi = {
  // Exchange authorization code for access token
  async exchangeCode(code: string): Promise<DiscordTokenResponse> {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
    })

    const response = await axios.post<DiscordTokenResponse>("https://discord.com/api/oauth2/token", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    return response.data
  },

  // Get user information using access token
  async getUserInfo(accessToken: string, tokenType: string): Promise<DiscordUser> {
    const response = await axios.get<DiscordUser>("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })

    return response.data
  },

  // Add user to Discord guild (server)
  async addUserToGuild(userId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.put(
        `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`,
        { access_token: accessToken },
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      )
      return true
    } catch (error) {
      console.error("Failed to add user to guild:", error)
      return false
    }
  },

  // Generate Discord OAuth2 URL with required scopes
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
      redirect_uri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "",
      response_type: "code",
      scope: "identify email guilds guilds.join",
    })

    if (state) {
      params.append("state", state)
    }

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  },
}

// Function to get Discord information for a user
export async function getUserDiscordInfo(userId: string) {
  try {
    // Query the database to get the user's Discord connection
    const { data: discordConnection, error } = await supabase
      .from("discord_connections")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !discordConnection) {
      return {
        connected: false,
        user: null,
        error: error?.message || "No Discord connection found",
      }
    }

    // Return the Discord user information
    return {
      connected: true,
      user: {
        id: discordConnection.discord_id,
        username: discordConnection.discord_username,
        avatar: discordConnection.discord_avatar,
        discriminator: discordConnection.discord_discriminator || "0000",
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching Discord info:", error)
    return {
      connected: false,
      user: null,
      error: "Failed to fetch Discord information",
    }
  }
}

// Import supabase for the getUserDiscordInfo function
import { supabase } from "./supabase"

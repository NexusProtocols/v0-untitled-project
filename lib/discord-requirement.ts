import { createClient } from "@supabase/supabase-js"
import { env } from "./env"
import { getUserDiscordProfile } from "./discord"

// Initialize Supabase client
const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Check if a user meets the Discord requirements
 * @param userId - The user ID to check
 * @param requirementType - The type of requirement to check (e.g., 'server', 'role')
 * @param requirementValue - The value to check against (e.g., server ID, role ID)
 * @returns An object indicating if the requirement is met and any relevant details
 */
export async function checkDiscordRequirement(
  userId: string,
  requirementType: "server" | "role" | "none",
  requirementValue?: string,
) {
  // If no requirement, return true immediately
  if (requirementType === "none") {
    return {
      success: true,
      message: "No Discord requirement needed",
    }
  }

  try {
    // Get user's Discord connection from database
    const { data: userConnection, error: connectionError } = await supabase
      .from("user_discord_connections")
      .select("discord_id, access_token, refresh_token")
      .eq("user_id", userId)
      .single()

    if (connectionError || !userConnection) {
      return {
        success: false,
        message: "User has no linked Discord account",
      }
    }

    // Get user's Discord profile using the stored tokens
    const discordProfile = await getUserDiscordProfile(userConnection.access_token)

    if (!discordProfile) {
      return {
        success: false,
        message: "Failed to fetch Discord profile",
      }
    }

    // Check specific requirements
    if (requirementType === "server" && requirementValue) {
      // Check if user is in the required server
      const isInServer = await checkUserInServer(
        userConnection.discord_id,
        requirementValue,
        userConnection.access_token,
      )

      return {
        success: isInServer,
        message: isInServer ? "User is in the required Discord server" : "User is not in the required Discord server",
      }
    }

    if (requirementType === "role" && requirementValue) {
      // Check if user has the required role
      const [serverId, roleId] = requirementValue.split(":")

      if (!serverId || !roleId) {
        return {
          success: false,
          message: 'Invalid role requirement format. Expected "serverId:roleId"',
        }
      }

      const hasRole = await checkUserHasRole(userConnection.discord_id, serverId, roleId, userConnection.access_token)

      return {
        success: hasRole,
        message: hasRole ? "User has the required Discord role" : "User does not have the required Discord role",
      }
    }

    return {
      success: false,
      message: "Invalid requirement type",
    }
  } catch (error) {
    console.error("Error checking Discord requirement:", error)
    return {
      success: false,
      message: "Error checking Discord requirement",
    }
  }
}

/**
 * Check if a user is in a specific Discord server
 */
async function checkUserInServer(discordId: string, serverId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return false
    }

    const guilds = await response.json()
    return guilds.some((guild: any) => guild.id === serverId)
  } catch (error) {
    console.error("Error checking user server membership:", error)
    return false
  }
}

/**
 * Check if a user has a specific role in a Discord server
 */
async function checkUserHasRole(
  discordId: string,
  serverId: string,
  roleId: string,
  accessToken: string,
): Promise<boolean> {
  try {
    // First check if the user is in the server
    const isInServer = await checkUserInServer(discordId, serverId, accessToken)

    if (!isInServer) {
      return false
    }

    // Get the user's roles in the server
    const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${discordId}`, {
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, // Note: This requires a bot token
      },
    })

    if (!response.ok) {
      return false
    }

    const member = await response.json()
    return member.roles.includes(roleId)
  } catch (error) {
    console.error("Error checking user role:", error)
    return false
  }
}

import { createClient } from "@/lib/supabase"
import { getUserDiscordInfo } from "@/lib/discord"
import { cookies } from "next/headers"

/**
 * Checks if a user meets the Discord requirements for a specific action
 *
 * @param userId - The user ID to check requirements for
 * @param requirementType - The type of requirement to check (e.g., 'server', 'role', 'verification')
 * @param requirementValue - The specific value to check against (e.g., server ID, role ID)
 * @returns An object containing whether the requirement is met and any relevant details
 */
export async function checkDiscordRequirement(
  userId: string,
  requirementType: "server" | "role" | "verification" = "verification",
  requirementValue?: string,
) {
  try {
    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("discord_id, discord_connected")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: "User not found",
        isConnected: false,
      }
    }

    // Check if Discord is connected
    if (!userData.discord_connected || !userData.discord_id) {
      return {
        success: false,
        message: "Discord account not connected",
        isConnected: false,
      }
    }

    // Get Discord user info
    const discordInfo = await getUserDiscordInfo(userData.discord_id)
    if (!discordInfo) {
      return {
        success: false,
        message: "Failed to fetch Discord information",
        isConnected: true,
      }
    }

    // Check specific requirement type
    switch (requirementType) {
      case "server":
        // Check if user is in a specific server
        if (!requirementValue) {
          return {
            success: false,
            message: "Server ID not provided for verification",
            isConnected: true,
          }
        }

        // This would require an API call to check server membership
        // For now, we'll assume this is handled by the getUserDiscordInfo function
        const isInServer = discordInfo.guilds?.some((guild) => guild.id === requirementValue)
        return {
          success: !!isInServer,
          message: isInServer ? "User is in required server" : "User is not in required server",
          isConnected: true,
          discordInfo,
        }

      case "role":
        // Check if user has a specific role
        if (!requirementValue) {
          return {
            success: false,
            message: "Role ID not provided for verification",
            isConnected: true,
          }
        }

        // This would require an API call to check roles
        // For now, we'll assume this is handled elsewhere
        return {
          success: true, // Placeholder, actual implementation would check roles
          message: "Role verification not fully implemented",
          isConnected: true,
          discordInfo,
        }

      case "verification":
      default:
        // Just check if Discord is connected and verified
        return {
          success: true,
          message: "Discord account is connected",
          isConnected: true,
          discordInfo,
        }
    }
  } catch (error) {
    console.error("Error checking Discord requirement:", error)
    return {
      success: false,
      message: "Error checking Discord requirement",
      isConnected: false,
      error,
    }
  }
}

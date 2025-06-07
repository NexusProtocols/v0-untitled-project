export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1366950971334459484"
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ""
export const DISCORD_LOGIN_URI = "https://nexuslive.vercel.app/discord-login"
export const DISCORD_LINKING_URI = "https://nexuslive.vercel.app/discord-linking"
export const DISCORD_API_ENDPOINT = "https://discord.com/api/v10"
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || ""
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ""

// Scopes needed for the Discord OAuth2 flow
export const DISCORD_SCOPES = ["identify", "email", "guilds", "guilds.join"].join(" ")

// Generate the Discord OAuth2 URL for login or linking
export const getDiscordOAuthURL = (type: "login" | "linking" = "login") => {
  const redirectUri = type === "login" ? DISCORD_LOGIN_URI : DISCORD_LINKING_URI
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: DISCORD_SCOPES,
    state: type, // Pass the type as state to identify the flow
  })

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

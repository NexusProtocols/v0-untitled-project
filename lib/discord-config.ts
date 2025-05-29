export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1366950971334459484"
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "eLW6DXBHcGZ_I9SSJkcngNGuaho9sHg5"
export const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://nexuslive.vercel.app/discord/callback"
export const DISCORD_API_ENDPOINT = "https://discord.com/api/v10"
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || ""
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ""

// Scopes needed for the Discord OAuth2 flow
export const DISCORD_SCOPES = ["identify", "email", "guilds", "guilds.join"].join(" ")

// Generate the Discord OAuth2 URL
export const getDiscordOAuthURL = () => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_SCOPES,
  })

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

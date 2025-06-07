export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1366950971334459484"
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "jyZYfBQRfSMbi_FV9SD6KdVEPh1PRDz0"
export const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://nexuslive.vercel.app/discord-login"
export const DISCORD_LINKING_URI = process.env.DISCORD_LINKING_URI || "https://nexuslive.vercel.app/discord-linking"
export const DISCORD_API_ENDPOINT = "https://discord.com/api/v10"
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || ""
export const DISCORD_BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN || "MTM2Njk1MDk3MTMzNDQ1OTQ4NA.GTBZf1.K-glsdLROuPqE7SG78v9cfdnReL-Iy4u25bmtA"

// Scopes needed for the Discord OAuth2 flow
export const DISCORD_SCOPES = ["identify", "email", "guilds", "guilds.join"].join(" ")

// Generate the Discord OAuth2 URL for login
export const getDiscordOAuthURL = (type: "login" | "linking" = "login") => {
  const redirectUri = type === "login" ? DISCORD_REDIRECT_URI : DISCORD_LINKING_URI
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: DISCORD_SCOPES,
  })

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

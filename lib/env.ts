// Environment variables with type safety
export const env = {
  // Discord OAuth2 credentials
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "",
  DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || "",
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || "",

  // Cloudflare Turnstile
  CLOUDFLARE_SITE_KEY: process.env.CLOUDFLARE_SITE_KEY || "",
  CLOUDFLARE_SECRET_KEY: process.env.CLOUDFLARE_SECRET_KEY || "",

  // API Security
  API_ENCRYPTION_KEY: process.env.API_ENCRYPTION_KEY || "default_encryption_key_should_be_changed",

  // Public variables (safe to expose to browser)
  NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "",
}

// Nexus read write token
export const Nexus_READ_WRITE_TOKEN = process.env.NEXUS_READ_WRITE_TOKEN || ""

// Validate required environment variables on server startup
export function validateEnv() {
  const requiredServerVars = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_REDIRECT_URI",
    "DISCORD_BOT_TOKEN",
    "DISCORD_GUILD_ID",
    "NEXUS_READ_WRITE_TOKEN",
    "CLOUDFLARE_SITE_KEY",
    "CLOUDFLARE_SECRET_KEY",
    "API_ENCRYPTION_KEY",
  ]

  const requiredClientVars = ["NEXT_PUBLIC_DISCORD_CLIENT_ID", "NEXT_PUBLIC_DISCORD_REDIRECT_URI"]

  const missingServerVars = requiredServerVars.filter((key) => !process.env[key])

  const missingClientVars = requiredClientVars.filter((key) => !process.env[key])

  if (missingServerVars.length > 0) {
    throw new Error(`Missing required server environment variables: ${missingServerVars.join(", ")}`)
  }

  if (missingClientVars.length > 0) {
    console.warn(`Missing recommended client environment variables: ${missingClientVars.join(", ")}`)
  }
}

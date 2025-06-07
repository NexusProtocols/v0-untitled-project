import { DISCORD_CONFIG } from "@/lib/discord-config"

export function getDiscordAuthUrl(state = "login"): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_CONFIG.SCOPES.join(" "),
    state: state,
  })

  return `${DISCORD_CONFIG.OAUTH_URL}?${params.toString()}`
}

export function generateDiscordState(type: "login" | "link"): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

export function parseDiscordState(state: string): { type: "login" | "link"; timestamp: number } | null {
  try {
    const parts = state.split("_")
    if (parts.length >= 2) {
      const type = parts[0] as "login" | "link"
      const timestamp = Number.parseInt(parts[1])
      return { type, timestamp }
    }
    return null
  } catch {
    return null
  }
}

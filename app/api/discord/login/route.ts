import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const isLinking = url.searchParams.get("link") === "true"

  // Set up the Discord OAuth URL
  const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize")

  // Add the required parameters
  discordAuthUrl.searchParams.append("client_id", process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "")
  discordAuthUrl.searchParams.append("redirect_uri", process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "")
  discordAuthUrl.searchParams.append("response_type", "code")
  discordAuthUrl.searchParams.append("scope", "identify email guilds.join")

  // Set the state parameter to indicate whether this is a login or linking flow
  discordAuthUrl.searchParams.append("state", isLinking ? "linking" : "login")

  console.log("Redirecting to Discord OAuth:", discordAuthUrl.toString())

  // Redirect to Discord's OAuth page
  return NextResponse.redirect(discordAuthUrl)
}

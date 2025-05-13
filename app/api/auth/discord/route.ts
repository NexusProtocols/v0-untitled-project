import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      console.log("Missing authentication code in request")
      return NextResponse.json({ success: false, message: "Missing code" }, { status: 400 })
    }

    console.log("Exchanging code for access token...")

    // CRITICAL: Make sure these values exactly match what's registered with Discord
    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const redirectUri = process.env.DISCORD_REDIRECT_URI

    // Log the values (without exposing the full secret)
    console.log("OAuth Configuration:", {
      clientId,
      clientSecretProvided: !!clientSecret,
      redirectUri,
    })

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: clientId || "",
      client_secret: clientSecret || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri || "",
    })

    try {
      const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", tokenParams, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const { access_token, token_type } = tokenResponse.data
      console.log("Token obtained successfully")

      // Get user information
      const userResponse = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      })

      const discordUser = userResponse.data
      console.log("User data retrieved:", discordUser.username)

      // Try to add user to Discord guild (silent fail)
      if (process.env.DISCORD_GUILD_ID && process.env.DISCORD_BOT_TOKEN) {
        try {
          await axios.put(
            `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUser.id}`,
            { access_token },
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          )
          console.log("User added to guild successfully")
        } catch (guildError: any) {
          console.error("Failed to add user to guild:", guildError.message)
          // Continue anyway, this is not critical
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          id: discordUser.id,
          username: discordUser.username,
          email: discordUser.email,
          verified: discordUser.verified,
          isLinking: state === "linking",
        },
      })
    } catch (tokenError: any) {
      console.error("Token exchange error:", tokenError.message)
      if (tokenError.response) {
        console.error("Response data:", tokenError.response.data)
        console.error("Response status:", tokenError.response.status)
      }
      throw new Error(`Token exchange failed: ${tokenError.message}`)
    }
  } catch (error: any) {
    console.error("Discord authentication error:", error.message)
    return NextResponse.json(
      {
        success: false,
        message: "Discord authentication failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function GET(request: NextRequest) {
  // Get the code and state from the URL query parameters
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  console.log("Discord callback received:", {
    codeReceived: !!code,
    state,
    error,
  })

  if (error) {
    // Redirect to login with error if Discord returned an error
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  }

  if (!code) {
    // Redirect to login with error if no code is provided
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
  }

  try {
    // Step 1: Exchange the code for an access token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )

    console.log("Token response received:", tokenResponse.data)

    const { access_token, token_type } = tokenResponse.data

    // Step 2: Fetch user details
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    })

    console.log("User data received:", userResponse.data)

    const discordUser = userResponse.data

    // Step 3: Add the user to your Discord server
    try {
      await axios.put(
        `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUser.id}`,
        {
          access_token: access_token,
        },
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      )
      console.log(`User ${discordUser.username} added to Discord server`)
    } catch (guildError) {
      console.error("Failed to add user to guild:", guildError.response?.data || guildError.message)
      // Continue anyway, this shouldn't block the auth process
    }

    // Create a URL-safe base64 encoded string of the Discord user data
    const userData = Buffer.from(JSON.stringify(discordUser)).toString("base64")

    // Redirect to the client-side callback handler with user data
    const callbackUrl = new URL("/auth/discord-callback", request.url)
    callbackUrl.searchParams.set("data", userData)
    if (state) {
      callbackUrl.searchParams.set("state", state)
    }

    console.log("Redirecting to:", callbackUrl.toString())
    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error("Discord callback error:", error.response?.data || error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || "Authentication failed")}`, request.url),
    )
  }
}

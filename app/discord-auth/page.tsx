"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DiscordAuthPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Processing Discord login...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processDiscordAuth = async () => {
      try {
        // Get the code from sessionStorage (set by the callback page)
        const code = sessionStorage.getItem("discord_auth_code")
        const state = sessionStorage.getItem("discord_auth_state")

        if (!code) {
          setError("No authentication code found")
          setLoading(false)
          return
        }

        // Exchange the code for Discord user data
        const response = await fetch("/api/discord/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        })

        if (!response.ok) {
          throw new Error("Failed to authenticate with Discord")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Authentication failed")
        }

        const discordUser = data.user
        const isLinking = state === "linking"

        // Process the Discord user data
        await processDiscordUser(discordUser, isLinking)

        // Clear the sessionStorage
        sessionStorage.removeItem("discord_auth_code")
        sessionStorage.removeItem("discord_auth_state")
      } catch (err) {
        console.error("Authentication error:", err)
        setError(err instanceof Error ? err.message : "Failed to process Discord login")
        setLoading(false)
      }
    }

    processDiscordAuth()
  }, [router])

  const processDiscordUser = async (discordUser: any, isLinking: boolean) => {
    const allStoredKeys = Object.keys(localStorage)
    let existingAccountWithDiscord = null

    // Check for existing account with this Discord ID
    for (const key of allStoredKeys) {
      if (key.startsWith("nexus_user_")) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || "{}")
          if (userData.discord_id === discordUser.id) {
            existingAccountWithDiscord = key.replace("nexus_user_", "")
            break
          }
        } catch (e) {
          continue
        }
      }
    }

    // Linking flow
    if (isLinking) {
      if (existingAccountWithDiscord) {
        setError("This Discord account is already linked to another user")
        setTimeout(() => router.push("/profile?error=already_linked"), 2000)
        return
      }

      const currentUser = localStorage.getItem("nexus_current_user")
      if (!currentUser) {
        setError("You must be logged in to link your Discord account")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      // Update current user with Discord info
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${currentUser}`) || "{}")
      localStorage.setItem(
        `nexus_user_${currentUser}`,
        JSON.stringify({
          ...userData,
          discord_id: discordUser.id,
          discord_username: discordUser.username,
          email: userData.email || discordUser.email,
          emailVerified: userData.emailVerified || discordUser.verified,
        }),
      )

      setStatus("Discord account linked successfully!")
      setTimeout(() => router.push("/profile?discord_linked=true"), 1500)
      return
    }

    // Login flow - existing account
    if (existingAccountWithDiscord) {
      localStorage.setItem("nexus_current_user", existingAccountWithDiscord)
      setStatus("Logging in with existing account...")
      setTimeout(() => router.push("/scripts"), 1500)
      return
    }

    // Login flow - new account (auto-create account)
    const baseUsername = discordUser.username.replace(/[^a-zA-Z0-9]/g, "")
    let finalUsername = baseUsername
    let counter = 1

    while (
      allStoredKeys.some(
        (key) =>
          key.startsWith("nexus_user_") && key.replace("nexus_user_", "").toLowerCase() === finalUsername.toLowerCase(),
      )
    ) {
      finalUsername = `${baseUsername}${counter}`
      counter++
    }

    const newUser = {
      username: finalUsername,
      password: `discord_${Math.random().toString(36).substring(2, 15)}`,
      email: discordUser.email,
      emailVerified: discordUser.verified,
      createdAt: new Date().toISOString(),
      discord_id: discordUser.id,
      discord_username: discordUser.username,
    }

    localStorage.setItem(`nexus_user_${finalUsername}`, JSON.stringify(newUser))
    localStorage.setItem("nexus_current_user", finalUsername)
    setStatus("Creating new account...")
    setTimeout(() => router.push("/scripts"), 1500)
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-md rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-8 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-white">Authentication Error</h1>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded bg-[#00ff9d] px-4 py-2 font-semibold text-[#050505] hover:bg-[#00e68a] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-md rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">{status}</h1>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    </div>
  )
}

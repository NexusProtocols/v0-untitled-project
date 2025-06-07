"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DiscordLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Processing Discord login...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processDiscordAuth = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code) {
          setError("No authentication code found")
          setLoading(false)
          return
        }

        // Exchange the code for Discord user data
        const response = await fetch("/api/auth/discord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state: "login" }),
        })

        if (!response.ok) {
          throw new Error("Failed to authenticate with Discord")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Authentication failed")
        }

        const discordUser = data.user
        await processDiscordUser(discordUser)
      } catch (err) {
        console.error("Authentication error:", err)
        setError(err instanceof Error ? err.message : "Failed to process Discord login")
        setLoading(false)
      }
    }

    processDiscordAuth()
  }, [router, searchParams])

  const processDiscordUser = async (discordUser: any) => {
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
      avatar: discordUser.avatar,
      profilePicture: discordUser.avatar, // Set Discord avatar as profile picture
    }

    localStorage.setItem(`nexus_user_${finalUsername}`, JSON.stringify(newUser))
    localStorage.setItem("nexus_current_user", finalUsername)
    setStatus("Creating new account...")
    setTimeout(() => router.push("/scripts"), 1500)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-white font-semibold py-3 px-6 rounded-xl hover:from-[#ff0000] hover:to-[#cc0000] transition-all duration-200 transform hover:scale-105"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-[#00ff9d]/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#00ff9d]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fab fa-discord text-[#00ff9d] text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{status}</h1>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-[#00ff9d]/20 border-t-[#00ff9d] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

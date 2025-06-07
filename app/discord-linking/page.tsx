"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DiscordLinkingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Processing Discord account linking...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processDiscordLinking = async () => {
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
          body: JSON.stringify({ code, state: "linking" }),
        })

        if (!response.ok) {
          throw new Error("Failed to authenticate with Discord")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Authentication failed")
        }

        const discordUser = data.user
        await processDiscordLinking(discordUser)
      } catch (err) {
        console.error("Linking error:", err)
        setError(err instanceof Error ? err.message : "Failed to link Discord account")
        setLoading(false)
      }
    }

    processDiscordLinking()
  }, [router, searchParams])

  const processDiscordLinking = async (discordUser: any) => {
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
    const updatedUserData = {
      ...userData,
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      email: userData.email || discordUser.email,
      emailVerified: userData.emailVerified || discordUser.verified,
      avatar: discordUser.avatar,
      profilePicture: userData.profilePicture || discordUser.avatar, // Use Discord avatar if no profile picture set
    }

    localStorage.setItem(`nexus_user_${currentUser}`, JSON.stringify(updatedUserData))

    setStatus("Discord account linked successfully!")
    setTimeout(() => router.push("/profile?discord_linked=true"), 1500)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Linking Error</h1>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-white font-semibold py-3 px-6 rounded-xl hover:from-[#ff0000] hover:to-[#cc0000] transition-all duration-200 transform hover:scale-105"
            >
              Back to Profile
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

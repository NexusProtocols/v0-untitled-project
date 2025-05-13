"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function DiscordAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Processing Discord authentication...")
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const processDiscordAuth = async () => {
      try {
        // Get the state and data from the URL
        const state = searchParams.get("state") // "linking" or "login"
        const encodedData = searchParams.get("data")
        const isLinking = state === "linking"

        console.log("Processing Discord auth:", { state, dataReceived: !!encodedData })

        if (!encodedData) {
          setError("Discord user data not found")
          setDebugInfo({ searchParams: Object.fromEntries(searchParams.entries()) })
          setLoading(false)
          return
        }

        // Decode the base64 encoded user data
        let discordUser
        try {
          const decodedData = Buffer.from(encodedData, "base64").toString()
          discordUser = JSON.parse(decodedData)
          console.log("Decoded Discord user:", discordUser)
        } catch (e) {
          setError("Failed to decode Discord user data")
          setDebugInfo({ error: e.message, encodedData })
          setLoading(false)
          return
        }

        if (!discordUser || !discordUser.id) {
          setError("Invalid Discord user data")
          setDebugInfo({ discordUser })
          setLoading(false)
          return
        }

        setStatus(`${isLinking ? "Linking" : "Logging in with"} Discord...`)

        // Get current user if linking
        const currentUser = localStorage.getItem("nexus_current_user")

        if (isLinking && !currentUser) {
          setError("You must be logged in to link your Discord account")
          setLoading(false)
          return
        }

        // Check if this Discord ID is already linked to another account
        const allStoredKeys = Object.keys(localStorage)
        let existingAccountWithDiscord = null

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

        // Handle linking flow
        if (isLinking) {
          if (existingAccountWithDiscord) {
            setError("This Discord account is already linked to another user")
            setTimeout(() => router.push("/profile?error=already_linked"), 2000)
            return
          }

          // Update current user with Discord info
          const userData = JSON.parse(localStorage.getItem(`nexus_user_${currentUser}`) || "{}")
          userData.discord_id = discordUser.id
          userData.discord_username = discordUser.username || discordUser.global_name || "Discord User"

          // Only update email if user doesn't have one and Discord email is verified
          if (!userData.email && discordUser.email && discordUser.verified) {
            userData.email = discordUser.email
            userData.emailVerified = true
          }

          localStorage.setItem(`nexus_user_${currentUser}`, JSON.stringify(userData))

          setStatus("Discord account linked successfully!")
          setTimeout(() => router.push("/profile?discord_linked=true"), 1500)
          return
        }

        // Handle login flow
        if (existingAccountWithDiscord) {
          // Log in with existing account
          localStorage.setItem("nexus_current_user", existingAccountWithDiscord)
          setStatus("Logging in with existing account...")
          setTimeout(() => router.push("/scripts"), 1500)
        } else {
          // Create new account
          const baseUsername = (discordUser.username || discordUser.global_name || "User").replace(/[^a-zA-Z0-9]/g, "")
          let finalUsername = baseUsername
          let counter = 1

          while (
            allStoredKeys.some(
              (key) =>
                key.startsWith("nexus_user_") &&
                key.replace("nexus_user_", "").toLowerCase() === finalUsername.toLowerCase(),
            )
          ) {
            finalUsername = `${baseUsername}${counter}`
            counter++
          }

          const newUser = {
            username: finalUsername,
            password: `discord_${Math.random().toString(36).substring(2, 15)}`,
            email: discordUser.email || null,
            emailVerified: discordUser.verified || false,
            createdAt: new Date().toISOString(),
            discord_id: discordUser.id,
            discord_username: discordUser.username || discordUser.global_name || "Discord User",
          }

          localStorage.setItem(`nexus_user_${finalUsername}`, JSON.stringify(newUser))
          localStorage.setItem("nexus_current_user", finalUsername)
          setStatus("Creating new account...")
          setTimeout(() => router.push("/scripts"), 1500)
        }
      } catch (err) {
        console.error("Authentication error:", err)
        setError(err instanceof Error ? err.message : "Failed to process Discord login")
        setDebugInfo({ error: err })
        setLoading(false)
      }
    }

    processDiscordAuth()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-md rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-8 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-white">Authentication Error</h1>
          <p className="text-red-400">{error}</p>

          {debugInfo && (
            <div className="mt-4 p-4 bg-[#0a0a0a] rounded overflow-auto max-h-60">
              <p className="text-xs text-gray-400 mb-2">Debug information:</p>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

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

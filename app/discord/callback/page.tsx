"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DiscordCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Processing Discord authentication...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state") // "linking" or "login"

    console.log("Discord callback received:", {
      codeReceived: !!code,
      error,
      state,
    })

    if (error) {
      setError("Authentication was denied or failed")
      setTimeout(() => router.push("/login?error=discord_auth_failed"), 2000)
      return
    }

    if (!code) {
      setError("No authentication code received")
      setTimeout(() => router.push("/login?error=missing_code"), 2000)
      return
    }

    // Redirect to the auth page which will process the code
    router.push(`/auth/discord-callback?code=${code}${state ? `&state=${state}` : ""}`)
  }, [router, searchParams])

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

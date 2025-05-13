"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FaDiscord } from "react-icons/fa"

interface DiscordLoginButtonProps {
  isLinking?: boolean
  className?: string
}

export function DiscordLoginButton({ isLinking = false, className = "" }: DiscordLoginButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      // Redirect to our API route that will handle the Discord OAuth flow
      router.push(`/api/discord/login${isLinking ? "?link=true" : ""}`)
    } catch (error) {
      console.error("Discord login error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={`flex items-center gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] ${className}`}
      onClick={handleLogin}
      disabled={isLoading}
    >
      <FaDiscord className="h-5 w-5" />
      {isLinking ? "Link Discord Account" : "Login with Discord"}
    </Button>
  )
}

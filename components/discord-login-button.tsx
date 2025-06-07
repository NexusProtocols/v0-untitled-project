"use client"

import type React from "react"

import { getDiscordOAuthURL } from "@/lib/discord-config"

interface DiscordLoginButtonProps {
  type?: "login" | "linking"
  className?: string
  children?: React.ReactNode
}

export function DiscordLoginButton({ type = "login", className = "", children }: DiscordLoginButtonProps) {
  const handleDiscordAuth = () => {
    const authUrl = getDiscordOAuthURL(type)
    window.location.href = authUrl
  }

  const defaultText = type === "login" ? "Continue with Discord" : "Link Discord Account"

  return (
    <button
      onClick={handleDiscordAuth}
      className={`inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#5865F2]/25 ${className}`}
    >
      <i className="fab fa-discord text-xl"></i>
      {children || defaultText}
    </button>
  )
}

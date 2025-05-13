"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string | null }>({
    type: null,
    text: null,
  })

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const validateUsername = (username: string): string | null => {
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3-20 characters"
    }
    return null
  }

  const validatePassword = (password: string, username: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }

    const bannedPasswords = ["12345678", "87654321"]
    if (bannedPasswords.includes(password)) {
      return "This password is not allowed"
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      return "Password cannot contain your username"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setMessage({ type: null, text: null })

    try {
      if (!username || !password || !confirmPassword) {
        setError("All fields are required")
        return
      }

      // Validate username
      const usernameError = validateUsername(username)
      if (usernameError) {
        setError(usernameError)
        return
      }

      // Check if username is blacklisted
      const blacklistedUsernames = JSON.parse(localStorage.getItem("nexus_blacklisted_usernames") || "[]")
      if (blacklistedUsernames.some((banned: string) => banned.toLowerCase() === username.toLowerCase())) {
        setError("This username is not available. Please choose a different one.")
        return
      }

      // Validate password
      const passwordError = validatePassword(password, username)
      if (passwordError) {
        setError(passwordError)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      // Check if username exists (case-insensitive)
      const allStoredKeys = Object.keys(localStorage)
      for (const key of allStoredKeys) {
        if (key.startsWith("nexus_user_")) {
          const storedUsername = key.replace("nexus_user_", "")
          if (storedUsername.toLowerCase() === username.toLowerCase()) {
            setError("Username already exists. Please choose a different one.")
            return
          }
        }
      }

      // Get IP address
      let ip = "Unknown"
      try {
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        ip = data.ip
      } catch (error) {
        console.error("Error fetching IP:", error)
      }

      // Get browser and OS info
      const browser = getBrowserInfo()
      const os = getOSInfo()

      // Create new user
      const userData = {
        username,
        password,
        createdAt: new Date().toISOString(),
        ip,
        browser,
        os,
      }

      localStorage.setItem(`nexus_user_${username}`, JSON.stringify(userData))

      // Auto-login the user
      localStorage.setItem("nexus_current_user", username)

      // Show success message
      setMessage({ type: "success", text: "Account created successfully! Redirecting..." })

      // Redirect to scripts page and force refresh
      setTimeout(() => {
        window.location.href = "/scripts"
      }, 1500)
    } catch (error) {
      console.error("Signup error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function getBrowserInfo() {
    const userAgent = navigator.userAgent
    let browserName = "Unknown"

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome"
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox"
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari"
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera"
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge"
    }

    return browserName
  }

  function getOSInfo() {
    const userAgent = navigator.userAgent
    let osName = "Unknown"

    if (userAgent.indexOf("Win") !== -1) {
      osName = "Windows"
    } else if (userAgent.indexOf("Mac") !== -1) {
      osName = "MacOS"
    } else if (userAgent.indexOf("Linux") !== -1) {
      osName = "Linux"
    } else if (userAgent.indexOf("Android") !== -1) {
      osName = "Android"
    } else if (userAgent.indexOf("iOS") !== -1) {
      osName = "iOS"
    }

    return osName
  }

  return (
    <div className="container mx-auto px-5 py-12">
      <div className="mx-auto max-w-md rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#ff3e3e]/10">
        <h1 className="mb-6 text-2xl font-bold text-white transition-all duration-300 hover:text-[#ff3e3e]">
          Create an Account
        </h1>

        {error && <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-200">{error}</div>}
        {message.type === "success" && (
          <div className="mb-4 rounded bg-green-900/30 p-3 text-sm text-green-200">{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block font-medium text-[#ff3e3e]">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-4 text-white transition-all duration-300 hover:border-[#ff3e3e]/50 hover:shadow-md hover:shadow-[#ff3e3e]/10 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
            />
            <p className="mt-1 text-xs text-gray-400">Username must be between 3-20 characters</p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block font-medium text-[#ff3e3e]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-4 text-white transition-all duration-300 hover:border-[#ff3e3e]/50 hover:shadow-md hover:shadow-[#ff3e3e]/10 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
            />
            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters and cannot contain your username
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block font-medium text-[#ff3e3e]">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-4 text-white transition-all duration-300 hover:border-[#ff3e3e]/50 hover:shadow-md hover:shadow-[#ff3e3e]/10 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#ff3e3e] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

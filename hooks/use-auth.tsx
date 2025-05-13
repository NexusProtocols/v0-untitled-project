"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  username: string
  email?: string
  emailVerified?: boolean
  createdAt: string
  discord_id?: string
  discord_username?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("nexus_current_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(localStorage.getItem(`nexus_user_${storedUser}`) || "{}")
        if (userData) {
          setUser({
            id: userData.username,
            username: userData.username,
            email: userData.email,
            emailVerified: userData.emailVerified,
            createdAt: userData.createdAt,
            discord_id: userData.discord_id,
            discord_username: userData.discord_username,
          })
        }
      } catch (error) {
        console.error("Failed to parse user data", error)
        localStorage.removeItem("nexus_current_user")
      }
    }
    setIsLoading(false)
  }, [])

  // Enhance security in the auth hooks

  // Add this function to sanitize user input
  const sanitizeInput = (input: string): string => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  }

  // Modify the login function to use sanitized inputs
  const login = async (username: string, password: string) => {
    try {
      // Sanitize inputs
      const sanitizedUsername = sanitizeInput(username)

      // Find user by username (case-insensitive)
      const allStoredKeys = Object.keys(localStorage)
      let userKey = null

      for (const key of allStoredKeys) {
        if (key.startsWith("nexus_user_")) {
          const storedUsername = key.replace("nexus_user_", "")
          if (storedUsername.toLowerCase() === sanitizedUsername.toLowerCase()) {
            userKey = key
            break
          }
        }
      }

      if (!userKey) {
        return false
      }

      const userData = JSON.parse(localStorage.getItem(userKey) || "null")

      if (!userData || userData.password !== password) {
        return false
      }

      // Check if user is banned
      if (userData.isBanned) {
        // Still allow login but the ban notification will show
        console.log("User is banned:", userData.bannedReason)
      }

      // Track user's IP address
      try {
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        const ip = data.ip

        // Update user data with IP
        userData.ip = ip
        localStorage.setItem(userKey, JSON.stringify(userData))

        // Also update browser and OS info
        userData.browser = getBrowserInfo()
        userData.os = getOSInfo()
        localStorage.setItem(userKey, JSON.stringify(userData))
      } catch (error) {
        console.error("Error tracking IP:", error)
      }

      setUser({
        id: userData.username,
        username: userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        discord_id: userData.discord_id,
        discord_username: userData.discord_username,
      })

      localStorage.setItem("nexus_current_user", userData.username)
      return true
    } catch (error) {
      console.error("Login error", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("nexus_current_user")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
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

export function useAuth() {
  return useContext(AuthContext)
}

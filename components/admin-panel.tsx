"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isAdmin } from "@/lib/admin"
import { useRouter } from "next/navigation"

type UserData = {
  username: string
  email?: string
  emailVerified?: boolean
  createdAt: string
  profilePicture?: string
  bio?: string
  ip?: string
  hwid?: string
  bannedReason?: string
  isBanned?: boolean
  banExpiration?: string | null
  browser?: string
  os?: string
  macAddress?: string
  autoDeleteAfterBan?: boolean
  autoDeleteDate?: string
}

type BanOptions = {
  accountBan: boolean
  ipBan: boolean
  hwidBan: boolean
}

interface AdminPanelProps {
  username: string
  onAuthenticated: () => void
}

export function AdminPanel({ username, onAuthenticated }: AdminPanelProps) {
  const { user } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [banOptions, setBanOptions] = useState<BanOptions>({
    accountBan: true,
    ipBan: false,
    hwidBan: false,
  })
  const [banReason, setBanReason] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([])
  const [banDuration, setBanDuration] = useState("permanent")
  const [customBanReason, setCustomBanReason] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.username)
        setIsAdminUser(adminStatus)
      }
    }

    const loadUserData = () => {
      try {
        // Load user profile data
        const profileData = localStorage.getItem(`nexus_profile_${username}`)
        const userData = localStorage.getItem(`nexus_user_${username}`)

        if (profileData) {
          const parsedProfile = JSON.parse(profileData)
          setUserData(parsedProfile)
        } else if (userData) {
          const parsedUserData = JSON.parse(userData)
          const hwid = parsedUserData.hwid || "Not Available"
          const ip = parsedUserData.ip || "Not Available"

          setUserData({
            username,
            email: parsedUserData.email,
            emailVerified: parsedUserData.emailVerified,
            createdAt: parsedUserData.createdAt || new Date().toISOString(),
            ip: ip,
            hwid: hwid,
            isBanned: parsedUserData.isBanned,
            bannedReason: parsedUserData.bannedReason,
            banExpiration: parsedUserData.banExpiration,
            browser: parsedUserData.browser,
            os: parsedUserData.os,
            macAddress: parsedUserData.macAddress,
            autoDeleteAfterBan: parsedUserData.autoDeleteAfterBan,
            autoDeleteDate: parsedUserData.autoDeleteDate,
          })
        }

        // Find connected accounts
        const allStoredKeys = Object.keys(localStorage)
        const connectedAccts: string[] = []

        if (userData) {
          const currentUserData = JSON.parse(userData)
          const hwidKey = currentUserData.hwid
          const ipValue = currentUserData.ip

          for (const key of allStoredKeys) {
            if (key.startsWith("nexus_user_") && key !== `nexus_user_${username}`) {
              const otherUser = JSON.parse(localStorage.getItem(key) || "{}")
              if ((hwidKey && otherUser.hwid === hwidKey) || (ipValue && otherUser.ip === ipValue)) {
                connectedAccts.push(key.replace("nexus_user_", ""))
              }
            }
          }
        }

        setConnectedAccounts(connectedAccts)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
    loadUserData()
  }, [user, username])

  const handleBanUser = () => {
    if (!userData) return

    let banExpiration = null
    if (banDuration !== "permanent") {
      const days = Number.parseInt(banDuration.replace("d", ""))
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + days)
      banExpiration = expirationDate.toISOString()
    }

    const finalBanReason = banReason === "Custom" ? customBanReason : banReason

    const updatedUserData = {
      ...userData,
      isBanned: true,
      bannedReason: finalBanReason || "Violation of terms of service",
      banExpiration: banExpiration,
    }

    localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedUserData))
    localStorage.setItem(
      `nexus_user_${username}`,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(`nexus_user_${username}`) || "{}"),
        isBanned: true,
        bannedReason: finalBanReason || "Violation of terms of service",
        banExpiration: banExpiration,
      }),
    )

    if (banOptions.ipBan && userData.ip) {
      const bannedIPs = JSON.parse(localStorage.getItem("nexus_banned_ips") || "[]")
      if (!bannedIPs.includes(userData.ip)) {
        bannedIPs.push(userData.ip)
        localStorage.setItem("nexus_banned_ips", JSON.stringify(bannedIPs))
      }
    }

    if (banOptions.hwidBan && userData.hwid) {
      const bannedHWIDs = JSON.parse(localStorage.getItem("nexus_banned_hwids") || "[]")
      if (!bannedHWIDs.includes(userData.hwid)) {
        bannedHWIDs.push(userData.hwid)
        localStorage.setItem("nexus_banned_hwids", JSON.stringify(bannedHWIDs))
      }
    }

    setShowBanModal(false)
  }

  const handleUnbanUser = () => {
    if (!userData) return

    const updatedUserData = {
      ...userData,
      isBanned: false,
      bannedReason: "",
      banExpiration: null,
    }

    localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedUserData))
    localStorage.setItem(
      `nexus_user_${username}`,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(`nexus_user_${username}`) || "{}"),
        isBanned: false,
        bannedReason: "",
        banExpiration: null,
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("admin_token", data.token)
        onAuthenticated()
      } else {
        setError("Invalid password")
      }
    } catch (error) {
      setError("Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdminUser) {
    return <div className="p-4 text-red-500">You don't have admin privileges</div>
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!userData) {
    return <div className="p-4 text-red-500">User not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <i className="fas fa-shield-alt text-4xl text-red-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Secure Authentication Required</h2>
            <p className="text-gray-400">Please enter the admin password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Authenticate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

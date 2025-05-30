"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// Define the admin token constant
const ADMIN_TOKEN_KEY =
  "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93"

type User = {
  username: string
  email?: string
  emailVerified?: boolean
  createdAt: string
  profilePicture?: string
  bio?: string
  isBanned?: boolean
  bannedReason?: string
  banExpiration?: string | null
  ip?: string
  hwid?: string
  browser?: string
  os?: string
}

type Key = {
  id: string
  title: string
  description: string
  keyCode: string
  author: string
  createdAt: string
  imageUrl: string
  isPremium?: boolean
  isNexusTeam?: boolean
  usageCount?: number
}

type Script = {
  id: string
  title: string
  description: string
  code: string
  author: string
  createdAt: string
  views?: number
  likes?: string[]
  dislikes?: string[]
}

type Stats = {
  totalUsers: number
  totalKeys: number
  totalScripts: number
  totalViews: number
  bannedUsers: number
  premiumKeys: number
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "keys" | "scripts" | "settings">("overview")
  const [users, setUsers] = useState<User[]>([])
  const [keys, setKeys] = useState<Key[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalKeys: 0,
    totalScripts: 0,
    totalViews: 0,
    bannedUsers: 0,
    premiumKeys: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // List of admin usernames
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

  // Admin password (in a real app, this would be stored securely on the server)
  const ADMIN_PASSWORD = "nexus_admin_2025"

  useEffect(() => {
    const checkAdminAccess = () => {
      if (isLoading) return

      // Check if user is admin by username only
      if (user) {
        const isUserAdmin = adminUsernames.includes(user.username)
        setUserIsAdmin(isUserAdmin)
        setAdminCheckComplete(true)
        return
      }

      // If not logged in, check for admin token in localStorage
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (adminToken) {
        setUserIsAdmin(true)
        setAdminCheckComplete(true)
        return
      }

      // Not an admin, set state accordingly
      setUserIsAdmin(false)
      setAdminCheckComplete(true)
    }

    checkAdminAccess()
  }, [user, isLoading])

  // Check if admin is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem("nexus_admin_auth")
    if (adminAuth) {
      setIsAuthenticated(true)
    }
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = () => {
    // Load users
    const allUsers: User[] = []
    const allStoredKeys = Object.keys(localStorage)

    for (const key of allStoredKeys) {
      if (key.startsWith("nexus_user_")) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || "{}")
          const username = key.replace("nexus_user_", "")

          // Try to get profile data if available
          const profileKey = `nexus_profile_${username}`
          let profileData = {}

          if (localStorage.getItem(profileKey)) {
            profileData = JSON.parse(localStorage.getItem(profileKey) || "{}")
          }

          allUsers.push({
            username,
            email: userData.email,
            emailVerified: userData.emailVerified,
            createdAt: userData.createdAt || new Date().toISOString(),
            isBanned: userData.isBanned,
            bannedReason: userData.bannedReason,
            banExpiration: userData.banExpiration,
            ip: userData.ip,
            hwid: userData.hwid,
            browser: userData.browser,
            os: userData.os,
            ...profileData,
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }

    setUsers(allUsers)

    // Load keys
    const storedKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")
    setKeys(storedKeys)

    // Load scripts
    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    setScripts(storedScripts)

    // Calculate stats
    const bannedUsers = allUsers.filter((user) => user.isBanned).length
    const premiumKeys = storedKeys.filter((key: Key) => key.isPremium).length
    const totalViews = storedScripts.reduce((sum: number, script: Script) => sum + (script.views || 0), 0)

    setStats({
      totalUsers: allUsers.length,
      totalKeys: storedKeys.length,
      totalScripts: storedScripts.length,
      totalViews,
      bannedUsers,
      premiumKeys,
    })
  }

  const handleAuthenticate = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError("")
      localStorage.setItem("nexus_admin_auth", "true")
      loadData()
    } else {
      setAuthError("Invalid password. Please try again.")
    }
  }

  const handleBanUser = (username: string) => {
    // Get user data
    const userData = localStorage.getItem(`nexus_user_${username}`)
    if (!userData) return

    // Update user data with ban
    const parsedUserData = JSON.parse(userData)
    parsedUserData.isBanned = true
    parsedUserData.bannedReason = "Banned by admin"

    // Save back to localStorage
    localStorage.setItem(`nexus_user_${username}`, JSON.stringify(parsedUserData))

    // Update profile data if exists
    const profileData = localStorage.getItem(`nexus_profile_${username}`)
    if (profileData) {
      const parsedProfileData = JSON.parse(profileData)
      parsedProfileData.isBanned = true
      parsedProfileData.bannedReason = "Banned by admin"
      localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(parsedProfileData))
    }

    // Refresh data
    loadData()
  }

  const handleUnbanUser = (username: string) => {
    // Get user data
    const userData = localStorage.getItem(`nexus_user_${username}`)
    if (!userData) return

    // Update user data to remove ban
    const parsedUserData = JSON.parse(userData)
    parsedUserData.isBanned = false
    parsedUserData.bannedReason = undefined
    parsedUserData.banExpiration = undefined

    // Save back to localStorage
    localStorage.setItem(`nexus_user_${username}`, JSON.stringify(parsedUserData))

    // Update profile data if exists
    const profileData = localStorage.getItem(`nexus_profile_${username}`)
    if (profileData) {
      const parsedProfileData = JSON.parse(profileData)
      parsedProfileData.isBanned = false
      parsedProfileData.bannedReason = undefined
      parsedProfileData.banExpiration = undefined
      localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(parsedProfileData))
    }

    // Refresh data
    loadData()
  }

  const handleDeleteKey = (keyId: string) => {
    // Get all keys
    const allKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")

    // Filter out the key to delete
    const updatedKeys = allKeys.filter((key: Key) => key.id !== keyId)

    // Save back to localStorage
    localStorage.setItem("nexus_keys", JSON.stringify(updatedKeys))

    // Refresh data
    loadData()
  }

  const handleDeleteScript = (scriptId: string) => {
    // Get all scripts
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Filter out the script to delete
    const updatedScripts = allScripts.filter((script: Script) => script.id !== scriptId)

    // Save back to localStorage
    localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))

    // Refresh data
    loadData()
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredKeys = keys.filter(
    (key) =>
      key.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredScripts = scripts.filter(
    (script) =>
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading || !adminCheckComplete) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Admin Dashboard
          </h1>

          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Admin Access Required</h2>
            <p className="mb-6 text-gray-400">Only administrators can access the admin dashboard.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Home
              </Link>
              <button
                onClick={() => {
                  // Set admin token and reload page
                  localStorage.setItem(ADMIN_TOKEN_KEY, "true")
                  window.location.reload()
                }}
                className="interactive-element button-shine inline-flex items-center rounded bg-[#1a1a1a] border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
              >
                <i className="fas fa-user-shield mr-2"></i> Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-md">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-center">
            Admin Authentication
          </h1>

          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
            <div className="mb-6 text-center">
              <div className="inline-block mb-4 text-5xl text-[#ff3e3e] pulse-effect">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">Secure Authentication Required</h2>
              <p className="mb-6 text-gray-400">Please enter the admin password to continue.</p>
            </div>

            {authError && (
              <div className="mb-4 rounded bg-red-900/30 p-3 text-red-200">
                <p>{authError}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="adminPassword" className="mb-2 block text-sm font-medium text-gray-300">
                Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                placeholder="Enter admin password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAuthenticate()
                  }
                }}
              />
            </div>

            <button
              onClick={handleAuthenticate}
              className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Authenticate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-white/10 bg-[#1a1a1a] overflow-hidden">
              <div className="bg-[#ff3e3e]/10 p-4">
                <h2 className="text-lg font-bold text-white">Dashboard</h2>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded transition-all ${
                    activeTab === "overview"
                      ? "bg-[#ff3e3e]/10 text-[#ff3e3e]"
                      : "text-white hover:bg-[#ff3e3e]/5 hover:text-[#ff3e3e]"
                  }`}
                >
                  <i className={`fas fa-tachometer-alt mr-2 ${activeTab === "overview" ? "text-[#ff3e3e]" : ""}`}></i>{" "}
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full text-left px-4 py-3 rounded transition-all ${
                    activeTab === "users"
                      ? "bg-[#ff3e3e]/10 text-[#ff3e3e]"
                      : "text-white hover:bg-[#ff3e3e]/5 hover:text-[#ff3e3e]"
                  }`}
                >
                  <i className={`fas fa-users mr-2 ${activeTab === "users" ? "text-[#ff3e3e]" : ""}`}></i> User
                  Management
                </button>
                <button
                  onClick={() => setActiveTab("keys")}
                  className={`w-full text-left px-4 py-3 rounded transition-all ${
                    activeTab === "keys"
                      ? "bg-[#ff3e3e]/10 text-[#ff3e3e]"
                      : "text-white hover:bg-[#ff3e3e]/5 hover:text-[#ff3e3e]"
                  }`}
                >
                  <i className={`fas fa-key mr-2 ${activeTab === "keys" ? "text-[#ff3e3e]" : ""}`}></i> Key Management
                </button>
                <button
                  onClick={() => setActiveTab("scripts")}
                  className={`w-full text-left px-4 py-3 rounded transition-all ${
                    activeTab === "scripts"
                      ? "bg-[#ff3e3e]/10 text-[#ff3e3e]"
                      : "text-white hover:bg-[#ff3e3e]/5 hover:text-[#ff3e3e]"
                  }`}
                >
                  <i className={`fas fa-code mr-2 ${activeTab === "scripts" ? "text-[#ff3e3e]" : ""}`}></i> Script
                  Management
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-4 py-3 rounded transition-all ${
                    activeTab === "settings"
                      ? "bg-[#ff3e3e]/10 text-[#ff3e3e]"
                      : "text-white hover:bg-[#ff3e3e]/5 hover:text-[#ff3e3e]"
                  }`}
                >
                  <i className={`fas fa-cog mr-2 ${activeTab === "settings" ? "text-[#ff3e3e]" : ""}`}></i> Settings
                </button>
              </div>
              <div className="border-t border-white/10 p-4">
                <Link
                  href="/uplode-ke3ys29wafigrajdgue94gudjkfgowagi"
                  className="block w-full rounded bg-[#ff3e3e]/10 px-4 py-2 text-center text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/20"
                >
                  <i className="fas fa-upload mr-2"></i> Upload Keys
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
                <h2 className="mb-6 text-xl font-bold text-white">System Overview</h2>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-400">Total Users</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.totalKeys}</div>
                    <div className="text-sm text-gray-400">Total Keys</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.totalScripts}</div>
                    <div className="text-sm text-gray-400">Total Scripts</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.totalViews}</div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.bannedUsers}</div>
                    <div className="text-sm text-gray-400">Banned Users</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg">
                    <div className="mb-2 text-3xl text-[#ff3e3e]">{stats.premiumKeys}</div>
                    <div className="text-sm text-gray-400">Premium Keys</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-medium text-white">Quick Actions</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link
                      href="/uplode-ke3ys29wafigrajdgue94gudjkfgowagi"
                      className="rounded bg-[#ff3e3e]/10 p-4 text-center transition-all hover:bg-[#ff3e3e]/20"
                    >
                      <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                      <div className="text-white">Upload New Key</div>
                    </Link>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="rounded bg-[#ff3e3e]/10 p-4 text-center transition-all hover:bg-[#ff3e3e]/20"
                    >
                      <i className="fas fa-user-shield mb-2 text-2xl text-[#ff3e3e]"></i>
                      <div className="text-white">Manage Users</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
                <h2 className="mb-6 text-xl font-bold text-white">User Management</h2>

                <div className="mb-6">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-focus-effect w-full rounded-lg border border-white/10 bg-[#050505] py-2 pl-10 pr-4 text-white placeholder-gray-400 hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="Search users by username or email..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-4 py-2 text-[#ff3e3e]">Username</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Email</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Status</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Created</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.username} className="border-b border-white/5 hover:bg-[#0a0a0a]">
                            <td className="px-4 py-3 text-white">{user.username}</td>
                            <td className="px-4 py-3 text-gray-400">{user.email || "N/A"}</td>
                            <td className="px-4 py-3">
                              {user.isBanned ? (
                                <span className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-300">Banned</span>
                              ) : (
                                <span className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-300">Active</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Link
                                  href={`/profile/${user.username}`}
                                  className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-300 transition-all hover:bg-blue-900/50"
                                  target="_blank"
                                >
                                  View
                                </Link>
                                {user.isBanned ? (
                                  <button
                                    onClick={() => handleUnbanUser(user.username)}
                                    className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-300 transition-all hover:bg-green-900/50"
                                  >
                                    Unban
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user.username)}
                                    className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-300 transition-all hover:bg-red-900/50"
                                  >
                                    Ban
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Keys Tab */}
            {activeTab === "keys" && (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Key Management</h2>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-focus-effect w-full rounded-lg border border-white/10 bg-[#050505] py-2 pl-10 pr-4 text-white placeholder-gray-400 hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="Search keys by title or author..."
                    />
                  </div>
                  <Link
                    href="/uplode-ke3ys29wafigrajdgue94gudjkfgowagi"
                    className="interactive-element button-glow rounded bg-[#ff3e3e] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#ff0000]"
                  >
                    <i className="fas fa-plus mr-2"></i> Add New Key
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-4 py-2 text-[#ff3e3e]">Title</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Author</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Type</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Created</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                            No keys found
                          </td>
                        </tr>
                      ) : (
                        filteredKeys.map((key) => (
                          <tr key={key.id} className="border-b border-white/5 hover:bg-[#0a0a0a]">
                            <td className="px-4 py-3 text-white">{key.title}</td>
                            <td className="px-4 py-3 text-gray-400">{key.author}</td>
                            <td className="px-4 py-3">
                              {key.isPremium ? (
                                <span className="rounded bg-purple-900/30 px-2 py-1 text-xs text-purple-300">
                                  Premium
                                </span>
                              ) : (
                                <span className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-300">Free</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400">{new Date(key.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Link
                                  href={`/key-generator/${key.id}`}
                                  className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-300 transition-all hover:bg-blue-900/50"
                                  target="_blank"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => handleDeleteKey(key.id)}
                                  className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-300 transition-all hover:bg-red-900/50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scripts Tab */}
            {activeTab === "scripts" && (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Script Management</h2>

                <div className="mb-6">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-focus-effect w-full rounded-lg border border-white/10 bg-[#050505] py-2 pl-10 pr-4 text-white placeholder-gray-400 hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="Search scripts by title or author..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-4 py-2 text-[#ff3e3e]">Title</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Author</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Views</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Created</th>
                        <th className="px-4 py-2 text-[#ff3e3e]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScripts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                            No scripts found
                          </td>
                        </tr>
                      ) : (
                        filteredScripts.map((script) => (
                          <tr key={script.id} className="border-b border-white/5 hover:bg-[#0a0a0a]">
                            <td className="px-4 py-3 text-white">{script.title}</td>
                            <td className="px-4 py-3 text-gray-400">{script.author}</td>
                            <td className="px-4 py-3 text-gray-400">{script.views || 0}</td>
                            <td className="px-4 py-3 text-gray-400">
                              {new Date(script.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Link
                                  href={`/scripts/${script.id}`}
                                  className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-300 transition-all hover:bg-blue-900/50"
                                  target="_blank"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => handleDeleteScript(script.id)}
                                  className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-300 transition-all hover:bg-red-900/50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Admin Settings</h2>

                <div className="space-y-6">
                  <div className="rounded border border-white/10 bg-[#0a0a0a] p-4">
                    <h3 className="mb-2 text-lg font-medium text-white">Security</h3>
                    <p className="mb-4 text-gray-400">Manage admin authentication and security settings.</p>
                    <button
                      onClick={() => {
                        localStorage.removeItem("nexus_admin_auth")
                        setIsAuthenticated(false)
                      }}
                      className="rounded bg-red-900/30 px-4 py-2 text-sm text-red-300 transition-all hover:bg-red-900/50"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Log Out Admin Session
                    </button>
                  </div>

                  <div className="rounded border border-white/10 bg-[#0a0a0a] p-4">
                    <h3 className="mb-2 text-lg font-medium text-white">System</h3>
                    <p className="mb-4 text-gray-400">Manage system settings and data.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to refresh all data? This will reload the page.")) {
                            window.location.reload()
                          }
                        }}
                        className="rounded bg-blue-900/30 px-4 py-2 text-sm text-blue-300 transition-all hover:bg-blue-900/50"
                      >
                        <i className="fas fa-sync-alt mr-2"></i> Refresh Data
                      </button>
                    </div>
                  </div>

                  <div className="rounded border border-white/10 bg-[#0a0a0a] p-4">
                    <h3 className="mb-2 text-lg font-medium text-white">Admin Links</h3>
                    <p className="mb-4 text-gray-400">Quick access to admin pages.</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/uplode-ke3ys29wafigrajdgue94gudjkfgowagi"
                        className="rounded bg-[#ff3e3e]/20 px-4 py-2 text-sm text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/30"
                      >
                        <i className="fas fa-upload mr-2"></i> Upload Keys
                      </Link>
                      <Link
                        href="/key-generator"
                        className="rounded bg-[#ff3e3e]/20 px-4 py-2 text-sm text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/30"
                      >
                        <i className="fas fa-key mr-2"></i> Key Generator
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

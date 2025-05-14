"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isAdmin } from "@/lib/admin"

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

export function AdminPanel({ username }: { username: string }) {
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
          // Try to find user data from user storage
          const parsedUserData = JSON.parse(userData)

          // Get user's HWID if available
          const hwid = parsedUserData.hwid || "Not Available"

          // Since we can't get the real IP in client-side code, use the stored one if available
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

        // Find truly connected accounts
        const allStoredKeys = Object.keys(localStorage)
        const hwidKey = userData ? JSON.parse(userData).hwid : null
        const ipValue = userData ? JSON.parse(userData).ip : null

        // Find accounts with matching HWID or IP
        const connectedAccts = []

        if (userData) {
          const currentUserData = JSON.parse(userData)
          const hwidKey = currentUserData.hwid
          const ipValue = currentUserData.ip

          for (const key of allStoredKeys) {
            if (key.startsWith("nexus_user_") && key !== `nexus_user_${username}`) {
              const otherUser = JSON.parse(localStorage.getItem(key) || "{}")

              // Check if the HWID or IP matches
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

    // Calculate ban expiration date if not permanent
    let banExpiration = null
    if (banDuration !== "permanent") {
      const days = Number.parseInt(banDuration.replace("d", ""))
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + days)
      banExpiration = expirationDate.toISOString()
    }

    // Get the final ban reason
    const finalBanReason = banReason === "Custom" ? customBanReason : banReason

    // Update user data with ban information
    const updatedUserData = {
      ...userData,
      isBanned: true,
      bannedReason: finalBanReason || "Violation of terms of service",
      banExpiration: banExpiration,
    }

    // Save updated user data
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

    // If IP ban is selected, store the IP in banned IPs
    if (banOptions.ipBan && userData.ip) {
      const bannedIPs = JSON.parse(localStorage.getItem("nexus_banned_ips") || "[]")
      if (!bannedIPs.includes(userData.ip)) {
        bannedIPs.push(userData.ip)
      }

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
      })
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
      })
    )
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
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Admin Panel: {username}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">User Information</h3>
          <p>Email: {userData.email || "N/A"}</p>
          <p>Joined: {new Date(userData.createdAt).toLocaleDateString()}</p>
          <p>Status: {userData.isBanned ? "Banned" : "Active"}</p>
          {userData.isBanned && (
            <p>Ban Reason: {userData.bannedReason}</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Security Information</h3>
          <p>IP: {userData.ip}</p>
          <p>HWID: {userData.hwid}</p>
          <p>OS: {userData.os || "N/A"}</p>
          <p>Browser: {userData.browser || "N/A"}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Connected Accounts</h3>
        {connectedAccounts.length > 0 ? (
          <ul className="list-disc pl-5">
            {connectedAccounts.map((account) => (
              <li key={account}>{account}</li>
            ))}
          </ul>
        ) : (
          <p>No connected accounts found</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowBanModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Ban User
        </button>
        {userData.isBanned && (
          <button
            onClick={handleUnbanUser}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Unban User
          </button>
        )}
        <button
          onClick={() => setShowDetailsModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Full Details
        </button>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Ban User: {username}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Ban Reason</label>
                <select
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a reason</option>
                  <option value="Cheating">Cheating</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Spamming">Spamming</option>
                  <option value="Custom">Custom</option>
                </select>
                {banReason === "Custom" && (
                  <input
                    type="text"
                    value={customBanReason}
                    onChange={(e) => setCustomBanReason(e.target.value)}
                    placeholder="Enter custom reason"
                    className="w-full p-2 border rounded mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block mb-2">Ban Duration</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="permanent">Permanent</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Ban Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={banOptions.accountBan}
                      onChange={(e) => setBanOptions({...banOptions, accountBan: e.target.checked})}
                      className="mr-2"
                    />
                    Account Ban
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={banOptions.ipBan}
                      onChange={(e) => setBanOptions({...banOptions, ipBan: e.target.checked})}
                      className="mr-2"
                    />
                    IP Ban
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={banOptions.hwidBan}
                      onChange={(e) => setBanOptions({...banOptions, hwidBan: e.target.checked})}
                      className="mr-2"
                    />
                    HWID Ban
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Full User Details: {username}</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[60vh]">
              {JSON.stringify(userData, null, 2)}
            </pre>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

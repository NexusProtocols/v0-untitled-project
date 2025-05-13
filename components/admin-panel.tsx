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
        localStorage.setItem("nexus_banned_ips", JSON.stringify(bannedIPs))
      }
    }

    // If HWID ban is selected, store the HWID in banned HWIDs
    if (banOptions.hwidBan && userData.hwid) {
      const bannedHWIDs = JSON.parse(localStorage.getItem("nexus_banned_hwids") || "[]")
      if (!bannedHWIDs.includes(userData.hwid)) {
        bannedHWIDs.push(userData.hwid)
        localStorage.setItem("nexus_banned_hwids", JSON.stringify(bannedHWIDs))
      }
    }

    // Add username to blacklisted usernames (case-insensitive)
    const blacklistedUsernames = JSON.parse(localStorage.getItem("nexus_blacklisted_usernames") || "[]")
    const lowercaseUsername = username.toLowerCase()
    if (!blacklistedUsernames.includes(lowercaseUsername)) {
      blacklistedUsernames.push(lowercaseUsername)
      localStorage.setItem("nexus_blacklisted_usernames", JSON.stringify(blacklistedUsernames))
    }

    // Remove all scripts by this user
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    const filteredScripts = allScripts.filter((script: any) => script.author.toLowerCase() !== username.toLowerCase())
    localStorage.setItem("nexus_scripts", JSON.stringify(filteredScripts))

    setUserData(updatedUserData)
    setShowBanModal(false)
    alert(`User ${username} has been banned. All their scripts have been removed.`)
  }

  const handleChangeUsername = () => {
    if (!userData || !newUsername) return

    // Check if username is taken already
    if (localStorage.getItem(`nexus_user_${newUsername}`)) {
      alert("This username is already taken.")
      return
    }

    // Check if username is blacklisted
    const blacklistedUsernames = JSON.parse(localStorage.getItem("nexus_blacklisted_usernames") || "[]")
    if (blacklistedUsernames.some((banned: string) => banned.toLowerCase() === newUsername.toLowerCase())) {
      alert("This username is blacklisted and cannot be used.")
      return
    }

    // Create a copy of the user data with the new username
    const updatedUserData = {
      ...userData,
      username: newUsername,
    }

    // Save the data under the new username key
    localStorage.setItem(`nexus_profile_${newUsername}`, JSON.stringify(updatedUserData))
    localStorage.setItem(
      `nexus_user_${newUsername}`,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(`nexus_user_${username}`) || "{}"),
        username: newUsername,
      }),
    )

    // Update all scripts by this user to have the new username
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    const updatedScripts = allScripts.map((script: any) => {
      if (script.author.toLowerCase() === username.toLowerCase()) {
        return { ...script, author: newUsername }
      }
      return script
    })
    localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))

    // Remove the old data
    localStorage.removeItem(`nexus_profile_${username}`)
    localStorage.removeItem(`nexus_user_${username}`)

    alert(`Username changed from ${username} to ${newUsername}. Script ownership has been transferred. Redirecting...`)
    window.location.href = `/profile/${newUsername}`
  }

  const handleUpdateViewCount = (scriptId: string, newCount: number) => {
    // Get all scripts
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Find the script by ID
    const scriptIndex = allScripts.findIndex((script: any) => script.id === scriptId)

    if (scriptIndex !== -1) {
      // Update the view count
      allScripts[scriptIndex].views = newCount

      // Save back to localStorage
      localStorage.setItem("nexus_scripts", JSON.stringify(allScripts))

      alert(`View count for script ${allScripts[scriptIndex].title} updated to ${newCount}`)
    }
  }

  const handleRemoveScript = (scriptId: string) => {
    // Get all scripts
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Filter out the script to remove
    const updatedScripts = allScripts.filter((script: any) => script.id !== scriptId)

    // Save back to localStorage
    localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))

    alert(`Script has been removed successfully.`)
  }

  const handleToggleScriptVisibility = (scriptId: string) => {
    // Get all scripts
    const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Find the script by ID
    const scriptIndex = allScripts.findIndex((script: any) => script.id === scriptId)

    if (scriptIndex !== -1) {
      // Toggle the isHidden property
      allScripts[scriptIndex].isHidden = !allScripts[scriptIndex].isHidden

      // Save back to localStorage
      localStorage.setItem("nexus_scripts", JSON.stringify(allScripts))

      alert(
        `Script "${allScripts[scriptIndex].title}" is now ${allScripts[scriptIndex].isHidden ? "hidden" : "visible"}`,
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null
  }

  return (
    <div className="mt-6 rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-6">
      <h2 className="mb-4 text-xl font-bold text-white">Admin Controls</h2>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowBanModal(true)}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
        >
          <i className="fas fa-ban mr-2"></i> Ban User
        </button>

        <button
          onClick={() => setShowDetailsModal(true)}
          className="rounded bg-[#00c6ed] px-4 py-2 text-sm font-medium text-[#050505] transition-all hover:bg-[#00b8ff]"
        >
          <i className="fas fa-info-circle mr-2"></i> View User Details
        </button>

        <div className="flex w-full items-center gap-2 mt-3">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="New username"
            className="flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-sm text-white"
          />
          <button
            onClick={handleChangeUsername}
            disabled={!newUsername}
            className="rounded bg-[#00ff9d] px-4 py-2 text-sm font-medium text-[#050505] transition-all hover:bg-[#00e68a] disabled:opacity-50"
          >
            <i className="fas fa-user-edit mr-2"></i> Change Username
          </button>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Ban User: {username}</h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">Ban Options</label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banOptions.accountBan}
                    onChange={() => setBanOptions({ ...banOptions, accountBan: !banOptions.accountBan })}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500"
                  />
                  <span className="text-white">Account Ban</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banOptions.ipBan}
                    onChange={() => setBanOptions({ ...banOptions, ipBan: !banOptions.ipBan })}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500"
                  />
                  <span className="text-white">Blacklist IP Address</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banOptions.hwidBan}
                    onChange={() => setBanOptions({ ...banOptions, hwidBan: !banOptions.hwidBan })}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500"
                  />
                  <span className="text-white">Blacklist HWID</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">Ban Duration</label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white"
              >
                <option value="permanent">Permanent</option>
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
                <option value="14d">14 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">Ban Reason</label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white mb-2"
              >
                <option value="">Select a reason...</option>
                <option value="Violation of terms of service">Violation of terms of service</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Malicious scripts">Malicious scripts</option>
                <option value="Spamming">Spamming</option>
                <option value="Harassment">Harassment</option>
                <option value="Multiple accounts">Multiple accounts</option>
                <option value="Scamming">Scamming</option>
                <option value="Custom">Custom reason</option>
              </select>
              {banReason === "Custom" && (
                <textarea
                  value={customBanReason}
                  onChange={(e) => setCustomBanReason(e.target.value)}
                  className="w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white"
                  rows={3}
                  placeholder="Enter custom ban reason..."
                ></textarea>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-lg border-l-4 border-[#00c6ed] bg-[#1a1a1a] p-6 max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">User Details: {username}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded border border-white/10 bg-[#050505] p-4">
                <h4 className="mb-2 font-medium text-[#00c6ed]">Account Information</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <span className="text-gray-400">Username:</span> {userData.username}
                  </li>
                  <li>
                    <span className="text-gray-400">Email:</span> {userData.email || "Not provided"}
                  </li>
                  <li>
                    <span className="text-gray-400">Email Verified:</span> {userData.emailVerified ? "Yes" : "No"}
                  </li>
                  <li>
                    <span className="text-gray-400">Created:</span> {new Date(userData.createdAt).toLocaleString()}
                  </li>
                  <li>
                    <span className="text-gray-400">Status:</span>{" "}
                    {userData.isBanned ? (
                      <span className="text-red-400">Banned</span>
                    ) : (
                      <span className="text-green-400">Active</span>
                    )}
                  </li>
                  {userData.bannedReason && (
                    <li>
                      <span className="text-gray-400">Ban Reason:</span> {userData.bannedReason}
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded border border-white/10 bg-[#050505] p-4">
                <h4 className="mb-2 font-medium text-[#00c6ed]">Technical Information</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <span className="text-gray-400">IP Address:</span>
                    <span className="font-mono">{userData.ip || "Unknown"}</span>
                    {userData.ip && (
                      <a
                        href={`https://ipinfo.io/${userData.ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-[#00c6ed] hover:underline"
                      >
                        <i className="fas fa-external-link-alt text-xs"></i> Lookup
                      </a>
                    )}
                  </li>
                  <li>
                    <span className="text-gray-400">HWID:</span>
                    <span className="font-mono text-xs">{userData.hwid || "Unknown"}</span>
                  </li>
                  <li>
                    <span className="text-gray-400">Last Login:</span> {new Date().toLocaleString()}
                  </li>
                  <li>
                    <span className="text-gray-400">Browser:</span> {userData.browser || "Unknown"}
                  </li>
                  <li>
                    <span className="text-gray-400">OS:</span> {userData.os || "Unknown"}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
              <h4 className="mb-2 font-medium text-[#00c6ed]">Connected Accounts</h4>
              {connectedAccounts.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-300">
                  {connectedAccounts.map((account, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{account}</span>
                      <button
                        onClick={() => window.open(`/profile/${account}`, "_blank")}
                        className="text-[#00c6ed] hover:underline"
                      >
                        View Profile
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No connected accounts found.</p>
              )}
            </div>

            {/* User Scripts Management */}
            <div className="mt-4 rounded border border-white/10 bg-[#050505] p-4">
              <h4 className="mb-4 font-medium text-[#00c6ed]">User Scripts Management</h4>

              {(() => {
                const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
                const userScripts = allScripts.filter(
                  (script: any) => script.author.toLowerCase() === username.toLowerCase(),
                )

                if (userScripts.length === 0) {
                  return <p className="text-sm text-gray-400">This user has no scripts.</p>
                }

                return (
                  <div className="space-y-4">
                    {userScripts.map((script: any) => (
                      <div key={script.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div>
                          <span className="text-sm text-gray-300">{script.title}</span>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-400">Views: {script.views || 0}</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                defaultValue={script.views || 0}
                                id={`views-${script.id}`}
                                className="w-24 rounded border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-white"
                              />
                              <button
                                onClick={() => {
                                  const newCount = Number.parseInt(
                                    (document.getElementById(`views-${script.id}`) as HTMLInputElement).value,
                                  )
                                  handleUpdateViewCount(script.id, newCount)
                                }}
                                className="rounded bg-[#00ff9d] px-2 py-1 text-xs font-medium text-[#050505]"
                              >
                                Update Views
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleScriptVisibility(script.id)}
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              script.isHidden
                                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                : "bg-gray-600 text-white hover:bg-gray-700"
                            }`}
                          >
                            {script.isHidden ? "Unhide Script" : "Hide Script"}
                          </button>
                          <button
                            onClick={() => handleRemoveScript(script.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Remove Script
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="rounded bg-[#00c6ed] px-4 py-2 text-sm font-medium text-[#050505] transition-all hover:bg-[#00b8ff]"
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

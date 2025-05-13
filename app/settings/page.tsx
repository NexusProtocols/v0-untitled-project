"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { user, isLoading, changePassword, sendVerificationCode, verifyEmail } = useAuth()
  const router = useRouter()

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })

  // Email verification states
  const [email, setEmail] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [emailMessage, setEmailMessage] = useState({ type: "", text: "" })
  const [showVerificationInput, setShowVerificationInput] = useState(false)

  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [profileUser, setProfileUser] = useState<any | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user && user.email) {
      setEmail(user.email)
      setOriginalEmail(user.email)

      // Load user profile from localStorage
      const userProfileData = localStorage.getItem(`nexus_profile_${user.username}`)
      if (userProfileData) {
        const parsedProfile = JSON.parse(userProfileData)
        setProfileUser(parsedProfile)
        setProfilePicture(parsedProfile.profilePicture || null)
      } else {
        // Create a new profile for the user
        const newProfile = {
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          bio: "",
          profilePicture: null,
        }
        localStorage.setItem(`nexus_profile_${user.username}`, JSON.stringify(newProfile))
        setProfileUser(newProfile)
      }
    }
  }, [user, isLoading, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage({ type: "", text: "" })

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "All fields are required" })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    const result = await changePassword(currentPassword, newPassword)
    setPasswordMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMessage({ type: "", text: "" })

    if (!email) {
      setEmailMessage({ type: "error", text: "Email is required" })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    const result = await sendVerificationCode(email)
    setEmailMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      setShowVerificationInput(true)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMessage({ type: "", text: "" })

    if (!verificationCode) {
      setEmailMessage({ type: "error", text: "Verification code is required" })
      return
    }

    const result = await verifyEmail(verificationCode)
    setEmailMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      // Reset form
      setVerificationCode("")
      setShowVerificationInput(false)
    }
  }

  const handleCancelEmailVerification = () => {
    setShowVerificationInput(false)
    setEmail(originalEmail)
    setEmailMessage({ type: "", text: "" })
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("File must be an image")
      return
    }

    // Check if file is jpeg, png, or jpg
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and JPG images are allowed")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePicture(event.target.result as string)

        // Save the profile picture immediately
        if (profileUser) {
          const updatedProfile = {
            ...profileUser,
            profilePicture: event.target.result as string,
          }
          localStorage.setItem(`nexus_profile_${user.username}`, JSON.stringify(updatedProfile))
          setProfileUser(updatedProfile)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Account Settings
        </h1>

        <div className="mb-8 rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-[#0a0a0a]">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-sm text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              {user.email && (
                <p className="mt-1 flex items-center text-sm">
                  <span className={user.emailVerified ? "text-green-400" : "text-yellow-400"}>{user.email}</span>
                  {user.emailVerified ? (
                    <span className="ml-2 rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      <i className="fas fa-check-circle mr-1"></i> Verified
                    </span>
                  ) : (
                    <span className="ml-2 rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      <i className="fas fa-exclamation-circle mr-1"></i> Unverified
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-2 block font-medium text-[#00ff9d]">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white opacity-70"
              />
              <p className="mt-1 text-xs text-gray-400">Username cannot be changed</p>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="mb-2 block font-medium text-[#00ff9d]">Profile Picture</label>
              <div className="flex items-center gap-4">
                {profilePicture ? (
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#00ff9d]/30 transition-all duration-300 hover:border-[#00ff9d] hover:shadow-lg">
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0a0a0a] text-3xl font-bold text-[#00ff9d] border-2 border-[#00ff9d]/30 transition-all duration-300 hover:border-[#00ff9d] hover:shadow-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="mb-2 cursor-pointer inline-flex items-center rounded bg-[#00ff9d]/10 px-4 py-2 text-sm font-medium text-[#00ff9d] transition-all hover:bg-[#00ff9d]/20"
                  >
                    <i className="fas fa-camera mr-2"></i> {profilePicture ? "Change Picture" : "Upload Picture"}
                  </label>
                  {profilePicture && (
                    <button
                      onClick={() => {
                        setProfilePicture(null)
                        // Update profile in localStorage
                        if (profileUser) {
                          const updatedProfile = {
                            ...profileUser,
                            profilePicture: null,
                          }
                          localStorage.setItem(`nexus_profile_${user.username}`, JSON.stringify(updatedProfile))
                          setProfileUser(updatedProfile)
                        }
                      }}
                      className="ml-2 inline-flex items-center rounded bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
                    >
                      <i className="fas fa-trash-alt mr-2"></i> Remove
                    </button>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Upload a profile picture (max 2MB, JPEG or PNG)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Section */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00c6ed] bg-[#1a1a1a] p-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Email Verification</h2>

          {emailMessage.text && (
            <div
              className={`mb-6 rounded p-4 ${
                emailMessage.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
              }`}
            >
              {emailMessage.text}
            </div>
          )}

          {!showVerificationInput ? (
            <form onSubmit={handleSendVerificationCode}>
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block font-medium text-[#00c6ed]">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded bg-gradient-to-r from-[#00c6ed] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00c6ed]/20"
              >
                <i className="fas fa-envelope mr-2"></i> Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmail}>
              <div className="mb-4">
                <label htmlFor="verificationCode" className="mb-2 block font-medium text-[#00c6ed]">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
                  placeholder="Enter the 6-digit code"
                />
                <p className="mt-1 text-xs text-gray-400">
                  The code will expire in 15 minutes. Check your email for the verification code.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 rounded bg-gradient-to-r from-[#00c6ed] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00c6ed]/20"
                >
                  <i className="fas fa-check-circle mr-2"></i> Verify Email
                </button>
                <button
                  type="button"
                  onClick={handleCancelEmailVerification}
                  className="rounded border border-white/10 bg-[#050505] px-4 py-3 font-semibold text-white transition-all hover:bg-[#1a1a1a]"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Discord Integration Section */}
        <div className="mb-8 rounded-lg border-l-4 border-[#5865F2] bg-[#1a1a1a] p-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Discord Integration</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#5865F2]">
              <i className="fab fa-discord text-2xl text-white"></i>
            </div>
            <div>
              {user.discord_id ? (
                <div>
                  <p className="text-green-400 font-medium">Discord account linked</p>
                  <p className="text-sm text-gray-400">Username: {user.discord_username}</p>
                </div>
              ) : (
                <p className="text-yellow-400">No Discord account linked</p>
              )}
            </div>
          </div>

          {user.discord_id ? (
            <p className="text-sm text-gray-400 mb-4">
              Your Discord account is linked to your NEXUS account. You have access to our Discord server and exclusive
              features.
            </p>
          ) : (
            <p className="text-sm text-gray-400 mb-4">
              Link your Discord account to get access to our Discord server and exclusive features.
            </p>
          )}

          {!user.discord_id && (
            <a
              href="/discord-login.html"
              className="inline-flex items-center rounded bg-[#5865F2] px-4 py-2 font-semibold text-white transition-all hover:bg-[#4752C4]"
            >
              <i className="fab fa-discord mr-2"></i> Link Discord Account
            </a>
          )}
        </div>

        {/* Password Change Section */}
        <div className="rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Change Password</h2>

          {passwordMessage.text && (
            <div
              className={`mb-6 rounded p-4 ${
                passwordMessage.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="mb-2 block font-medium text-[#00ff9d]">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="mb-2 block font-medium text-[#00ff9d]">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              />
              <p className="mt-1 text-xs text-gray-400">
                Password must be at least 8 characters and cannot contain your username
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="mb-2 block font-medium text-[#00ff9d]">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-key mr-2"></i> Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

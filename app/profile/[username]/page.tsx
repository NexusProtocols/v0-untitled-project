"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { scriptCategories } from "@/lib/categories"
import { AdminPanel } from "@/components/admin-panel"

type Game = {
  id: number
  gameId?: string
  name: string
  imageUrl: string
}

type Script = {
  id: string
  title: string
  description: string
  code: string
  author: string
  createdAt: string
  game: Game
  categories?: string[]
  likes?: string[]
  dislikes?: string[]
  views?: number
}

type UserProfile = {
  username: string
  email?: string
  emailVerified?: boolean
  createdAt: string
  profilePicture?: string
  bio?: string
  ip?: string
  browser?: string
  os?: string
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [userScripts, setUserScripts] = useState<Script[]>([])
  const [isLoadingScripts, setIsLoadingScripts] = useState(true)
  const [activeTab, setActiveTab] = useState<"scripts" | "stats">("scripts")
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)
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

  // Add profile picture upload functionality
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
          localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedProfile))
          setProfileUser(updatedProfile)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!isLoading) {
      // Check if this is the user's own profile
      if (user && username === user.username) {
        setIsOwnProfile(true)

        // Load user profile from localStorage or create if it doesn't exist
        const userProfileData = localStorage.getItem(`nexus_profile_${username}`)

        if (userProfileData) {
          const parsedProfile = JSON.parse(userProfileData)
          setProfileUser(parsedProfile)
          setBio(parsedProfile.bio || "")
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

          localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(newProfile))
          setProfileUser(newProfile)
        }
      } else {
        // Load other user's profile
        const userProfileData = localStorage.getItem(`nexus_profile_${username}`)

        if (userProfileData) {
          const parsedProfile = JSON.parse(userProfileData)
          setProfileUser(parsedProfile)
          setBio(parsedProfile.bio || "")
          setProfilePicture(parsedProfile.profilePicture || null)
        } else {
          // Try to find user data from user storage
          const userData = localStorage.getItem(`nexus_user_${username}`)

          if (userData) {
            const parsedUserData = JSON.parse(userData)
            const newProfile = {
              username: username as string,
              email: parsedUserData.email,
              emailVerified: parsedUserData.emailVerified,
              createdAt: parsedUserData.createdAt || new Date().toISOString(),
              bio: "",
              profilePicture: null,
            }

            localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(newProfile))
            setProfileUser(newProfile)
          } else {
            // User not found
            router.push("/404")
          }
        }
      }

      // Check if user is admin
      const checkAdminStatus = async () => {
        try {
          // Simple username check for admin status
          const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

          // Check if the profile user is admin
          const profileAdminStatus = adminUsernames.includes(username as string)
          setIsUserAdmin(profileAdminStatus)

          // Check if the current user is admin
          if (user) {
            const currentUserAdminStatus = adminUsernames.includes(user.username)
            setCurrentUserIsAdmin(currentUserAdminStatus)
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
        }
      }

      checkAdminStatus()
    }
  }, [username, user, isLoading, router])

  useEffect(() => {
    // Load scripts from localStorage
    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Filter scripts by the profile user
    const filteredScripts = storedScripts.filter((script: Script) => script.author === username)

    setUserScripts(filteredScripts)
    setIsLoadingScripts(false)
  }, [username])

  // Calculate user stats
  const totalScripts = userScripts.length
  const totalViews = userScripts.reduce((sum, script) => sum + (script.views || 0), 0)

  const saveProfile = () => {
    if (!profileUser || !isOwnProfile) return

    const updatedProfile = {
      ...profileUser,
      bio,
      profilePicture,
    }

    localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedProfile))
    setProfileUser(updatedProfile)
    setIsEditingProfile(false)
  }

  if (isLoading || isLoadingScripts || !profileUser) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Update the profile header section to include profile picture upload */}
            <div className="relative">
              {profilePicture ? (
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[#ff3e3e]/30 transition-all duration-300 hover:border-[#ff3e3e] hover:shadow-lg">
                  <img
                    src={profilePicture || "/placeholder.svg"}
                    alt={profileUser.username}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0a0a0a] text-4xl font-bold text-[#ff3e3e] border-2 border-[#ff3e3e]/30 transition-all duration-300 hover:border-[#ff3e3e] hover:shadow-lg">
                  {profileUser.username.charAt(0).toUpperCase()}
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-[#ff3e3e] p-2 text-white hover:bg-[#ff0000] transition-all duration-300 hover:scale-110"
                >
                  <i className="fas fa-camera"></i>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start">
                <h1 className="mb-2 text-3xl font-bold text-white">{profileUser.username}</h1>
                {isUserAdmin && (
                  <span className="ml-2 rounded bg-[#ff3e3e]/20 px-2 py-0.5 text-xs text-[#ff3e3e]">
                    <i className="fas fa-shield-alt mr-1 text-[#ff0000]"></i> NEXUS TEAM
                  </span>
                )}
              </div>
              <p className="text-gray-400">Member since {new Date(profileUser.createdAt).toLocaleDateString()}</p>
              {profileUser.email && (
                <p className="mt-1 flex items-center justify-center md:justify-start">
                  <span className={profileUser.emailVerified ? "text-green-400" : "text-yellow-400"}>
                    {profileUser.email}
                  </span>
                  {profileUser.emailVerified ? (
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

              {isEditingProfile ? (
                <div className="mt-3">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="w-full rounded border border-[#ff3e3e]/30 bg-[#0a0a0a] px-4 py-2 text-white transition-all focus:border-[#ff3e3e] focus:outline-none hover:border-[#ff3e3e]/50 hover:shadow-md"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="mt-2 flex justify-between">
                    <p className="text-xs text-gray-400">{bio.length}/200</p>
                    <div className="flex gap-2">
                      <button
                        onClick={saveProfile}
                        className="rounded bg-[#ff3e3e] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#ff0000] hover:shadow-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="rounded bg-[#2a2a2a] px-3 py-1 text-xs font-medium text-gray-300 transition-all hover:bg-[#3a3a3a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {profileUser.bio ? (
                    <div className="mt-3 text-gray-300">
                      <p>{profileUser.bio}</p>
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="mt-2 text-xs text-[#ff3e3e] hover:underline transition-all"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit Bio
                        </button>
                      )}
                    </div>
                  ) : isOwnProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-3 text-sm text-[#ff3e3e] hover:underline transition-all"
                    >
                      <i className="fas fa-plus-circle mr-1"></i> Add Bio
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Admin Panel - Show only if current user is admin and viewing someone else's profile */}
        {user && currentUserIsAdmin && user.username !== username && <AdminPanel username={username as string} />}

        {/* Tabs */}
        <div className="mb-6 flex border-b border-[#2a2a2a]">
          <button
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "scripts"
                ? "border-b-2 border-[#ff3e3e] text-[#ff3e3e]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("scripts")}
          >
            <i className="fas fa-code mr-2"></i> Scripts
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "stats" ? "border-b-2 border-[#ff3e3e] text-[#ff3e3e]" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            <i className="fas fa-chart-bar mr-2"></i> Stats
          </button>
        </div>

        {/* Content */}
        {activeTab === "scripts" ? (
          <>
            {userScripts.length === 0 ? (
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center shadow-md transition-all hover:shadow-lg">
                <div className="mb-4 text-5xl text-[#ff3e3e]">
                  <i className="fas fa-code"></i>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">No Scripts Uploaded</h2>
                <p className="mb-6 text-gray-400">
                  {isOwnProfile
                    ? "You haven't uploaded any scripts yet."
                    : `${profileUser.username} hasn't uploaded any scripts yet.`}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/upload-scripts"
                    className="nav-item inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 hover:scale-105"
                  >
                    <i className="fas fa-upload mr-2"></i> Upload Your First Script
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userScripts.map((script) => (
                  <div
                    key={script.id}
                    className="card-hover rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg"
                  >
                    {script.game && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={script.game.imageUrl || "/placeholder.svg"}
                          alt={script.game.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={100}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-transparent p-2">
                          <span className="text-xs font-medium text-gray-300">{script.game.name}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-2">
                        <h2 className="text-xl font-bold text-white">{script.title}</h2>
                      </div>
                      <p className="mb-3 text-sm text-gray-400">{new Date(script.createdAt).toLocaleDateString()}</p>
                      {script.categories && script.categories.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {script.categories.map((categoryId) => {
                            const category = scriptCategories.find((c) => c.id === categoryId)
                            return (
                              category && (
                                <span
                                  key={categoryId}
                                  className="rounded bg-[#ff3e3e]/10 px-2 py-0.5 text-xs font-medium text-[#ff3e3e]"
                                >
                                  {category.name}
                                </span>
                              )
                            )
                          })}
                        </div>
                      )}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[#ff3e3e] font-medium">
                          <i className="fas fa-eye"></i>
                          <span>
                            {script.views
                              ? script.views >= 1000
                                ? (script.views / 1000).toFixed(1) + "k"
                                : script.views
                              : 0}
                          </span>
                        </div>
                      </div>
                      <p className="mb-4 text-gray-300 line-clamp-3">{script.description}</p>
                      <Link
                        href={`/scripts/${script.id}`}
                        className="inline-flex items-center text-sm font-medium text-[#ff3e3e] hover:underline"
                      >
                        View Details <i className="fas fa-arrow-right ml-2"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-8 shadow-md transition-all hover:shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">
              {isOwnProfile ? "Your Statistics" : `${profileUser.username}'s Statistics`}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-center transition-all hover:shadow-md">
                <div className="mb-2 text-3xl text-[#ff3e3e]">{totalScripts}</div>
                <div className="text-sm text-gray-400">Total Scripts</div>
              </div>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-center transition-all hover:shadow-md">
                <div className="mb-2 text-3xl text-[#ff3e3e]">
                  {totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + "k" : totalViews || 0}
                </div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

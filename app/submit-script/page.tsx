"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { generateHWID } from "@/lib/hwid"

// Define the admin token constant
const ADMIN_TOKEN_KEY =
  "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93)"

export default function SubmitScriptPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptDescription, setScriptDescription] = useState("")
  const [scriptCode, setScriptCode] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isAdmin, setIsAdmin] = useState(false)
  const [scripts, setScripts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all")
  const [isLoading2, setIsLoading2] = useState(true)
  const [selectedScript, setSelectedScript] = useState<any | null>(null)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Game search state variables
  const [gameId, setGameId] = useState("")
  const [gameName, setGameName] = useState("")
  const [gameDetails, setGameDetails] = useState<any | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(false)
  const [gameError, setGameError] = useState("")
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id")
  const [gameSearchResults, setGameSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Key settings state variables
  const [adLevel, setAdLevel] = useState(1)
  const [maxAdLevel, setMaxAdLevel] = useState(3) // Default for free users
  const [keyDuration, setKeyDuration] = useState(7) // Default 7 days
  const [maxUses, setMaxUses] = useState(1) // Default 1 use
  const [hwidLock, setHwidLock] = useState(true) // Default enabled
  const [keyPrefix, setKeyPrefix] = useState("NEXUS-")
  const [gatewayCount, setGatewayCount] = useState(1) // Default 1 gateway

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

  useEffect(() => {
    const checkAdminAccess = () => {
      if (isLoading) return

      // Check if user is admin by username only
      if (user) {
        const isUserAdmin = adminUsernames.includes(user.username)
        setUserIsAdmin(isUserAdmin)
        setAdminCheckComplete(true)

        // Check if user has Discord linked
        const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
        const hasDiscordLinked = userData.discordId !== undefined

        // Set max ad level based on user status
        if (isUserAdmin) {
          setMaxAdLevel(5) // Admins get level 5
        } else if (hasDiscordLinked) {
          setMaxAdLevel(4) // Discord-linked users get level 4
        } else {
          setMaxAdLevel(3) // Free users get level 3
        }

        return
      }

      // If not logged in, check for admin token in localStorage
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (adminToken) {
        setUserIsAdmin(true)
        setAdminCheckComplete(true)
        setMaxAdLevel(5) // Admin token gives level 5
        return
      }

      // Not an admin, set state accordingly
      setUserIsAdmin(false)
      setAdminCheckComplete(true)
    }

    checkAdminAccess()
  }, [user, isLoading])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Game search functions
  const handleFetchGameDetailsById = async () => {
    if (!gameId) {
      setGameError("Please enter a game ID")
      return
    }

    setIsLoadingGame(true)
    setGameError("")
    setGameDetails(null)
    setShowSearchResults(false)

    try {
      // Fetch game details using the Roblox URL
      const url = `https://www.roblox.com/games/${gameId}/`

      // In a real implementation, this would call an API to fetch game details
      // For now, we'll simulate a successful response
      setTimeout(() => {
        setGameDetails({
          name: `Game ${gameId}`,
          imageUrl: "/placeholder.svg?height=512&width=512",
          gameId: gameId,
          stats: {
            playing: Math.floor(Math.random() * 10000),
            visits: Math.floor(Math.random() * 1000000),
            likes: Math.floor(Math.random() * 100000),
            dislikes: Math.floor(Math.random() * 10000),
          },
        })
        setGameName(`Game ${gameId}`)
        setImageUrl("/placeholder.svg?height=512&width=512")
        setIsLoadingGame(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching game details:", error)
      setGameError("An unexpected error occurred. Please try again.")
      setIsLoadingGame(false)
    }
  }

  const handleSearchGamesByName = async () => {
    if (!gameName) {
      setGameError("Please enter a game name")
      return
    }

    setIsLoadingGame(true)
    setGameError("")
    setGameDetails(null)
    setGameSearchResults([])

    try {
      // In a real implementation, this would call an API to search games
      // For now, we'll simulate a successful response
      setTimeout(() => {
        const results = Array.from({ length: 5 }).map((_, index) => ({
          name: `${gameName} ${index + 1}`,
          imageUrl: "/placeholder.svg?height=512&width=512",
          gameId: `${1000 + index}`,
          stats: {
            playing: Math.floor(Math.random() * 10000),
            visits: Math.floor(Math.random() * 1000000),
            likes: Math.floor(Math.random() * 100000),
            dislikes: Math.floor(Math.random() * 10000),
          },
        }))
        setGameSearchResults(results)
        setShowSearchResults(true)
        setIsLoadingGame(false)
      }, 1000)
    } catch (error) {
      console.error("Error searching games:", error)
      setGameError("An unexpected error occurred. Please try again.")
      setIsLoadingGame(false)
    }
  }

  const handleSelectGame = (game: any) => {
    setGameDetails({
      name: game.name,
      imageUrl: game.imageUrl,
      gameId: game.gameId,
      stats: game.stats,
    })
    setGameId(game.gameId)
    setShowSearchResults(false)
    // Automatically set the image URL from the selected game
    setImageUrl(game.imageUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!scriptTitle || !scriptDescription || !scriptCode) {
      setMessage({ type: "error", text: "Script title, description, and code are required" })
      return
    }

    if (!imageUrl) {
      setMessage({ type: "error", text: "Please upload an image for the script" })
      return
    }

    try {
      setIsSubmitting(true)

      // Get author name - use user.username if logged in, or "NEXUS Admin" if not
      const authorName = user ? user.username : "NEXUS Admin"
      const hwid = generateHWID()

      // Create a script object
      const script = {
        id: `script-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: scriptTitle,
        description: scriptDescription,
        code: scriptCode,
        author: authorName,
        createdAt: new Date().toISOString(),
        imageUrl: imageUrl,
        isPremium: isPremium,
        isNexusTeam: userIsAdmin,
        game: gameDetails,
        hwid: hwid,
        status: "pending", // Default status for new scripts

        // Key settings
        adLevel: adLevel,
        keyDuration: keyDuration,
        maxUses: maxUses,
        hwidLock: hwidLock,
        keyPrefix: keyPrefix,
        gatewayCount: gatewayCount,
      }

      // Get existing scripts from localStorage or initialize empty array
      const existingScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

      // Add new script
      existingScripts.push(script)

      // Save back to localStorage
      localStorage.setItem("nexus_scripts", JSON.stringify(existingScripts))

      // Show success message
      setMessage({ type: "success", text: "Script submitted successfully! Redirecting to gateway page..." })

      // Redirect to key gateway page after a delay
      setTimeout(() => {
        router.push(`/key-gateway/${script.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error submitting script:", error)
      setMessage({ type: "error", text: "An error occurred while submitting the script" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadScripts = () => {
    try {
      const allScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
      setScripts(allScripts)
    } catch (error) {
      console.error("Error loading scripts:", error)
    } finally {
      setIsLoading2(false)
    }
  }

  const handleApproveScript = (scriptId: string) => {
    const updatedScripts = scripts.map((script) =>
      script.id === scriptId ? { ...script, status: "approved" } : script,
    )

    localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))
    setScripts(updatedScripts)
  }

  const handleRejectScript = (scriptId: string) => {
    const updatedScripts = scripts.map((script) =>
      script.id === scriptId ? { ...script, status: "rejected" } : script,
    )

    localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))
    setScripts(updatedScripts)
  }

  const handleViewScript = (script: any) => {
    setSelectedScript(script)
    setShowScriptModal(true)
  }

  const handleDeleteScript = (scriptId: string) => {
    if (confirm("Are you sure you want to delete this script? This action cannot be undone.")) {
      const updatedScripts = scripts.filter((script) => script.id !== scriptId)
      localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))
      setScripts(updatedScripts)

      if (selectedScript?.id === scriptId) {
        setSelectedScript(null)
        setShowScriptModal(false)
      }
    }
  }

  const filteredScripts = scripts.filter((script) => {
    // Filter by status
    if (filter !== "all" && script.status !== filter) {
      return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        script.title.toLowerCase().includes(searchLower) ||
        script.description.toLowerCase().includes(searchLower) ||
        script.author.toLowerCase().includes(searchLower) ||
        script.game?.name.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  useEffect(() => {
    if (!isLoading && user) {
      const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
      const userIsAdmin = adminUsernames.includes(user.username)

      setIsAdmin(userIsAdmin)

      if (!userIsAdmin) {
        // Redirect non-admins to upload scripts page
        router.push("/upload-scripts")
      } else {
        // Load scripts for admin
        loadScripts()
      }
    } else if (!isLoading && !user) {
      router.push("/login?redirect=/submit-script")
    }
  }, [user, isLoading, router])

  if (isLoading || isLoading2) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Script Manager
        </h1>
        <Link
          href="/admin-dashboard"
          className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-4 py-2 font-medium text-white transition-all hover:bg-[#0a0a0a]"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "all" ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "pending" ? "bg-yellow-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-clock mr-1"></i> Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "approved" ? "bg-green-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-check-circle mr-1"></i> Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "rejected" ? "bg-red-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-times-circle mr-1"></i> Rejected
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scripts..."
            className="w-full rounded border border-white/10 bg-[#0a0a0a] px-4 py-2 pl-10 text-white transition-all focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-[#ff3e3e]">
            <i className="fas fa-code"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Scripts Found</h2>
          <p className="text-gray-400">
            {filter !== "all"
              ? `There are no ${filter} scripts.`
              : searchTerm
                ? "No scripts match your search criteria."
                : "There are no scripts at this time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4 transition-all hover:border-[#ff3e3e]/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{script.title}</h3>
                  <p className="text-sm text-gray-400">By {script.author}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveScript(script.id)}
                    className="interactive-element rounded bg-green-500 px-3 py-1 text-sm text-white transition-all hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectScript(script.id)}
                    className="interactive-element rounded bg-red-500 px-3 py-1 text-sm text-white transition-all hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleViewScript(script)}
                    className="interactive-element rounded bg-blue-500 px-3 py-1 text-sm text-white transition-all hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteScript(script.id)}
                    className="interactive-element rounded bg-red-500 px-3 py-1 text-sm text-white transition-all hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing scripts */}
      {showScriptModal && selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-w-3xl rounded-lg bg-[#1a1a1a] p-8">
            <button
              onClick={() => setShowScriptModal(false)}
              className="absolute top-4 right-4 interactive-element rounded bg-red-500 px-3 py-1 text-sm text-white transition-all hover:bg-red-600"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">{selectedScript.title}</h2>
            <p className="mb-4 text-gray-400">{selectedScript.description}</p>
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded">
                <img
                  src={selectedScript.imageUrl || "/placeholder.svg"}
                  alt={selectedScript.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-white">Game: {selectedScript.game?.name}</h3>
                <p className="text-sm text-gray-400">Game ID: {selectedScript.game?.gameId}</p>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-bold text-white">Script Code</h3>
              <pre className="rounded-lg border border-white/10 bg-[#050505] p-4 text-white font-mono">
                {selectedScript.code}
              </pre>
            </div>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-bold text-white">Key Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-medium text-[#ff3e3e]">Key Prefix</label>
                  <input
                    type="text"
                    value={selectedScript.keyPrefix}
                    readOnly
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[#ff3e3e]">Key Duration (days)</label>
                  <input
                    type="number"
                    value={selectedScript.keyDuration}
                    readOnly
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[#ff3e3e]">Maximum Uses</label>
                  <input
                    type="number"
                    value={selectedScript.maxUses}
                    readOnly
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[#ff3e3e]">Gateway Count</label>
                  <input
                    type="number"
                    value={selectedScript.gatewayCount}
                    readOnly
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-bold text-white">Ad Settings</h3>
              <div className="mb-4">
                <label className="mb-2 block font-medium text-[#ff3e3e]">Ad Level</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={selectedScript.adLevel}
                    value={selectedScript.adLevel}
                    readOnly
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-bold min-w-[30px] text-center">{selectedScript.adLevel}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {selectedScript.adLevel === 1 && "Level 1: 2 buttons - direct link"}
                  {selectedScript.adLevel === 2 && "Level 2: 3 buttons - 2 redirect and 1 Opera GX download"}
                  {selectedScript.adLevel === 3 && "Level 3: 4 buttons - 2 redirect, 1 article and 1 Opera GX"}
                  {selectedScript.adLevel === 4 &&
                    "Level 4: 5 buttons - 2 redirect, 1 article, 1 Opera GX and 1 YouTube video"}
                  {selectedScript.adLevel === 5 && "Level 5: Level 4 + more ads on page"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form for submitting scripts */}
      {!selectedScript && (
        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
          <div className="mb-6">
            <label className="mb-2 block font-medium text-[#ff3e3e]">Game Search</label>

            <div className="mb-4 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setSearchMethod("id")
                  setShowSearchResults(false)
                }}
                className={`interactive-element flex-1 rounded px-4 py-2 ${
                  searchMethod === "id"
                    ? "bg-[#ff3e3e] text-white font-semibold"
                    : "bg-[#050505] text-white border border-white/10"
                }`}
              >
                Search by ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod("name")
                  setShowSearchResults(false)
                }}
                className={`interactive-element flex-1 rounded px-4 py-2 ${
                  searchMethod === "name"
                    ? "bg-[#ff3e3e] text-white font-semibold"
                    : "bg-[#050505] text-white border border-white/10"
                }`}
              >
                Search by Name
              </button>
            </div>

            {searchMethod === "id" ? (
              <div className="mb-4">
                <label htmlFor="gameId" className="mb-2 block text-sm font-medium text-gray-300">
                  Game ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="gameId"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    placeholder="Enter Roblox game ID"
                  />
                  <button
                    type="button"
                    onClick={handleFetchGameDetailsById}
                    disabled={isLoadingGame}
                    className="interactive-element button-glow rounded bg-[#ff3e3e] px-4 py-3 font-semibold text-white transition-all hover:bg-[#ff0000] disabled:opacity-50"
                  >
                    {isLoadingGame ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Fetch Game"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="gameName" className="mb-2 block text-sm font-medium text-gray-300">
                  Game Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="gameName"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    placeholder="Enter Roblox game name"
                  />
                  <button
                    type="button"
                    onClick={handleSearchGamesByName}
                    disabled={isLoadingGame}
                    className="interactive-element button-glow rounded bg-[#ff3e3e] px-4 py-3 font-semibold text-white transition-all hover:bg-[#ff0000] disabled:opacity-50"
                  >
                    {isLoadingGame ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Search Game"
                    )}
                  </button>
                </div>
              </div>
            )}

            {gameError && <p className="mt-1 text-sm text-red-400">{gameError}</p>}

            {/* Game search results */}
            {showSearchResults && gameSearchResults.length > 0 && (
              <div className="mt-4 max-h-80 overflow-y-auto rounded border border-white/10 bg-[#050505] p-2">
                <h3 className="mb-2 px-2 text-sm font-medium text-gray-300">Search Results</h3>
                <div className="space-y-2">
                  {gameSearchResults.map((game) => (
                    <div
                      key={game.gameId}
                      className="interactive-element flex cursor-pointer items-center gap-3 rounded p-2 transition-all hover:bg-[#1a1a1a]"
                      onClick={() => handleSelectGame(game)}
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={game.imageUrl || "/placeholder.svg"}
                          alt={game.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{game.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            <i className="fas fa-thumbs-up mr-1"></i> {game.stats.likes}
                          </span>
                          <span>
                            <i className="fas fa-user mr-1"></i> {game.stats.playing}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {gameDetails && (
            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded">
                  <img
                    src={gameDetails.imageUrl || "/placeholder.svg"}
                    alt={gameDetails.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{gameDetails.name}</h3>
                  <p className="text-sm text-gray-400">Game ID: {gameDetails.gameId}</p>
                  {gameDetails.stats && (
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        <i className="fas fa-user mr-1"></i> {gameDetails.stats.playing} playing
                      </span>
                      <span>
                        <i className="fas fa-thumbs-up mr-1"></i> {gameDetails.stats.likes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="scriptTitle" className="mb-2 block font-medium text-[#ff3e3e]">
              Script Title
            </label>
            <input
              type="text"
              id="scriptTitle"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              placeholder="Enter a title for your script"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="scriptImage" className="mb-2 block font-medium text-[#ff3e3e]">
              Script Image
            </label>
            <div className="mb-2">
              <input type="file" id="scriptImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <label
                htmlFor="scriptImage"
                className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md"
              >
                <div className="text-center">
                  <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                  <p className="text-sm text-gray-400">Click to upload script image (max 2MB)</p>
                </div>
              </label>
            </div>

            {imageUrl && (
              <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                <div className="relative h-40 w-full overflow-hidden rounded">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Script preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="interactive-element rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30"
                  >
                    <i className="fas fa-times mr-1"></i> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="scriptDescription" className="mb-2 block font-medium text-[#ff3e3e]">
              Description
            </label>
            <textarea
              id="scriptDescription"
              value={scriptDescription}
              onChange={(e) => setScriptDescription(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={3}
              placeholder="Describe what this script does"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{scriptDescription.length}/500 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="scriptCode" className="mb-2 block font-medium text-[#ff3e3e]">
              Script Code (Lua)
            </label>
            <textarea
              id="scriptCode"
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              className="input-focus-effect font-mono w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={10}
              placeholder="-- Enter your Lua script here"
            />
          </div>

          {/* Key settings section */}
          <div className="mb-6 p-4 rounded border border-white/10 bg-[#0a0a0a]">
            <h3 className="text-lg font-bold text-white mb-4">Key Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="keyPrefix" className="mb-2 block font-medium text-[#ff3e3e]">
                  Key Prefix
                </label>
                <input
                  type="text"
                  id="keyPrefix"
                  value={keyPrefix}
                  onChange={(e) => setKeyPrefix(e.target.value)}
                  maxLength={10}
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                />
              </div>

              <div>
                <label htmlFor="keyDuration" className="mb-2 block font-medium text-[#ff3e3e]">
                  Key Duration (days)
                </label>
                <input
                  type="number"
                  id="keyDuration"
                  value={keyDuration}
                  onChange={(e) => setKeyDuration(Number.parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                />
              </div>

              <div>
                <label htmlFor="maxUses" className="mb-2 block font-medium text-[#ff3e3e]">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  id="maxUses"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number.parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                />
              </div>

              <div>
                <label htmlFor="gatewayCount" className="mb-2 block font-medium text-[#ff3e3e]">
                  Gateway Count
                </label>
                <input
                  type="number"
                  id="gatewayCount"
                  value={gatewayCount}
                  onChange={(e) => setGatewayCount(Number.parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="hwidLock"
                  checked={hwidLock}
                  onChange={() => setHwidLock(!hwidLock)}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
                <label htmlFor="hwidLock" className="text-white">
                  HWID Lock
                </label>
              </div>

              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={isPremium}
                  onChange={() => setIsPremium(!isPremium)}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
                <label htmlFor="isPremium" className="text-white">
                  Premium Script
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white opacity-50">Anti-Emulator</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Ad settings section */}
          <div className="mb-6 p-4 rounded border border-white/10 bg-[#0a0a0a]">
            <h3 className="text-lg font-bold text-white mb-4">Ad Settings</h3>

            <div className="mb-4">
              <label htmlFor="adLevel" className="mb-2 block font-medium text-[#ff3e3e]">
                Ad Level (1-{maxAdLevel})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="adLevel"
                  min="1"
                  max={maxAdLevel}
                  value={adLevel}
                  onChange={(e) => setAdLevel(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-white font-bold min-w-[30px] text-center">{adLevel}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {adLevel === 1 && "Level 1: 2 buttons - direct link"}
                {adLevel === 2 && "Level 2: 3 buttons - 2 redirect and 1 Opera GX download"}
                {adLevel === 3 && "Level 3: 4 buttons - 2 redirect, 1 article and 1 Opera GX"}
                {adLevel === 4 && "Level 4: 5 buttons - 2 redirect, 1 article, 1 Opera GX and 1 YouTube video"}
                {adLevel === 5 && "Level 5: Level 4 + more ads on page"}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i> Submit Script
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

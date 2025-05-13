"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// Add these imports at the top
import { fetchGameDetailsById, fetchGameDetailsByName } from "@/app/actions/fetch-game-details"

// Define the admin token constant - same as in key-generator
const ADMIN_TOKEN_KEY =
  "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93"

export default function UploadKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [keyTitle, setKeyTitle] = useState("")
  const [keyDescription, setKeyDescription] = useState("")
  const [keyCode, setKeyCode] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Add these state variables
  const [gameId, setGameId] = useState("")
  const [gameName, setGameName] = useState("")
  const [gameDetails, setGameDetails] = useState<any | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(false)
  const [gameError, setGameError] = useState("")
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id")
  const [gameSearchResults, setGameSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // List of admin usernames - same as in key-generator
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

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

      // If not logged in, check for admin token in localStorage - using the same token as key-generator
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

  // Add these functions
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
      const result = await fetchGameDetailsById(gameId)

      if (result.success) {
        setGameDetails(result.data)
        // Update the game name field
        setGameName(result.data.name)
        // Automatically set the image URL from the game
        setImageUrl(result.data.imageUrl)
      } else {
        setGameError(result.error)
      }
    } catch (error) {
      console.error("Error fetching game details:", error)
      setGameError("An unexpected error occurred. Please try again.")
    } finally {
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
      const result = await fetchGameDetailsByName(gameName)

      if (result.success) {
        setGameSearchResults(result.data)
        setShowSearchResults(true)
      } else {
        setGameError(result.error)
      }
    } catch (error) {
      console.error("Error searching games:", error)
      setGameError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoadingGame(false)
    }
  }

  const handleSelectGame = (game: any) => {
    setGameDetails({
      name: game.name,
      imageUrl: game.imageUrl,
      gameId: game.gameId,
    })
    setGameId(game.gameId)
    setShowSearchResults(false)
    // Automatically set the image URL from the selected game
    setImageUrl(game.imageUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!keyTitle || !keyDescription || !keyCode) {
      setMessage({ type: "error", text: "Key title, description, and code are required" })
      return
    }

    if (!imageUrl) {
      setMessage({ type: "error", text: "Please upload an image for the key" })
      return
    }

    try {
      setIsUploading(true)

      // Get author name - use user.username if logged in, or "NEXUS Admin" if not
      const authorName = user ? user.username : "NEXUS Admin"

      // Create a key object
      const key = {
        id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: keyTitle,
        description: keyDescription,
        keyCode: keyCode,
        author: authorName,
        createdAt: new Date().toISOString(),
        imageUrl: imageUrl,
        likes: [], // Initialize empty likes array
        dislikes: [], // Initialize empty dislikes array
        isPremium: isPremium,
        isNexusTeam: true, // Since only admins can upload keys
        game: gameDetails, // Add game details if available
      }

      // Get existing keys from localStorage or initialize empty array
      const existingKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")

      // Add new key
      existingKeys.push(key)

      // Save back to localStorage
      localStorage.setItem("nexus_keys", JSON.stringify(existingKeys))

      // Show success message
      setMessage({ type: "success", text: "Key uploaded successfully!" })

      // Reset form
      setKeyTitle("")
      setKeyDescription("")
      setKeyCode("")
      setImageUrl("")
      setIsPremium(false)
      setGameId("")
      setGameName("")
      setGameDetails(null)

      // Reset file input
      const fileInput = document.getElementById("keyImage") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      // Redirect to key generator page after a delay
      setTimeout(() => {
        // Use window.location for a hard navigation that will refresh the page
        window.location.href = "/key-generator"
      }, 2000)
    } catch (error) {
      console.error("Error uploading key:", error)
      setMessage({ type: "error", text: "An error occurred while uploading the key" })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading || !adminCheckComplete) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Upload Key
          </h1>

          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Admin Access Required</h2>
            <p className="mb-6 text-gray-400">Only administrators can upload keys to the NEXUS platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/key-generator"
                className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "/key-generator"
                }}
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Keys
              </Link>
              <button
                onClick={() => {
                  // Set admin token and reload page - using the same token as key-generator
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

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Upload Key
        </h1>

        {message.text && (
          <div
            className={`mb-6 rounded p-4 ${
              message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

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
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="keyTitle" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Title
            </label>
            <input
              type="text"
              id="keyTitle"
              value={keyTitle}
              onChange={(e) => setKeyTitle(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              placeholder="Enter a title for your key"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="keyImage" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Image
            </label>
            <div className="mb-2">
              <input type="file" id="keyImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <label
                htmlFor="keyImage"
                className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md"
              >
                <div className="text-center">
                  <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                  <p className="text-sm text-gray-400">Click to upload key image (max 2MB)</p>
                </div>
              </label>
            </div>

            {imageUrl && (
              <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                <div className="relative h-40 w-full overflow-hidden rounded">
                  <img src={imageUrl || "/placeholder.svg"} alt="Key preview" className="h-full w-full object-cover" />
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
            <label htmlFor="keyDescription" className="mb-2 block font-medium text-[#ff3e3e]">
              Description
            </label>
            <textarea
              id="keyDescription"
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={3}
              placeholder="Describe what this key is for"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{keyDescription.length}/500 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="keyCode" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Code
            </label>
            <textarea
              id="keyCode"
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value)}
              className="input-focus-effect font-mono w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={5}
              placeholder="Enter the key code or link"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={() => setIsPremium(!isPremium)}
                className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
              />
              <span className="text-white">Mark as Premium Key</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">Premium keys will be highlighted with special styling</p>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i> Upload Key
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

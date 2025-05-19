"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { fetchGameDetailsById, fetchGameDetailsByName } from "@/app/actions/fetch-game-details"
import { scriptCategories } from "@/lib/categories"
import { validateScript } from "@/lib/script-validation"
import { DiscordLoginButton } from "@/components/discord-login-button"

type GameSearchResult = {
  gameId: string
  name: string
  imageUrl: string
  link: string
  stats: {
    likes: string
    playing: string
  }
}

type GameDetails = {
  name: string
  imageUrl: string
  gameId: string
}

// List of popular game IDs that require Discord authentication
const POPULAR_GAME_IDS = ["18668065416", "920587237", "2753915549"]

export default function UploadScriptsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptDescription, setScriptDescription] = useState("")
  const [scriptCode, setScriptCode] = useState("")
  const [gameId, setGameId] = useState("")
  const [gameName, setGameName] = useState("")
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(false)
  const [gameError, setGameError] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [message, setMessage] = useState({ type: "", text: "" })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id")
  const [gameSearchResults, setGameSearchResults] = useState<GameSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [isNexusTeamMember, setIsNexusTeamMember] = useState(false)
  const [uploadAsTeam, setUploadAsTeam] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [requiresDiscord, setRequiresDiscord] = useState(false)
  const [hasDiscord, setHasDiscord] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
    } else {
      // Check if user is banned
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
      if (userData.isBanned) {
        setMessage({
          type: "error",
          text: "Your account has been banned. You cannot upload scripts.",
        })
        return
      }

      // Check if user has Discord linked
      setHasDiscord(!!userData.discord_id)

      // Check if user is admin
      const checkAdminStatus = async () => {
        try {
          const adminStatus = await isAdmin(user.username)
          setUserIsAdmin(adminStatus)
          setIsNexusTeamMember(adminStatus)
        } catch (error) {
          console.error("Error checking admin status:", error)
          setUserIsAdmin(false)
        } finally {
          setAdminCheckComplete(true)
        }
      }

      checkAdminStatus()
    }
  }, [user, isLoading, router])

  // Check if game requires Discord when game ID changes
  useEffect(() => {
    if (gameId) {
      setRequiresDiscord(POPULAR_GAME_IDS.includes(gameId))
    } else {
      setRequiresDiscord(false)
    }
  }, [gameId])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [categoriesRef])

  // ---- AD: load JS after mount for each ad block ----
  function AdScript({ id, atOptions, src }: { id: string; atOptions: object; src: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!ref.current) return
      // Clean up previous ad
      ref.current.innerHTML = ""
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.innerHTML =
        "atOptions = " + JSON.stringify(atOptions) + ";"
      ref.current.appendChild(script)

      const invoke = document.createElement("script")
      invoke.type = "text/javascript"
      invoke.src = src
      ref.current.appendChild(invoke)
    }, [id, atOptions, src])

    return <div ref={ref} style={{ width: atOptions["width"], height: atOptions["height"] }} />
  }

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
        setGameName(result.data.name)
        setRequiresDiscord(POPULAR_GAME_IDS.includes(gameId))
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

  const handleSelectGame = (game: GameSearchResult) => {
    setGameDetails({
      name: game.name,
      imageUrl: game.imageUrl,
      gameId: game.gameId,
    })
    setGameId(game.gameId)
    setRequiresDiscord(POPULAR_GAME_IDS.includes(game.gameId))
    setShowSearchResults(false)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const checkDiscordRequirement = (gameId: string) => {
    // List of popular games that require Discord connection
    const popularGames = ["18668065416", "920587237", "2753915549"]

    if (popularGames.includes(gameId)) {
      if (!user?.discord_id) {
        return {
          required: true,
          message: "This is a popular game. You need to connect your Discord account to upload scripts for it.",
        }
      }
    }

    return { required: false }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setValidationErrors([])

    if (user) {
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
      if (userData.isBanned) {
        setMessage({
          type: "error",
          text: "Your account has been banned. You cannot upload scripts.",
        })
        return
      }
    }

    if (!scriptTitle || !scriptDescription || !scriptCode) {
      setMessage({ type: "error", text: "Script title, description, and code are required" })
      return
    }

    if (!gameDetails) {
      setMessage({ type: "error", text: "Please fetch valid game details before submitting" })
      return
    }

    if (selectedCategories.length === 0) {
      setMessage({ type: "error", text: "Please select at least one category" })
      return
    }

    if (requiresDiscord && !hasDiscord) {
      setMessage({
        type: "error",
        text: "This game requires Discord authentication. Please link your Discord account before uploading scripts for this game.",
      })
      return
    }

    const errors = validateScript(scriptCode)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    const discordCheck = checkDiscordRequirement(gameDetails?.gameId || "")
    if (discordCheck.required) {
      setMessage({ type: "error", text: discordCheck.message || "Discord connection required" })
      return
    }

    const script = {
      id: Date.now().toString(),
      title: scriptTitle,
      description: scriptDescription,
      code: scriptCode,
      author: uploadAsTeam && isNexusTeamMember ? "Nexus Team" : user?.username,
      createdAt: new Date().toISOString(),
      game: {
        id: Date.now(),
        gameId: gameDetails.gameId,
        name: gameDetails.name,
        imageUrl: gameDetails.imageUrl,
      },
      categories: selectedCategories,
      likes: [],
      dislikes: [],
      views: 0,
      isNexusTeam: uploadAsTeam && isNexusTeamMember,
    }

    const existingScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    existingScripts.push(script)
    localStorage.setItem("nexus_scripts", JSON.stringify(existingScripts))

    setMessage({ type: "success", text: "Script uploaded successfully!" })

    setScriptTitle("")
    setScriptDescription("")
    setScriptCode("")
    setGameId("")
    setGameName("")
    setGameDetails(null)
    setSelectedCategories([])
    setValidationErrors([])
    setGameSearchResults([])
    setShowSearchResults(false)
    setUploadAsTeam(false)

    setTimeout(() => {
      router.push("/scripts")
    }, 2000)
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

  if (userIsAdmin && adminCheckComplete) {
    router.push("/admin-dashboard/scripts")
    return null
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Upload Script
        </h1>

        {/* Banner Ad - Top */}
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
          <div className="flex justify-center">
            <AdScript
              id="ad728top"
              atOptions={{
                key: "fd9b1c1a9efee5e08a1818fb900a7d69",
                format: "iframe",
                height: 90,
                width: 728,
                params: {},
              }}
              src="//geometrydoomeddrone.com/fd9b1c1a9efee5e08a1818fb900a7d69/invoke.js"
            />
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 rounded p-4 ${
              message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-900/10 p-4">
            <h3 className="mb-2 font-bold text-red-300">Script Validation Errors:</h3>
            <ul className="list-inside list-disc text-red-200">
              {validationErrors.map((error, index) => (
                <li key={index} className="mb-1">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requiresDiscord && !hasDiscord && (
          <div className="mb-6 rounded border border-blue-500/20 bg-blue-900/10 p-4">
            <h3 className="mb-2 font-bold text-blue-300">Discord Authentication Required</h3>
            <p className="mb-4 text-blue-200">
              This game requires Discord authentication to upload scripts. Please link your Discord account to continue.
            </p>
            <DiscordLoginButton isLinking={true} className="w-full justify-center" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
          {/* ... (form code unchanged for brevity) ... */}
          {/* Banner Ad - Middle */}
          <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
            <div className="flex justify-center">
              <AdScript
                id="ad320middle"
                atOptions={{
                  key: "3e8a77126905eb1bf6906ca144e2e0dd",
                  format: "iframe",
                  height: 50,
                  width: 320,
                  params: {},
                }}
                src="//geometrydoomeddrone.com/3e8a77126905eb1bf6906ca144e2e0dd/invoke.js"
              />
            </div>
          </div>
          {/* ... (rest of form code unchanged) ... */}

          {/* Banner Ad - Bottom */}
          <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
            <div className="flex justify-center">
              <AdScript
                id="ad728bottom"
                atOptions={{
                  key: "26399d5117f28dad5c8e0a5f7fa6a967",
                  format: "iframe",
                  height: 90,
                  width: 728,
                  params: {},
                }}
                src="//geometrydoomeddrone.com/26399d5117f28dad5c8e0a5f7fa6a967/invoke.js"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

async function isAdmin(username: string): Promise<boolean> {
  // Replace with your actual admin check logic (e.g., fetching from a database)
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
  return adminUsernames.includes(username)
}

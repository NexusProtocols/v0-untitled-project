"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Upload, Check, AlertTriangle, Info } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { scriptCategories } from "@/lib/categories"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function getUser() {
      setIsLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)

        // Check if user has Discord linked
        const { data: profile } = await supabase
          .from("profiles")
          .select("discord_id")
          .eq("id", session.user.id)
          .single()

        setHasDiscord(!!profile?.discord_id)

        // Check if user is admin
        const isAdmin =
          session.user.app_metadata?.is_admin ||
          ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"].includes(
            session.user.user_metadata?.username || "",
          )

        setUserIsAdmin(isAdmin)
        setIsNexusTeamMember(isAdmin)
        setAdminCheckComplete(true)
      } else {
        router.push("/login")
      }

      setIsLoading(false)
    }

    getUser()
  }, [router])

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
      // Simulate fetching game details
      setTimeout(() => {
        setGameDetails({
          name: `Game ${gameId}`,
          imageUrl: "/placeholder.svg?height=160&width=320",
          gameId: gameId,
        })
        setRequiresDiscord(POPULAR_GAME_IDS.includes(gameId))
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
      // Simulate searching games
      setTimeout(() => {
        const results = Array.from({ length: 5 }).map((_, index) => ({
          name: `${gameName} ${index + 1}`,
          imageUrl: "/placeholder.svg?height=160&width=320",
          gameId: `${1000 + index}`,
          link: `https://example.com/game/${1000 + index}`,
          stats: {
            likes: `${Math.floor(Math.random() * 10000)}`,
            playing: `${Math.floor(Math.random() * 1000)}`,
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

  const validateScript = (code: string): string[] => {
    const errors = []

    if (code.length > 50000) {
      errors.push("Script is too long (maximum 50,000 characters)")
    }

    if (code.includes("http-equiv") || code.includes("<script>")) {
      errors.push("Script contains potentially harmful HTML tags")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setValidationErrors([])

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to upload scripts. Please log in and try again.",
      })
      return
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

    try {
      setIsSubmitting(true)
      setMessage({ type: "info", text: "Uploading script..." })

      const scriptData = {
        title: scriptTitle,
        description: scriptDescription,
        code: scriptCode,
        author: uploadAsTeam && isNexusTeamMember ? "Nexus Team" : user.user_metadata?.username || user.email,
        game: {
          gameId: gameDetails.gameId,
          name: gameDetails.name,
          imageUrl: gameDetails.imageUrl,
        },
        categories: selectedCategories,
        isNexusTeam: uploadAsTeam && isNexusTeamMember,
      }

      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scriptData),
      })

      const result = await response.json()

      if (result.success) {
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
      } else {
        setMessage({ type: "error", text: result.message || "Failed to upload script" })
      }
    } catch (error) {
      console.error("Error uploading script:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred while uploading the script",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

        {message.text && (
          <Alert
            className={`mb-6 ${
              message.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-500/50"
                : message.type === "success"
                  ? "bg-green-900/30 text-green-200 border-green-500/50"
                  : "bg-blue-900/30 text-blue-200 border-blue-500/50"
            }`}
          >
            {message.type === "error" && <AlertTriangle className="h-4 w-4" />}
            {message.type === "success" && <Check className="h-4 w-4" />}
            {message.type === "info" && <Info className="h-4 w-4" />}
            <AlertTitle>
              {message.type === "error" ? "Error" : message.type === "success" ? "Success" : "Information"}
            </AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-500/20 bg-red-900/10 text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Script Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {validationErrors.map((error, index) => (
                  <li key={index} className="mb-1">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {requiresDiscord && !hasDiscord && (
          <Alert className="mb-6 border-blue-500/20 bg-blue-900/10 text-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Discord Authentication Required</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                This game requires Discord authentication to upload scripts. Please link your Discord account to
                continue.
              </p>
              <Button variant="outline" className="bg-[#5865F2] text-white hover:bg-[#4752C4]">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Link Discord Account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-l-4 border-[#ff3e3e]">
          <CardHeader>
            <CardTitle>Upload New Script</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="scriptTitle" className="text-[#ff3e3e]">
                  Script Title
                </Label>
                <Input
                  id="scriptTitle"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="mt-1 bg-[#050505] border-white/10 focus:border-[#ff3e3e] hover:border-[#ff3e3e]/50"
                  placeholder="Enter a title for your script"
                />
              </div>

              {isNexusTeamMember && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uploadAsTeam"
                    checked={uploadAsTeam}
                    onCheckedChange={() => setUploadAsTeam(!uploadAsTeam)}
                  />
                  <Label htmlFor="uploadAsTeam">
                    Upload as <span className="text-[#00a2ff]">Nexus Team</span>
                  </Label>
                </div>
              )}

              <div>
                <Label className="text-[#ff3e3e]">Game Search</Label>
                <Tabs
                  defaultValue="id"
                  className="mt-2"
                  onValueChange={(value) => setSearchMethod(value as "id" | "name")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="id">Search by ID</TabsTrigger>
                    <TabsTrigger value="name">Search by Name</TabsTrigger>
                  </TabsList>
                  <TabsContent value="id" className="mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        className="bg-[#050505] border-white/10"
                        placeholder="Enter Roblox game ID"
                      />
                      <Button
                        type="button"
                        onClick={handleFetchGameDetailsById}
                        disabled={isLoadingGame}
                        className="bg-[#00c6ed] text-[#050505] hover:bg-[#00b8ff]"
                      >
                        {isLoadingGame ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading
                          </>
                        ) : (
                          "Fetch Game"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="name" className="mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        className="bg-[#050505] border-white/10"
                        placeholder="Enter Roblox game name"
                      />
                      <Button
                        type="button"
                        onClick={handleSearchGamesByName}
                        disabled={isLoadingGame}
                        className="bg-[#00c6ed] text-[#050505] hover:bg-[#00b8ff]"
                      >
                        {isLoadingGame ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {gameError && <p className="mt-1 text-sm text-red-400">{gameError}</p>}

                {/* Game search results */}
                {showSearchResults && gameSearchResults.length > 0 && (
                  <div className="mt-4 max-h-80 overflow-y-auto rounded border border-white/10 bg-[#050505] p-2">
                    <h3 className="mb-2 px-2 text-sm font-medium text-gray-300">Search Results</h3>
                    <div className="space-y-2">
                      {gameSearchResults.map((game) => (
                        <div
                          key={game.gameId}
                          className="flex cursor-pointer items-center gap-3 rounded p-2 transition-all hover:bg-[#1a1a1a]"
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
                                <svg className="mr-1 inline-block h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                {game.stats.likes}
                              </span>
                              <span>
                                <svg className="mr-1 inline-block h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                {game.stats.playing}
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
                <div className="rounded border border-white/10 bg-[#050505] p-4">
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
                      {requiresDiscord && (
                        <p className="mt-1 text-xs text-blue-400">
                          <svg className="mr-1 inline-block h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                          Discord authentication required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative" ref={categoriesRef}>
                <Label className="text-[#ff3e3e]">Categories</Label>
                <Button
                  type="button"
                  onClick={() => setShowCategories(!showCategories)}
                  variant="outline"
                  className="mt-1 w-full justify-between bg-[#050505] border-white/10"
                >
                  <span>
                    {selectedCategories.length === 0
                      ? "Select Categories"
                      : `${selectedCategories.length} ${selectedCategories.length === 1 ? "Category" : "Categories"} Selected`}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${showCategories ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {showCategories && (
                  <div className="absolute z-10 mt-1 w-full rounded border border-white/10 bg-[#050505] py-1 shadow-lg max-h-60 overflow-y-auto">
                    {scriptCategories.map((category) => (
                      <div
                        key={category.id}
                        className="px-4 py-2 hover:bg-[#1a1a1a] cursor-pointer flex items-center"
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                            selectedCategories.includes(category.id)
                              ? "border-[#ff3e3e] bg-[#ff3e3e]"
                              : "border-white/30"
                          }`}
                        >
                          {selectedCategories.includes(category.id) && <Check className="h-3 w-3 text-[#050505]" />}
                        </div>
                        <span className={selectedCategories.includes(category.id) ? "text-[#ff3e3e]" : "text-white"}>
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">Select all that apply</p>
              </div>

              <div>
                <Label htmlFor="scriptDescription" className="text-[#ff3e3e]">
                  Description
                </Label>
                <Textarea
                  id="scriptDescription"
                  value={scriptDescription}
                  onChange={(e) => setScriptDescription(e.target.value)}
                  className="mt-1 bg-[#050505] border-white/10 focus:border-[#ff3e3e] hover:border-[#ff3e3e]/50"
                  rows={3}
                  placeholder="Describe what your script does"
                  maxLength={500}
                />
                <p className="mt-1 text-right text-xs text-gray-400">{scriptDescription.length}/500 characters</p>
              </div>

              <div>
                <Label htmlFor="scriptCode" className="text-[#ff3e3e]">
                  Script Code
                </Label>
                <Textarea
                  id="scriptCode"
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  className="mt-1 font-mono bg-[#050505] border-white/10 focus:border-[#ff3e3e] hover:border-[#ff3e3e]/50"
                  rows={10}
                  placeholder="-- Paste your Lua script here"
                />
                <p className="mt-1 text-xs text-gray-400">1000 Lines Limit</p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || (requiresDiscord && !hasDiscord)}
              className="flex-1 bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Script
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/scripts">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { scriptCategories } from "@/lib/categories"

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
  isNexusTeam?: boolean
  isPremium?: boolean
  realStats?: {
    downloads: number
    views: number
    likes: number
  }
}

export default function ScriptDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [script, setScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [relatedScripts, setRelatedScripts] = useState<Script[]>([])
  const [hasLiked, setHasLiked] = useState(false)
  const [hasDisliked, setHasDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0) // Declare setDislikeCount
  const [isMobile, setIsMobile] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [authorIsAdmin, setAuthorIsAdmin] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchScript = async () => {
      setIsLoading(true)
      try {
        // Get scripts from localStorage
        const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
        const foundScript = storedScripts.find((s: Script) => s.id === id)

        if (foundScript) {
          // Ensure the game object and imageUrl exist
          if (!foundScript.game) {
            foundScript.game = {
              id: 0,
              name: "Unknown Game",
              imageUrl: "/placeholder.svg?height=256&width=800",
            }
          } else if (!foundScript.game.imageUrl) {
            foundScript.game.imageUrl = "/placeholder.svg?height=256&width=800"
          }

          // Fetch real stats if available (in production, this would be an API call)
          // For now, we'll simulate real stats
          const realStats = {
            downloads: Math.floor(Math.random() * 0) + 0,
            views: Math.floor(Math.random() * 0) + 0,
            likes: Math.floor(Math.random() * 0) + 0,
          }

          foundScript.realStats = realStats
          setScript(foundScript)

          // Increment view count
          if (!foundScript.views) {
            foundScript.views = 1
          } else {
            foundScript.views += 1
          }

          // Update script in localStorage
          localStorage.setItem(
            "nexus_scripts",
            JSON.stringify(storedScripts.map((s: Script) => (s.id === id ? foundScript : s))),
          )

          // Check if user has liked or disliked
          if (user) {
            setHasLiked(foundScript.likes?.includes(user.username) || false)
            setHasDisliked(foundScript.dislikes?.includes(user.username) || false)
          }

          // Set like and dislike counts
          setLikeCount(foundScript.likes?.length || 0)
          setDislikeCount(foundScript.dislikes?.length || 0)

          // Find related scripts (same game or categories)
          const related = storedScripts
            .filter((s: Script) => {
              if (s.id === id) return false // Exclude current script
              if (s.game?.id === foundScript.game?.id) return true // Same game
              if (
                foundScript.categories &&
                s.categories &&
                s.categories.some((cat: string) => foundScript.categories?.includes(cat))
              )
                return true // Same category
              return false
            })
            .slice(0, 3) // Limit to 3 related scripts
          setRelatedScripts(related)

          // Check if author is admin
          const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
          setAuthorIsAdmin(adminUsernames.includes(foundScript.author))
        } else {
          router.push("/scripts")
        }
      } catch (error) {
        console.error("Error fetching script:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchScript()
    }
  }, [id, router, user])

  const handleCopyCode = () => {
    if (script) {
      navigator.clipboard.writeText(script.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (script) {
      const element = document.createElement("a")
      const file = new Blob([script.code], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = `${script.title.replace(/\s+/g, "_")}.lua`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const handleLike = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!script) return

    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    const scriptIndex = storedScripts.findIndex((s: Script) => s.id === id)

    if (scriptIndex === -1) return

    const updatedScript = { ...storedScripts[scriptIndex] }

    // Initialize arrays if they don't exist
    if (!updatedScript.likes) updatedScript.likes = []
    if (!updatedScript.dislikes) updatedScript.dislikes = []

    if (hasLiked) {
      // Remove like
      updatedScript.likes = updatedScript.likes.filter((username: string) => username !== user.username)
      setHasLiked(false)
      setLikeCount((prev) => prev - 1)
    } else {
      // Add like and remove dislike if exists
      if (hasDisliked) {
        updatedScript.dislikes = updatedScript.dislikes.filter((username: string) => username !== user.username)
        setHasDisliked(false)
        setDislikeCount((prev) => prev - 1)
      }
      updatedScript.likes.push(user.username)
      setHasLiked(true)
      setLikeCount((prev) => prev + 1)
    }

    // Update script in localStorage
    storedScripts[scriptIndex] = updatedScript
    localStorage.setItem("nexus_scripts", JSON.stringify(storedScripts))
  }

  const handleDislike = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!script) return

    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    const scriptIndex = storedScripts.findIndex((s: Script) => s.id === id)

    if (scriptIndex === -1) return

    const updatedScript = { ...storedScripts[scriptIndex] }

    // Initialize arrays if they don't exist
    if (!updatedScript.likes) updatedScript.likes = []
    if (!updatedScript.dislikes) updatedScript.dislikes = []

    if (hasDisliked) {
      // Remove dislike
      updatedScript.dislikes = updatedScript.dislikes.filter((username: string) => username !== user.username)
      setHasDisliked(false)
      setDislikeCount((prev) => prev - 1)
    } else {
      // Add dislike and remove like if exists
      if (hasLiked) {
        updatedScript.likes = updatedScript.likes.filter((username: string) => username !== user.username)
        setHasLiked(false)
        setLikeCount((prev) => prev - 1)
      }
      updatedScript.dislikes.push(user.username)
      setHasDisliked(true)
      setDislikeCount((prev) => prev + 1)
    }

    // Update script in localStorage
    storedScripts[scriptIndex] = updatedScript
    localStorage.setItem("nexus_scripts", JSON.stringify(storedScripts))
  }

  // Get placeholder image
  const getPlaceholderImage = () => {
    return "/placeholder.svg?height=256&width=800"
  }

  // Handle image error
  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageId]: true,
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (!script) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Script not found</h1>
          <Link href="/scripts" className="text-[#ff3e3e] hover:underline">
            Back to Scripts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-8">
      <div className="mb-6">
        <Link href="/scripts" className="flex items-center text-[#ff3e3e] hover:underline">
          <i className="fas fa-arrow-left mr-2"></i> Back to Scripts
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Main Script Content */}
          <div className="mb-8 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0a0a0a]">
            {/* Script Header with Image */}
            <div className="relative h-64 w-full">
              {!imageErrors["main"] ? (
                <Image
                  src={script.game?.imageUrl || "/placeholder.svg?height=256&width=800"}
                  alt={script.game?.name || script.title}
                  fill
                  className="object-cover"
                  onError={() => handleImageError("main")}
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <i className="fas fa-gamepad text-5xl text-red-500 mb-2"></i>
                    <p className="text-white">{script.game?.name}</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold text-white">{script.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <span className="flex items-center text-sm text-gray-300">
                    <i className="fas fa-user mr-1"></i> {script.author}
                    {authorIsAdmin && (
                      <span className="ml-2 rounded bg-[#ff3e3e]/20 px-2 py-0.5 text-xs font-medium text-[#ff3e3e]">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="flex items-center text-sm text-gray-300">
                    <i className="fas fa-calendar mr-1"></i> {new Date(script.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-300">
                    <i className="fas fa-eye mr-1"></i> {script.realStats?.views || script.views || 0} views
                  </span>
                </div>
              </div>
            </div>

            {/* Script Content */}
            <div className="p-6">
              {/* Game Info */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded">
                  {!imageErrors["game"] ? (
                    <Image
                      src={script.game?.imageUrl || "/placeholder.svg?height=48&width=48"}
                      alt={script.game?.name || "Game"}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError("game")}
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900">
                      <i className="fas fa-gamepad text-red-500"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{script.game?.name || "Unknown Game"}</h3>
                  {script.game?.gameId && <p className="text-sm text-gray-400">Game ID: {script.game.gameId}</p>}
                </div>
              </div>

              {/* Description - ScriptBlox Style */}
              <div className="mb-6 rounded-lg border border-[#1a1a1a] bg-[#0d1117] p-4">
                <h3 className="mb-4 text-xl font-medium text-white">Description</h3>
                <div className={`whitespace-pre-line text-gray-300 ${!showFullDescription && "line-clamp-3"}`}>
                  {script.description}
                </div>
                {script.description.split("\n").length > 3 && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="rounded bg-[#1a1a1a] px-3 py-1 text-sm text-white hover:bg-[#252525]"
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </button>
                    <button className="rounded bg-[#1a1a1a] px-3 py-1 text-sm text-white hover:bg-[#252525]">
                      Show changelog
                    </button>
                  </div>
                )}
              </div>

              {/* Categories */}
              {script.categories && script.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-medium text-white">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {script.categories.map((categoryId) => {
                      const category = scriptCategories.find((c) => c.id === categoryId)
                      return (
                        category && (
                          <span
                            key={categoryId}
                            className="rounded bg-[#ff3e3e]/10 px-2 py-1 text-xs font-medium text-[#ff3e3e]"
                          >
                            {category.name}
                          </span>
                        )
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-medium text-white">Features</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-300">
                  {script.description
                    .split("\n")
                    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
                    .map((feature, index) => (
                      <li key={index} className="ml-2">
                        {feature.trim().substring(1).trim()}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Script Code - ScriptBlox Style */}
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2 mb-2">
                  <h3 className="text-lg font-medium text-white">View Raw</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    Edited By: <span className="ml-1 text-[#ff3e3e]">{script.author}</span>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center rounded bg-[#1a1a1a] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#252525]"
                      >
                        {copied ? (
                          <>
                            <i className="fas fa-check mr-1"></i> Copied
                          </>
                        ) : (
                          <>
                            <i className="fas fa-copy mr-1"></i> Copy Script
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center rounded bg-[#6366f1] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#4f46e5]"
                      >
                        <i className="fas fa-download mr-1"></i> Download
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative max-h-96 overflow-auto rounded bg-[#0d1117] p-4 font-mono text-sm">
                  <pre className="text-gray-300">{script.code}</pre>
                </div>
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                    hasLiked ? "bg-green-500/20 text-green-400" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
                  }`}
                >
                  <i className={`${hasLiked ? "fas" : "far"} fa-thumbs-up`}></i>
                  <span>{script.realStats?.likes || likeCount}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                    hasDisliked ? "bg-red-500/20 text-red-400" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
                  }`}
                >
                  <i className={`${hasDisliked ? "fas" : "far"} fa-thumbs-down`}></i>
                  <span>{dislikeCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Author Info */}
          <div className="mb-8 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-6">
            <h3 className="mb-4 text-lg font-medium text-white">Author</h3>
            <Link href={`/profile/${script.author}`} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a0a] text-lg font-bold text-[#ff3e3e]">
                {script.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white">{script.author}</p>
                <p className="text-sm text-gray-400">View Profile</p>
              </div>
            </Link>
          </div>

          {/* Related Scripts */}
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-6">
            <h3 className="mb-4 text-lg font-medium text-white">Related Scripts</h3>
            {relatedScripts.length > 0 ? (
              <div className="space-y-4">
                {relatedScripts.map((relatedScript) => (
                  <Link
                    key={relatedScript.id}
                    href={`/scripts/${relatedScript.id}`}
                    className="flex gap-3 rounded border border-[#2a2a2a] bg-[#0a0a0a] p-3 transition-all hover:border-[#ff3e3e]/30"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                      {!imageErrors[`related-${relatedScript.id}`] ? (
                        <Image
                          src={relatedScript.game?.imageUrl || "/placeholder.svg?height=64&width=64"}
                          alt={relatedScript.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          onError={() => handleImageError(`related-${relatedScript.id}`)}
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-900">
                          <i className="fas fa-gamepad text-red-500"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white line-clamp-1">{relatedScript.title}</h4>
                      <p className="text-xs text-gray-400">By {relatedScript.author}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="flex items-center text-xs text-gray-400">
                          <i className="fas fa-eye mr-1"></i>{" "}
                          {relatedScript.realStats?.views || relatedScript.views || 0}
                        </span>
                        <span className="flex items-center text-xs text-gray-400">
                          <i className="fas fa-thumbs-up mr-1"></i>{" "}
                          {relatedScript.realStats?.likes || relatedScript.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No related scripts found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

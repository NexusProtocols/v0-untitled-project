"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { isAdmin } from "@/lib/admin"

type Key = {
  id: string
  title: string
  description: string
  keyCode: string
  author: string
  createdAt: string
  imageUrl: string
  likes: string[] // Array of userIds who liked
  dislikes: string[] // Array of userIds who disliked
  isPremium?: boolean
  isNexusTeam?: boolean
  game?: {
    name: string
    imageUrl: string
    gameId?: string
  }
  views?: number
}

export default function KeyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [key, setKey] = useState<Key | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [authorIsAdmin, setAuthorIsAdmin] = useState(false)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)

  useEffect(() => {
    // Load keys from localStorage
    const storedKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")
    const foundKey = storedKeys.find((k: Key) => k.id === id)

    if (foundKey) {
      setKey(foundKey)

      // Check if author is admin
      const checkAuthorAdmin = async () => {
        if (foundKey.author) {
          const isAuthorAdmin = await isAdmin(foundKey.author)
          setAuthorIsAdmin(isAuthorAdmin)

          // If author is admin, mark key as Nexus Team
          if (isAuthorAdmin && !foundKey.isNexusTeam) {
            const nexusTeamKey = { ...foundKey, isNexusTeam: true }
            const nexusUpdatedKeys = storedKeys.map((k: Key) => (k.id === id ? nexusTeamKey : k))
            localStorage.setItem("nexus_keys", JSON.stringify(nexusUpdatedKeys))
            setKey(nexusTeamKey)
          }
        }
      }

      checkAuthorAdmin()

      // Check if current user is admin
      if (user) {
        const checkCurrentUserAdmin = async () => {
          const isCurrentUserAdmin = await isAdmin(user.username)
          setCurrentUserIsAdmin(isCurrentUserAdmin)
        }
        checkCurrentUserAdmin()
      }

      // Increment view count
      const updatedKey = { ...foundKey, views: (foundKey.views || 0) + 1 }
      const updatedKeys = storedKeys.map((k: Key) => (k.id === id ? updatedKey : k))
      localStorage.setItem("nexus_keys", JSON.stringify(updatedKeys))
      setKey(updatedKey)
    } else {
      setError("Key not found")
    }

    setIsLoading(false)
  }, [id, user])

  const handleDeleteKey = async () => {
    if (!currentUserIsAdmin || !key) return

    if (confirm("Are you sure you want to delete this key? This action cannot be undone.")) {
      // Get all keys
      const allKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")

      // Filter out the key to remove
      const updatedKeys = allKeys.filter((k: Key) => k.id !== id)

      // Save back to localStorage
      localStorage.setItem("nexus_keys", JSON.stringify(updatedKeys))

      alert("Key has been deleted successfully.")
      router.push("/key-generator")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    )
  }

  if (error || !key) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mb-4 text-5xl text-red-400">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Key Not Found</h2>
          <p className="mb-6 text-gray-400">The key you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/key-generator"
            className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Keys
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <Link href="/key-generator" className="mb-8 inline-flex items-center text-[#00c6ed] hover:underline">
        <i className="fas fa-arrow-left mr-2"></i> Back to Keys
      </Link>

      <div className="mb-8 overflow-hidden rounded-lg border border-[#00c6ed]/30">
        <div className="relative h-48 w-full md:h-64">
          <Image
            src={key.imageUrl || "/placeholder.svg"}
            alt={key.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="mb-2 inline-block rounded bg-[#00c6ed]/20 px-3 py-1 text-sm font-medium text-[#00c6ed]">
              Premium Key
            </span>
            <h1 className="text-3xl font-bold text-white">{key.title}</h1>
          </div>
          {key.isNexusTeam && (
            <div className="absolute top-4 right-4 rounded bg-[#00ff9d] px-3 py-1 text-sm font-bold text-[#050505]">
              <span>
                <i style={{ color: "var(--secondary)" }} className="fas fa-user-shield"></i> Nexus Team
              </span>
            </div>
          )}
          {key.isPremium && !key.isNexusTeam && (
            <div className="absolute top-4 right-4 rounded bg-[#BA55D3] px-3 py-1 text-sm font-bold text-white">
              PREMIUM
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-2/3">
          <div className="mb-6 flex items-center gap-3">
            <Link href={`/profile/${key.author}`} className="flex items-center gap-3 hover:underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0a0a0a]">
                {key.author.charAt(0).toUpperCase()}
              </div>
              <span className={`text-gray-300 ${authorIsAdmin ? "text-[#00ff9d]" : ""}`}>
                {key.author} {authorIsAdmin && <i className="fas fa-shield-alt ml-1 text-xs text-[#00a2ff]"></i>}
              </span>
            </Link>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">
              {new Date(key.createdAt).toLocaleDateString()} at {new Date(key.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="rounded-lg border-l-4 border-[#00c6ed] bg-[#1a1a1a] p-6">
            <h2 className="mb-3 text-xl font-bold text-white">Description</h2>
            <p className="text-gray-300 whitespace-pre-line">{key.description}</p>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Actions</h2>

            <button
              className="mb-3 w-full rounded border border-[#00ff9d] bg-[rgba(0,255,157,0.1)] px-4 py-3 text-[#00ff9d] transition-all hover:bg-[rgba(0,255,157,0.2)] hover:scale-105 transform duration-300"
              onClick={() => {
                navigator.clipboard.writeText(key.keyCode)
                alert("Key copied to clipboard!")
              }}
            >
              <i className="fas fa-copy mr-2"></i> Copy Key
            </button>

            {currentUserIsAdmin && (
              <button
                className="w-full rounded border border-red-500 bg-[rgba(239,68,68,0.1)] px-4 py-3 text-red-500 transition-all hover:bg-[rgba(239,68,68,0.2)] hover:scale-105 transform duration-300"
                onClick={handleDeleteKey}
              >
                <i className="fas fa-trash mr-2"></i> Delete Key
              </button>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Statistics</h2>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-lg">
                <i className="fas fa-eye text-[#00c6ed]"></i>
                <span className="text-white">
                  {key.views ? (key.views >= 1000 ? (key.views / 1000).toFixed(1) + "k" : key.views) : 0} Views
                </span>
              </div>
            </div>
          </div>
          {key.game && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Game Information</h2>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded">
                  <Image
                    src={key.game.imageUrl || "/placeholder.svg"}
                    alt={key.game.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    quality={100}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{key.game.name}</h3>
                  {key.game.gameId && <p className="text-xs text-gray-400">Game ID: {key.game.gameId}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Key Code</h2>
        <div className="relative">
          <pre className="max-h-[500px] overflow-auto rounded bg-[#050505] p-4 font-mono text-sm text-gray-300">
            <code>{key.keyCode}</code>
          </pre>
          <button
            className="absolute right-4 top-4 rounded bg-[#1a1a1a] p-2 text-[#00ff9d] transition-all hover:bg-[#2a2a2a] hover:scale-110 transform duration-300"
            onClick={() => {
              navigator.clipboard.writeText(key.keyCode)
              alert("Key copied to clipboard!")
            }}
          >
            <i className="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

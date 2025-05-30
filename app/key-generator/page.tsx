"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

// Define the admin token constant
const ADMIN_TOKEN_KEY =
  "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93"

type Game = {
  id: number
  gameId?: string
  name: string
  imageUrl: string
}

type Key = {
  id: string
  title: string
  description: string
  keyCode: string
  author: string
  createdAt: string
  imageUrl: string
  likes?: string[]
  dislikes?: string[]
  isPremium?: boolean
  isNexusTeam?: boolean
  game?: Game
}

export default function KeyGeneratorPage() {
  const { user, isLoading } = useAuth()
  const [keys, setKeys] = useState<Key[]>([])
  const [filteredKeys, setFilteredKeys] = useState<Key[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all")
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

  // List of admin usernames
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

  useEffect(() => {
    // Load keys from localStorage
    const storedKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")
    setKeys(storedKeys)
    setFilteredKeys(storedKeys)
    setIsLoadingKeys(false)

    // Check if user is admin by username only
    if (user) {
      const isUserAdmin = adminUsernames.includes(user.username)
      setUserIsAdmin(isUserAdmin)
      setAdminCheckComplete(true)
    } else {
      // Check for admin token in localStorage as fallback
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (adminToken) {
        setUserIsAdmin(true)
      }
      setAdminCheckComplete(true)
    }
  }, [user])

  // Filter keys based on search term and filter type
  useEffect(() => {
    let filtered = [...keys]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (key) =>
          key.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (key.game?.name && key.game.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply type filter
    if (filter === "premium") {
      filtered = filtered.filter((key) => key.isPremium)
    } else if (filter === "free") {
      filtered = filtered.filter((key) => !key.isPremium)
    }

    setFilteredKeys(filtered)
  }, [searchTerm, keys, filter])

  if (isLoading || !adminCheckComplete) {
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Key Generator
          </h1>

          {userIsAdmin && (
            <Link
              href="/upload-keys"
              className="nav-item button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-upload mr-2"></i> Upload Key
            </Link>
          )}
        </div>

        <div className="mb-8 rounded-lg border border-[#ff3e3e]/20 bg-[#1a1a1a] p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-focus-effect w-full rounded-lg border border-white/10 bg-[#050505] py-2 pl-10 pr-4 text-white placeholder-gray-400 hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                placeholder="Search keys by title, description, or game..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`interactive-element rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "all"
                    ? "bg-[#ff3e3e] text-[#050505]"
                    : "border border-white/10 bg-[#050505] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("premium")}
                className={`interactive-element rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "premium"
                    ? "bg-[#BA55D3] text-white"
                    : "border border-white/10 bg-[#050505] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Premium
              </button>
              <button
                onClick={() => setFilter("free")}
                className={`interactive-element rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "free"
                    ? "bg-[#ff3e3e] text-[#050505]"
                    : "border border-white/10 bg-[#050505] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Free
              </button>
            </div>
          </div>
        </div>

        {isLoadingKeys ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-gray-500">
              <i className="fas fa-key"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">No Keys Found</h2>
            <p className="mb-6 text-gray-400">
              {searchTerm
                ? "No keys match your search criteria. Try a different search term."
                : "There are no keys available at the moment. Check back later."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredKeys.map((key) => (
              <Link
                key={key.id}
                href={`/key-generator/${key.id}`}
                className="card-hover group overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg hover:shadow-[#ff3e3e]/5"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={key.imageUrl || "/placeholder.svg"}
                    alt={key.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                  {key.isPremium && (
                    <div className="absolute top-4 right-4 rounded bg-[#BA55D3] px-3 py-1 text-sm font-bold text-white">
                      PREMIUM
                    </div>
                  )}
                  {key.isNexusTeam && (
                    <div className="absolute top-4 left-4 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-bold text-white">
                      <i className="fas fa-shield-alt mr-1"></i> NEXUS TEAM
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#ff3e3e]">{key.title}</h3>
                  <p className="mb-4 text-sm text-gray-400 line-clamp-2">{key.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff3e3e] text-xs font-bold text-white">
                        {key.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-400">{key.author}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

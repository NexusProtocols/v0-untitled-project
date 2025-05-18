"use client"

import { useRef } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
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
  isPremium?: boolean
  isNexusTeam?: boolean
  isHidden?: boolean
  updatedAt?: string
  isVerified?: boolean
  isUniversal?: boolean
  isPatched?: boolean
  keySystem?: boolean
  scriptType?: string
}

type FilterOptions = {
  verified: boolean
  universal: boolean
  patched: boolean
  keySystem: boolean
  scriptType: boolean
  free: boolean
  paid: boolean
  [key: string]: boolean
}

type SortOptions = {
  sortBy: 'views' | 'likes' | 'dislikes' | 'createdAt' | 'updatedAt' | ''
  sortOrder: 'ascending' | 'descending'
}

export default function ScriptsPage() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategories, setShowCategories] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    verified: false,
    universal: false,
    patched: false,
    keySystem: false,
    scriptType: false,
    free: false,
    paid: false
  })
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: '',
    sortOrder: 'descending'
  })

  const handleImageError = (scriptId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [scriptId]: true,
    }))
  }

  const toggleFilter = (filterName: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }))
  }

  const handleSortChange = (sortBy: SortOptions['sortBy']) => {
    setSortOptions(prev => ({
      ...prev,
      sortBy: prev.sortBy === sortBy ? '' : sortBy
    }))
  }

  const toggleSortOrder = () => {
    setSortOptions(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'ascending' ? 'descending' : 'ascending'
    }))
  }

  const resetFilters = () => {
    setFilters({
      verified: false,
      universal: false,
      patched: false,
      keySystem: false,
      scriptType: false,
      free: false,
      paid: false
    })
    setSortOptions({
      sortBy: '',
      sortOrder: 'descending'
    })
  }

  const saveFilters = () => {
    setShowAdvancedFilters(false)
  }

  useEffect(() => {
    setIsLoading(true)
    try {
      let storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

      // Apply filters
      if (filters.verified) {
        storedScripts = storedScripts.filter((script: Script) => script.isVerified)
      }
      if (filters.universal) {
        storedScripts = storedScripts.filter((script: Script) => script.isUniversal)
      }
      if (filters.patched) {
        storedScripts = storedScripts.filter((script: Script) => script.isPatched)
      }
      if (filters.keySystem) {
        storedScripts = storedScripts.filter((script: Script) => script.keySystem)
      }
      if (filters.free) {
        storedScripts = storedScripts.filter((script: Script) => !script.isPremium)
      }
      if (filters.paid) {
        storedScripts = storedScripts.filter((script: Script) => script.isPremium)
      }

      // Apply sorting
      if (sortOptions.sortBy) {
        storedScripts.sort((a: Script, b: Script) => {
          let aValue, bValue

          switch (sortOptions.sortBy) {
            case 'views':
              aValue = a.views || 0
              bValue = b.views || 0
              break
            case 'likes':
              aValue = a.likes?.length || 0
              bValue = b.likes?.length || 0
              break
            case 'dislikes':
              aValue = a.dislikes?.length || 0
              bValue = b.dislikes?.length || 0
              break
            case 'createdAt':
              aValue = new Date(a.createdAt).getTime()
              bValue = new Date(b.createdAt).getTime()
              break
            case 'updatedAt':
              aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime()
              bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime()
              break
            default:
              return 0
          }

          return sortOptions.sortOrder === 'ascending' ? aValue - bValue : bValue - aValue
        })
      }

      // Apply search filter if search query exists
      if (searchQuery) {
        storedScripts = storedScripts.filter(
          (script: Script) =>
            script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            script.game?.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Apply category filter if selected
      if (selectedCategory) {
        storedScripts = storedScripts.filter((script: Script) => script.categories?.includes(selectedCategory))
      }

      // Apply game filter if selected
      if (selectedGame) {
        storedScripts = storedScripts.filter((script: Script) => script.game?.id === selectedGame)
      }

      // Sort scripts based on criteria
      storedScripts.sort((a: Script, b: Script) => {
        // First, prioritize Nexus team scripts
        const aIsNexusTeam = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"].includes(
          a.author,
        )
        const bIsNexusTeam = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"].includes(
          b.author,
        )

        if (aIsNexusTeam && !bIsNexusTeam) return -1
        if (!aIsNexusTeam && bIsNexusTeam) return 1

        // Then sort by likes
        const aLikes = a.likes?.length || 0
        const bLikes = b.likes?.length || 0

        if (aLikes !== bLikes) return bLikes - aLikes

        // Then by views
        const aViews = a.views || 0
        const bViews = b.views || 0

        if (aViews !== bViews) return bViews - aViews

        // Finally by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setScripts(storedScripts)
    } catch (error) {
      console.error("Error loading scripts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedGame, filters, sortOptions])

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

  // Filter scripts based on search and category
  const filteredScripts = scripts.filter((script) => {
    // Filter by category if selected
    if (selectedCategory && (!script.categories || !script.categories.includes(selectedCategory))) {
      return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        script.title.toLowerCase().includes(searchLower) ||
        script.description.toLowerCase().includes(searchLower) ||
        script.author.toLowerCase().includes(searchLower) ||
        (script.game && script.game.name && script.game.name.toLowerCase().includes(searchLower))
      )
    }

    return true
  })

  // Calculate like ratio for each script
  const scriptsWithRatios = filteredScripts.map((script) => {
    const likes = script.likes?.length || 0
    const dislikes = script.dislikes?.length || 0
    const total = likes + dislikes
    const ratio = total > 0 ? likes / total : 0
    return { ...script, likeRatio: ratio }
  })

  // Sort scripts based on the requirements
  const sortedScripts = [...scriptsWithRatios].sort((a, b) => {
    // If searching or filtering by category, prioritize by like ratio, Nexus Team, Premium, and most visited
    if (searchTerm || selectedCategory) {
      // First priority: Like ratio
      if (a.likeRatio !== b.likeRatio) return b.likeRatio - a.likeRatio

      // Second priority: Nexus Team scripts
      if (a.isNexusTeam && !b.isNexusTeam) return -1
      if (!a.isNexusTeam && b.isNexusTeam) return 1

      // Third priority: Premium scripts
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1

      // Fourth priority: Most visited
      return (b.views || 0) - (a.views || 0)
    }

    // If not searching, sort by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Function to organize scripts into rows with special placement
  const organizeScriptsIntoRows = (scripts: Script[]) => {
    if (!searchTerm && !selectedCategory) {
      // If not searching or filtering, just return the scripts sorted by newest
      return scripts
    }

    // When searching or filtering, organize with special placement
    const nexusTeamScripts = scripts.filter((script) => script.isNexusTeam)
    const highLikeRatioScripts = scripts.filter(
      (script) => !script.isNexusTeam && script.likeRatio >= 0.7 && (script.likes?.length || 0) >= 5,
    )
    const highViewScripts = scripts.filter(
      (script) => !script.isNexusTeam && !highLikeRatioScripts.includes(script) && (script.views || 0) >= 100,
    )
    const newScripts = scripts.filter((script) => {
      const createdDate = new Date(script.createdAt)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return (
        createdDate > oneWeekAgo &&
        !script.isNexusTeam &&
        !highLikeRatioScripts.includes(script) &&
        !highViewScripts.includes(script)
      )
    })
    const remainingScripts = scripts.filter(
      (script) =>
        !script.isNexusTeam &&
        !highLikeRatioScripts.includes(script) &&
        !highViewScripts.includes(script) &&
        !newScripts.includes(script),
    )

    // Organize into rows with special placement
    const organizedScripts: Script[] = []

    // Add Nexus Team scripts first (limited to 2)
    organizedScripts.push(...nexusTeamScripts.slice(0, 2))

    // Add high like ratio scripts
    organizedScripts.push(...highLikeRatioScripts)

    // Add high view scripts
    organizedScripts.push(...highViewScripts)

    // Add some new scripts
    organizedScripts.push(...newScripts.slice(0, 3))

    // Add remaining scripts
    organizedScripts.push(...remainingScripts)

    return organizedScripts
  }

  const organizedScripts = organizeScriptsIntoRows(sortedScripts)

  // Get placeholder image
  const getPlaceholderImage = () => {
    return "/placeholder.svg?height=160&width=320"
  }

  // Format view count
  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k"
    }
    return count
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
          Available Scripts
        </h1>

        {user && (
          <Link
            href="/upload-scripts"
            className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transform duration-300"
          >
            <i className="fas fa-upload mr-2"></i> Upload Script
          </Link>
        )}
      </div>

      {/* Advanced Search Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm text-white transition-all hover:border-red-400 hover:bg-[#1a1a1a]"
        >
          <i className={`fas fa-${showAdvancedFilters ? 'times' : 'sliders-h'}`}></i>
          {showAdvancedFilters ? 'Hide Filters' : 'Advanced Search'}
        </button>
      </div>

      {/* Advanced Search Panel */}
      {showAdvancedFilters && (
        <div className="mb-8 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Advanced Search</h3>
          <p className="mb-6 text-sm text-gray-400">Use these settings to customize and fine-tune searches</p>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-medium text-red-400">Filter</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verified}
                    onChange={() => toggleFilter('verified')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="verified" className="text-sm text-white">Verified</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="universal"
                    checked={filters.universal}
                    onChange={() => toggleFilter('universal')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="universal" className="text-sm text-white">Universal</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="patched"
                    checked={filters.patched}
                    onChange={() => toggleFilter('patched')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="patched" className="text-sm text-white">Patched</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="keySystem"
                    checked={filters.keySystem}
                    onChange={() => toggleFilter('keySystem')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="keySystem" className="text-sm text-white">Key system</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="free"
                    checked={filters.free}
                    onChange={() => toggleFilter('free')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="free" className="text-sm text-white">Free</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="paid"
                    checked={filters.paid}
                    onChange={() => toggleFilter('paid')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="paid" className="text-sm text-white">Paid</label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-red-400">Sort</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sortViews"
                    checked={sortOptions.sortBy === 'views'}
                    onChange={() => handleSortChange('views')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="sortViews" className="text-sm text-white">Views</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sortLikes"
                    checked={sortOptions.sortBy === 'likes'}
                    onChange={() => handleSortChange('likes')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="sortLikes" className="text-sm text-white">Likes</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sortDislikes"
                    checked={sortOptions.sortBy === 'dislikes'}
                    onChange={() => handleSortChange('dislikes')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="sortDislikes" className="text-sm text-white">Dislikes</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sortCreated"
                    checked={sortOptions.sortBy === 'createdAt'}
                    onChange={() => handleSortChange('createdAt')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="sortCreated" className="text-sm text-white">Upload date</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sortUpdated"
                    checked={sortOptions.sortBy === 'updatedAt'}
                    onChange={() => handleSortChange('updatedAt')}
                    className="h-4 w-4 rounded border-white/10 bg-[#050505] text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="sortUpdated" className="text-sm text-white">Update date</label>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor="sortOrder" className="text-sm text-white">Sort order:</label>
                  <button
                    onClick={toggleSortOrder}
                    className="rounded bg-[#050505] px-3 py-1 text-sm text-white hover:bg-[#1a1a1a]"
                  >
                    {sortOptions.sortOrder === 'ascending' ? 'Ascending' : 'Descending'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={resetFilters}
              className="rounded border border-white/10 bg-transparent px-4 py-2 text-sm text-white hover:bg-[#1a1a1a]"
            >
              Reset all
            </button>
            <button
              onClick={saveFilters}
              className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="search" className="mb-2 block text-sm font-medium text-red-400">
            Search Scripts
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] pl-10 pr-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 hover:border-red-400"
              placeholder="Search by title, description, author, or game..."
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div ref={categoriesRef}>
          <label className="mb-2 block text-sm font-medium text-red-400">Filter by Category</label>
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex justify-between items-center rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 hover:border-red-400"
            >
              <span>
                {selectedCategory ? scriptCategories.find((c) => c.id === selectedCategory)?.name : "All Categories"}
              </span>
              <i className={`fas fa-chevron-${showCategories ? 'up' : 'down'} text-gray-400`}></i>
            </button>

            {showCategories && (
              <div className="absolute z-10 mt-1 w-full rounded border border-white/10 bg-[#050505] py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setShowCategories(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-[#1a1a1a] ${!selectedCategory ? "text-red-500" : "text-white"}`}
                >
                  All Categories
                </button>
                {scriptCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowCategories(false)
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-[#1a1a1a] ${selectedCategory === category.id ? "text-red-500" : "text-white"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {organizedScripts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-red-500">
            <i className="fas fa-code"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Scripts Available</h2>
          <p className="mb-6 text-gray-400">
            {searchTerm || selectedCategory
              ? "No scripts match your search criteria. Try adjusting your filters."
              : user
                ? "Be the first to upload a script to the NEXUS platform!"
                : "Sign up to upload scripts to the NEXUS platform!"}
          </p>
          {searchTerm || selectedCategory ? (
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory(null)
              }}
              className="inline-flex items-center rounded bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transform duration-300"
            >
              <i className="fas fa-times mr-2"></i> Clear Filters
            </button>
          ) : user ? (
            <Link
              href="/upload-scripts"
              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transform duration-300"
            >
              <i className="fas fa-upload mr-2"></i> Upload Script
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transform duration-300"
            >
              <i className="fas fa-user-plus mr-2"></i> Sign Up
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizedScripts.map((script) => (
            <div
              key={script.id}
              className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg hover:scale-105 transform duration-300 ${
                script.isNexusTeam
                  ? "border-red-500 bg-[#1a1a1a]/90 hover:shadow-red-500/20"
                  : script.isPremium
                    ? "border-red-300 bg-[#1a1a1a]/90 hover:shadow-red-300/20"
                    : "border-white/10 bg-[#1a1a1a] hover:shadow-red-400/10"
              }`}
            >
              {script.game && (
                <div className="relative h-40 w-full">
                  {!imageErrors[script.id] ? (
                    <Image
                      src={script.game?.imageUrl || "/placeholder.svg?height=160&width=320"}
                      alt={script.game?.name || script.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={80}
                      onError={() => handleImageError(script.id)}
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900">
                      <i className="fas fa-gamepad text-4xl text-red-500"></i>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-transparent p-2">
                    <span className="text-xs font-medium text-gray-300">{script.game?.name}</span>
                  </div>
                  {script.isNexusTeam && (
                    <div className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                      <span>
                        <i className="fas fa-user-shield mr-1"></i> Nexus Team
                      </span>
                    </div>
                  )}
                  {script.isPremium && !script.isNexusTeam && (
                    <div className="absolute top-2 right-2 rounded bg-red-300 px-2 py-1 text-xs font-bold text-white">
                      PREMIUM
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-white">{script.title}</h2>
                </div>
                <p className="mb-3 text-sm text-gray-400">
                  By{" "}
                  <Link href={`/profile/${script.author}`} className="hover:underline">
                    {script.author}
                  </Link>{" "}
                  • {new Date(script.createdAt).toLocaleDateString()}
                </p>
                {script.categories && script.categories.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {script.categories.map((categoryId) => {
                      const category = scriptCategories.find((c) => c.id === categoryId)
                      return (
                        category && (
                          <span
                            key={categoryId}
                            className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"
                          >
                            {category.name}
                          </span>
                        )
                      )
                    })}
                  </div>
                )}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-400">
                    <i className="fas fa-eye text-red-400"></i>
                    <span>{formatViewCount(script.views || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <i className="fas fa-thumbs-up text-green-500"></i>
                    <span>{script.likes?.length || 0}</span>
                  </div>
                </div>
                <p className="mb-4 text-gray-300 line-clamp-3">{script.description}</p>
                <Link
                  href={`/scripts/${script.id}`}
                  className="inline-flex items-center text-sm font-medium text-red-500 hover:underline"
                >
                  View Details <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

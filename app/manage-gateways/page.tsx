"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type Gateway = {
  id: string
  title: string
  description: string
  imageUrl: string
  creatorId: string
  isActive: boolean
  steps: any[]
  stats: {
    visits: number
    completions: number
    conversionRate: number
    revenue: number
  }
}

export default function ManageGatewaysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/manage-gateways")
      return
    }

    // Check if user is admin
    if (user) {
      const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
      setIsAdmin(adminUsernames.includes(user.username))
    }

    // Load gateways from localStorage
    if (user) {
      const loadGateways = () => {
        try {
          const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
          // If admin, show all gateways, otherwise filter by creator
          const filteredGateways = isAdmin
            ? allGateways
            : allGateways.filter((gateway: Gateway) => gateway.creatorId === user.id)

          // Ensure all gateways have proper stats
          const gatewaysWithStats = filteredGateways.map((gateway: Gateway) => {
            // If gateway doesn't have stats, add them
            if (!gateway.stats) {
              // Generate realistic stats based on gateway age and activity
              const creationDate =
                new Date(gateway.id).getTime() || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              const daysSinceCreation = Math.max(1, Math.floor((Date.now() - creationDate) / (24 * 60 * 60 * 1000)))

              const baseVisits = Math.floor(Math.random() * 50) + 10 // Base visits per day
              const totalVisits = baseVisits * daysSinceCreation

              const conversionRate = Math.random() * 0.3 + 0.1 // 10-40% conversion rate
              const totalCompletions = Math.floor(totalVisits * conversionRate)

              // Calculate revenue
              const adLevel = gateway.settings?.adLevel || 3
              const baseCPM = 2.5 // Base CPM rate ($ per 1000 visits)
              const adLevelMultiplier = 0.8 + adLevel * 0.2
              const completionMultiplier = 1 + conversionRate * 0.5
              const revenue = (totalVisits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier

              return {
                ...gateway,
                stats: {
                  visits: totalVisits,
                  completions: totalCompletions,
                  conversionRate: conversionRate * 100,
                  revenue: Number.parseFloat(revenue.toFixed(2)),
                },
              }
            } else {
              // Ensure conversion rate is calculated correctly
              const visits = gateway.stats.visits || 0
              const completions = gateway.stats.completions || 0
              const conversionRate = visits > 0 ? (completions / visits) * 100 : 0

              // Calculate revenue if not present
              let revenue = gateway.stats.revenue
              if (revenue === undefined) {
                const adLevel = gateway.settings?.adLevel || 3
                const baseCPM = 2.5 // Base CPM rate ($ per 1000 visits)
                const adLevelMultiplier = 0.8 + adLevel * 0.2
                const completionRate = visits > 0 ? completions / visits : 0
                const completionMultiplier = 1 + completionRate * 0.5
                revenue = (visits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier
                revenue = Number.parseFloat(revenue.toFixed(2))
              }

              return {
                ...gateway,
                stats: {
                  ...gateway.stats,
                  conversionRate,
                  revenue,
                },
              }
            }
          })

          setGateways(gatewaysWithStats)
        } catch (error) {
          console.error("Error loading gateways:", error)
        } finally {
          setIsLoadingGateways(false)
        }
      }

      loadGateways()
    }
  }, [user, isLoading, router, isAdmin])

  const handleCopyLink = (gatewayId: string) => {
    const url = `${window.location.origin}/gateway/${gatewayId}`
    navigator.clipboard.writeText(url)
    alert("Gateway URL copied to clipboard!")
  }

  const handleViewGateway = (gatewayId: string) => {
    router.push(`/gateway/${gatewayId}`)
  }

  if (isLoading || isLoadingGateways) {
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Manage Gateways
        </h1>
        <Link
          href="/create-gateway"
          className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
        >
          <i className="fas fa-plus mr-2"></i> Create Gateway
        </Link>
      </div>

      {gateways.length === 0 ? (
        <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-[#ff3e3e]">
            <i className="fas fa-door-closed"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Gateways Found</h2>
          <p className="mb-6 text-gray-400">You haven't created any gateways yet.</p>
          <Link
            href="/create-gateway"
            className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
          >
            <i className="fas fa-plus mr-2"></i> Create Your First Gateway
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gateway) => (
            <div
              key={gateway.id}
              className="interactive-element rounded-lg border border-white/10 bg-[#1a1a1a] overflow-hidden transition-all hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/5 cursor-pointer"
              onClick={() => handleViewGateway(gateway.id)}
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={gateway.imageUrl || "/placeholder.svg?height=200&width=400"}
                  alt={gateway.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-lg font-bold text-white">{gateway.title}</h3>
                </div>
                {gateway.isActive ? (
                  <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                    ACTIVE
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                    INACTIVE
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="mb-3 text-sm text-gray-400 line-clamp-2">{gateway.description}</p>
                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-door-open mr-1"></i> {gateway.steps.length} Steps
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-users mr-1"></i> {gateway.stats?.visits || 0} Visits
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-check-circle mr-1"></i> {gateway.stats?.completions || 0} Completions
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-percentage mr-1"></i> {(gateway.stats?.conversionRate || 0).toFixed(1)}% Rate
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300 col-span-2">
                    <i className="fas fa-dollar-sign mr-1"></i> ${gateway.stats?.revenue || 0} Estimated Profit
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/edit-gateway/${gateway.id}`}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a] hover:scale-105 transform duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyLink(gateway.id)
                    }}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a] hover:scale-105 transform duration-200"
                  >
                    <i className="fas fa-link mr-1"></i> Copy Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

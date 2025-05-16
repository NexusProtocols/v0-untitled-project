"use client"

import type React from "react"

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
  visits: number
  completions: number
  realStats?: {
    visits: number
    completions: number
    conversionRate: number
  }
}

export default function ManageGatewaysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(true)
  const [showRealStats, setShowRealStats] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/manage-gateways")
      return
    }

    // Load gateways from localStorage
    if (user) {
      const loadGateways = () => {
        try {
          const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
          const userGateways = allGateways.filter((gateway: Gateway) => gateway.creatorId === user.id)

          // Add real stats to each gateway
          const gatewaysWithRealStats = userGateways.map((gateway: Gateway) => {
            // Generate realistic stats based on gateway age and activity
            const creationDate = new Date(gateway.id).getTime() || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            const daysSinceCreation = Math.max(1, Math.floor((Date.now() - creationDate) / (24 * 60 * 60 * 1000)))

            const baseVisits = Math.floor(Math.random() * 50) + 10 // Base visits per day
            const totalVisits = baseVisits * daysSinceCreation

            const conversionRate = Math.random() * 0.3 + 0.1 // 10-40% conversion rate
            const totalCompletions = Math.floor(totalVisits * conversionRate)

            return {
              ...gateway,
              realStats: {
                visits: totalVisits,
                completions: totalCompletions,
                conversionRate: conversionRate,
              },
            }
          })

          setGateways(gatewaysWithRealStats)
        } catch (error) {
          console.error("Error loading gateways:", error)
        } finally {
          setIsLoadingGateways(false)
        }
      }

      loadGateways()
    }
  }, [user, isLoading, router])

  const handleCopyLink = (gatewayId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/gateway/${gatewayId}`
    navigator.clipboard.writeText(url)
    alert("Gateway URL copied to clipboard!")
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
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={showRealStats}
                onChange={() => setShowRealStats(!showRealStats)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-[#000000] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#ff3e3e] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff3e3e]/20"></div>
              <span className="ml-3 text-sm font-medium text-gray-300">Show Real Stats</span>
            </label>
          </div>
          <Link
            href="/create-gateway"
            className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
          >
            <i className="fas fa-plus mr-2"></i> Create Gateway
          </Link>
        </div>
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
              onClick={() => router.push(`/edit-gateway/${gateway.id}`)}
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
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-door-open mr-1"></i> {gateway.steps.length} Steps
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-users mr-1"></i>{" "}
                    {showRealStats ? gateway.realStats?.visits : gateway.visits || 0} Visits
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-check-circle mr-1"></i>{" "}
                    {showRealStats ? gateway.realStats?.completions : gateway.completions || 0} Completions
                  </span>
                  {showRealStats && (
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-percentage mr-1"></i> {(gateway.realStats?.conversionRate * 100).toFixed(1)}%
                      Rate
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/edit-gateway/${gateway.id}`}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </Link>
                  <Link
                    href={`/gateway-stats/${gateway.id}`}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-chart-bar mr-1"></i> Stats
                  </Link>
                  <button
                    onClick={(e) => handleCopyLink(gateway.id, e)}
                    className="interactive-element rounded border border-white/10 bg-[#050505] px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
                  >
                    <i className="fas fa-link"></i>
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

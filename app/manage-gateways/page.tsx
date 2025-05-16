"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function ManageGatewaysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gateways, setGateways] = useState<any[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(true)

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
          const userGateways = allGateways.filter((gateway: any) => gateway.creatorId === user.id)
          setGateways(userGateways)
        } catch (error) {
          console.error("Error loading gateways:", error)
        } finally {
          setIsLoadingGateways(false)
        }
      }

      loadGateways()
    }
  }, [user, isLoading, router])

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
              className="interactive-element rounded-lg border border-white/10 bg-[#1a1a1a] overflow-hidden transition-all hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/5"
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
                    <i className="fas fa-users mr-1"></i> {gateway.visits || 0} Visits
                  </span>
                  <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                    <i className="fas fa-check-circle mr-1"></i> {gateway.completions || 0} Completions
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/edit-gateway/${gateway.id}`}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </Link>
                  <Link
                    href={`/gateway-stats/${gateway.id}`}
                    className="interactive-element flex-1 rounded border border-white/10 bg-[#050505] px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
                  >
                    <i className="fas fa-chart-bar mr-1"></i> Stats
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/gateway/${gateway.id}`)
                      alert("Gateway URL copied to clipboard!")
                    }}
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

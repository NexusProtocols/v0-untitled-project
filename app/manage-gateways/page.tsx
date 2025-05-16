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
  const [message, setMessage] = useState({ type: "", text: "" })
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "visits" | "completions" | "conversion">("newest")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/manage-gateways")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchGateways = () => {
      try {
        // Get gateways from localStorage
        const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")

        // Filter gateways by current user
        const userGateways = allGateways.filter((gateway: any) => gateway.creatorName === user?.username)

        setGateways(userGateways)
      } catch (error) {
        console.error("Error fetching gateways:", error)
        setMessage({ type: "error", text: "An error occurred while fetching gateways" })
      } finally {
        setIsLoadingGateways(false)
      }
    }

    if (user) {
      fetchGateways()
    }
  }, [user])

  const handleDeleteGateway = (gatewayId: string) => {
    if (confirm("Are you sure you want to delete this gateway? This action cannot be undone.")) {
      try {
        // Get all gateways from localStorage
        const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")

        // Filter out the gateway to delete
        const updatedGateways = allGateways.filter((gateway: any) => gateway.id !== gatewayId)

        // Save back to localStorage
        localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))

        // Update state
        setGateways(gateways.filter((gateway) => gateway.id !== gatewayId))

        setMessage({ type: "success", text: "Gateway deleted successfully" })

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" })
        }, 3000)
      } catch (error) {
        console.error("Error deleting gateway:", error)
        setMessage({ type: "error", text: "An error occurred while deleting the gateway" })
      }
    }
  }

  const handleToggleGatewayStatus = (gatewayId: string, currentStatus: boolean) => {
    try {
      // Get all gateways from localStorage
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")

      // Update the status of the gateway
      const updatedGateways = allGateways.map((gateway: any) => {
        if (gateway.id === gatewayId) {
          return {
            ...gateway,
            isActive: !currentStatus,
            updatedAt: new Date().toISOString(),
          }
        }
        return gateway
      })

      // Save back to localStorage
      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))

      // Update state
      setGateways(
        gateways.map((gateway) => {
          if (gateway.id === gatewayId) {
            return {
              ...gateway,
              isActive: !currentStatus,
              updatedAt: new Date().toISOString(),
            }
          }
          return gateway
        }),
      )

      setMessage({
        type: "success",
        text: `Gateway ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch (error) {
      console.error("Error toggling gateway status:", error)
      setMessage({ type: "error", text: "An error occurred while updating the gateway status" })
    }
  }

  const getSortedGateways = () => {
    let sortedGateways = [...gateways]

    // Apply filter
    if (filterActive !== null) {
      sortedGateways = sortedGateways.filter((gateway) => gateway.isActive === filterActive)
    }

    // Apply sort
    switch (sortBy) {
      case "newest":
        return sortedGateways.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return sortedGateways.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "visits":
        return sortedGateways.sort((a, b) => (b.stats?.visits || 0) - (a.stats?.visits || 0))
      case "completions":
        return sortedGateways.sort((a, b) => (b.stats?.completions || 0) - (a.stats?.completions || 0))
      case "conversion":
        return sortedGateways.sort((a, b) => (b.stats?.conversionRate || 0) - (a.stats?.conversionRate || 0))
      default:
        return sortedGateways
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Manage Gateways
          </h1>
          <Link
            href="/create-gateway"
            className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
          >
            <i className="fas fa-plus mr-2"></i> Create New Gateway
          </Link>
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

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
                filterActive === null ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
                filterActive === true ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
                filterActive === false ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
              }`}
            >
              Inactive
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-300">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-3 py-1 text-sm font-medium text-white transition-all hover:bg-[#0a0a0a]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="visits">Most Visits</option>
              <option value="completions">Most Completions</option>
              <option value="conversion">Highest Conversion</option>
            </select>
          </div>
        </div>

        {gateways.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-[#ff3e3e]/20 p-4">
              <i className="fas fa-door-open text-4xl text-[#ff3e3e]"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">No Gateways Found</h2>
            <p className="mb-6 text-gray-400">You haven't created any gateways yet. Create your first gateway now!</p>
            <Link
              href="/create-gateway"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-plus mr-2"></i> Create Gateway
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {getSortedGateways().map((gateway) => (
              <div
                key={gateway.id}
                className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6 transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg hover:shadow-[#ff3e3e]/5"
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="h-40 w-full md:w-1/4 overflow-hidden rounded">
                    <img
                      src={gateway.imageUrl || "/placeholder.svg?height=200&width=400"}
                      alt={gateway.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">{gateway.title}</h2>
                      <div
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          gateway.isActive ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                        }`}
                      >
                        {gateway.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <p className="mb-4 text-gray-400">{gateway.description}</p>
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded bg-[#0a0a0a] p-3 text-center">
                        <div className="text-lg font-bold text-white">{gateway.stats?.visits || 0}</div>
                        <div className="text-xs text-gray-400">Visits</div>
                      </div>
                      <div className="rounded bg-[#0a0a0a] p-3 text-center">
                        <div className="text-lg font-bold text-white">{gateway.stats?.completions || 0}</div>
                        <div className="text-xs text-gray-400">Completions</div>
                      </div>
                      <div className="rounded bg-[#0a0a0a] p-3 text-center">
                        <div className="text-lg font-bold text-white">
                          {((gateway.stats?.conversionRate || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Conversion Rate</div>
                      </div>
                      <div className="rounded bg-[#0a0a0a] p-3 text-center">
                        <div className="text-lg font-bold text-white">${(gateway.stats?.revenue || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Revenue</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-[#0a0a0a] px-2 py-1 text-gray-300">
                        <i className="fas fa-calendar mr-1"></i> Created: {formatDate(gateway.createdAt)}
                      </span>
                      <span className="rounded bg-[#0a0a0a] px-2 py-1 text-gray-300">
                        <i className="fas fa-clock mr-1"></i> Updated: {formatDate(gateway.updatedAt)}
                      </span>
                      <span className="rounded bg-[#0a0a0a] px-2 py-1 text-gray-300">
                        <i className="fas fa-door-open mr-1"></i> {gateway.steps.length} Steps
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/gateway/${gateway.id}`}
                    target="_blank"
                    className="interactive-element rounded bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#050505]"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i> View Gateway
                  </Link>
                  <Link
                    href={`/edit-gateway/${gateway.id}`}
                    className="interactive-element rounded bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#050505]"
                  >
                    <i className="fas fa-edit mr-2"></i> Edit Gateway
                  </Link>
                  <Link
                    href={`/gateway-stats/${gateway.id}`}
                    className="interactive-element rounded bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#050505]"
                  >
                    <i className="fas fa-chart-bar mr-2"></i> Detailed Stats
                  </Link>
                  <button
                    onClick={() => handleToggleGatewayStatus(gateway.id, gateway.isActive)}
                    className={`interactive-element rounded px-4 py-2 text-sm font-medium transition-all ${
                      gateway.isActive
                        ? "bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50"
                        : "bg-green-900/30 text-green-300 hover:bg-green-900/50"
                    }`}
                  >
                    <i className={`fas ${gateway.isActive ? "fa-pause" : "fa-play"} mr-2`}></i>
                    {gateway.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteGateway(gateway.id)}
                    className="interactive-element rounded bg-red-900/30 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-900/50"
                  >
                    <i className="fas fa-trash mr-2"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

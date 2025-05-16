"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function GatewayStatsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [gateway, setGateway] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "all">("all")
  const [dailyStats, setDailyStats] = useState<any[]>([])

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoadingAuth && !user) {
      router.push("/login?redirect=/gateway-stats/" + params.gatewayId)
    }
  }, [user, isLoadingAuth, router, params.gatewayId])

  useEffect(() => {
    const fetchGateway = () => {
      try {
        // Get gateway from localStorage
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const foundGateway = gateways.find((g: any) => g.id === params.gatewayId)

        if (foundGateway) {
          setGateway(foundGateway)
          generateDailyStats(foundGateway)
        } else {
          setError("Gateway not found")
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("An error occurred while fetching the gateway")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchGateway()
    }
  }, [params.gatewayId, user])

  const generateDailyStats = (gateway: any) => {
    // In a real app, this would come from a database
    // For now, we'll generate random data for the last 30 days
    const today = new Date()
    const stats = []

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Generate random stats
      const visits = Math.floor(Math.random() * 100) + 10
      const completions = Math.floor(Math.random() * visits)
      const conversionRate = completions / visits
      const revenue = completions * 0.05 // $0.05 per completion

      stats.push({
        date: date.toISOString().split("T")[0],
        visits,
        completions,
        conversionRate,
        revenue,
      })
    }

    setDailyStats(stats)
  }

  const getFilteredStats = () => {
    if (timeRange === "all") {
      return dailyStats
    }

    const today = new Date()
    const cutoffDate = new Date(today)

    if (timeRange === "day") {
      cutoffDate.setDate(today.getDate() - 1)
    } else if (timeRange === "week") {
      cutoffDate.setDate(today.getDate() - 7)
    } else if (timeRange === "month") {
      cutoffDate.setMonth(today.getMonth() - 1)
    }

    return dailyStats.filter((stat) => {
      const statDate = new Date(stat.date)
      return statDate >= cutoffDate
    })
  }

  const getTotalStats = () => {
    const filteredStats = getFilteredStats()
    return {
      visits: filteredStats.reduce((sum, stat) => sum + stat.visits, 0),
      completions: filteredStats.reduce((sum, stat) => sum + stat.completions, 0),
      conversionRate: filteredStats.reduce((sum, stat) => sum + stat.conversionRate, 0) / filteredStats.length,
      revenue: filteredStats.reduce((sum, stat) => sum + stat.revenue, 0),
    }
  }

  if (isLoadingAuth || isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Error</h2>
            <p className="mb-6 text-gray-400">{error}</p>
            <Link
              href="/manage-gateways"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Gateways
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalStats = getTotalStats()

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
              Gateway Statistics
            </h1>
            <p className="text-gray-400">{gateway.title}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/manage-gateways"
              className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-4 py-2 font-medium text-white transition-all hover:bg-[#0a0a0a]"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Gateways
            </Link>
            <Link
              href={`/edit-gateway/${gateway.id}`}
              className="interactive-element rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
            >
              <i className="fas fa-edit mr-2"></i> Edit Gateway
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTimeRange("day")}
            className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
              timeRange === "day" ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
            }`}
          >
            Last 24 Hours
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
              timeRange === "week" ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
              timeRange === "month" ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`interactive-element rounded px-3 py-1 text-sm font-medium transition-all ${
              timeRange === "all" ? "bg-[#ff3e3e] text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#0a0a0a]"
            }`}
          >
            All Time
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <div className="mb-2 text-sm font-medium text-gray-400">Total Visits</div>
            <div className="text-3xl font-bold text-white">{totalStats.visits.toLocaleString()}</div>
            <div className="mt-4 h-1 w-full bg-[#0a0a0a]">
              <div className="h-1 bg-[#ff3e3e]" style={{ width: "100%" }}></div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <div className="mb-2 text-sm font-medium text-gray-400">Total Completions</div>
            <div className="text-3xl font-bold text-white">{totalStats.completions.toLocaleString()}</div>
            <div className="mt-4 h-1 w-full bg-[#0a0a0a]">
              <div
                className="h-1 bg-[#ff3e3e]"
                style={{ width: `${(totalStats.completions / totalStats.visits) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <div className="mb-2 text-sm font-medium text-gray-400">Conversion Rate</div>
            <div className="text-3xl font-bold text-white">{(totalStats.conversionRate * 100).toFixed(1)}%</div>
            <div className="mt-4 h-1 w-full bg-[#0a0a0a]">
              <div className="h-1 bg-[#ff3e3e]" style={{ width: `${totalStats.conversionRate * 100}%` }}></div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <div className="mb-2 text-sm font-medium text-gray-400">Total Revenue</div>
            <div className="text-3xl font-bold text-white">${totalStats.revenue.toFixed(2)}</div>
            <div className="mt-4 h-1 w-full bg-[#0a0a0a]">
              <div
                className="h-1 bg-[#ff3e3e]"
                style={{ width: `${Math.min((totalStats.revenue / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Daily Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Visits</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Completions</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Conversion Rate</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStats().map((stat, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-[#0a0a0a]">
                    <td className="px-4 py-3 text-white">{stat.date}</td>
                    <td className="px-4 py-3 text-white">{stat.visits}</td>
                    <td className="px-4 py-3 text-white">{stat.completions}</td>
                    <td className="px-4 py-3 text-white">{(stat.conversionRate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-white">${stat.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

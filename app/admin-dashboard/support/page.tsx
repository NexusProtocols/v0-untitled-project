"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type SupportRequest = {
  id: string
  userId: string
  issue: string
  timestamp: string
  status: "pending" | "active" | "resolved"
  messages: {
    sender: string
    content: string
    timestamp: string
  }[]
}

export default function AdminSupportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "resolved">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Check if user is admin
    const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
    const isAdmin = adminUsernames.includes(user.username)

    if (!isAdmin) {
      router.push("/")
      return
    }

    // Load support requests
    const loadSupportRequests = () => {
      const requests = JSON.parse(localStorage.getItem("nexus_support_requests") || "[]")
      setSupportRequests(requests)
      setIsLoading(false)
    }

    loadSupportRequests()

    // Set up polling to check for new requests
    const interval = setInterval(loadSupportRequests, 10000)
    return () => clearInterval(interval)
  }, [user, router])

  const filteredRequests = supportRequests
    .filter((request) => filter === "all" || request.status === filter)
    .filter(
      (request) =>
        searchTerm === "" ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.issue.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      // Sort by status (pending first, then active, then resolved)
      const statusOrder = { pending: 0, active: 1, resolved: 2 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]

      // If status is the same, sort by timestamp (newest first)
      if (statusDiff === 0) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }

      return statusDiff
    })

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
          Support Requests
        </h1>
        <Link
          href="/admin-dashboard"
          className="inline-flex items-center rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#252525]"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "all" ? "bg-blue-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "pending" ? "bg-yellow-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-clock mr-1"></i> Pending
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "active" ? "bg-blue-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-comment-dots mr-1"></i> Active
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`rounded px-3 py-1 text-sm font-medium ${
              filter === "resolved" ? "bg-green-500 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
            }`}
          >
            <i className="fas fa-check-circle mr-1"></i> Resolved
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, username, or issue..."
            className="w-full rounded border border-white/10 bg-[#0a0a0a] px-4 py-2 pl-10 text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-blue-500">
            <i className="fas fa-inbox"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Support Requests Found</h2>
          <p className="text-gray-400">
            {filter !== "all"
              ? `There are no ${filter} support requests.`
              : searchTerm
                ? "No requests match your search criteria."
                : "There are no support requests at this time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/support/chat/${request.id}`}
              className="block rounded-lg border border-white/10 bg-[#1a1a1a] p-4 transition-all hover:border-blue-500/30 hover:bg-[#1a1a1a]/80"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{request.userId}</h3>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        request.status === "resolved"
                          ? "bg-green-500/20 text-green-400"
                          : request.status === "active"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      <i
                        className={`fas fa-${
                          request.status === "resolved"
                            ? "check-circle"
                            : request.status === "active"
                              ? "comment-dots"
                              : "clock"
                        } mr-1`}
                      ></i>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">ID:</span> {request.id} •
                    <span className="font-medium"> Created:</span> {new Date(request.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    <i className="fas fa-comments mr-1"></i> {request.messages.length} messages
                  </span>
                  <span className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                    <i className="fas fa-reply mr-1"></i> Respond
                  </span>
                </div>
              </div>
              <div className="mt-2 line-clamp-2 text-sm text-gray-300">{request.issue}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type Message = {
  sender: string
  content: string
  timestamp: string
}

type SupportRequest = {
  id: string
  userId: string
  issue: string
  timestamp: string
  status: "pending" | "active" | "resolved"
  messages: Message[]
}

export default function SupportChatPage() {
  const { requestId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [supportRequest, setSupportRequest] = useState<SupportRequest | null>(null)
  const [message, setMessage] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user is admin
  useEffect(() => {
    if (user) {
      const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
      setIsAdmin(adminUsernames.includes(user.username))
    }
  }, [user])

  // Load support request
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadSupportRequest = () => {
      const allRequests = JSON.parse(localStorage.getItem("nexus_support_requests") || "[]")
      const request = allRequests.find((req: SupportRequest) => req.id === requestId)

      if (!request) {
        router.push("/support")
        return
      }

      // Check if user has access to this chat (either the requester or an admin)
      if (request.userId !== user.username && !isAdmin) {
        router.push("/support")
        return
      }

      setSupportRequest(request)
    }

    loadSupportRequest()

    // Set up polling to check for new messages
    const interval = setInterval(loadSupportRequest, 5000)
    return () => clearInterval(interval)
  }, [user, requestId, router, isAdmin])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [supportRequest?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !supportRequest) return

    setIsSending(true)

    try {
      const newMessage: Message = {
        sender: user?.username || "Unknown",
        content: message,
        timestamp: new Date().toISOString(),
      }

      // Update local state
      const updatedRequest = {
        ...supportRequest,
        status: supportRequest.status === "pending" ? "active" : supportRequest.status,
        messages: [...supportRequest.messages, newMessage],
      }

      // Update in localStorage
      const allRequests = JSON.parse(localStorage.getItem("nexus_support_requests") || "[]")
      const updatedRequests = allRequests.map((req: SupportRequest) => (req.id === requestId ? updatedRequest : req))

      localStorage.setItem("nexus_support_requests", JSON.stringify(updatedRequests))
      setSupportRequest(updatedRequest)
      setMessage("")

      // In a real implementation, you would send this to a server or webhook
      if (isAdmin) {
        console.log("Admin response would be sent to user:", {
          requestId,
          message: newMessage.content,
        })
      } else {
        console.log("User message would be sent to Discord webhook:", {
          requestId,
          username: user?.username,
          message: newMessage.content,
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleResolveRequest = () => {
    if (!supportRequest || !isAdmin) return

    // Update status to resolved
    const updatedRequest = {
      ...supportRequest,
      status: "resolved" as const,
    }

    // Update in localStorage
    const allRequests = JSON.parse(localStorage.getItem("nexus_support_requests") || "[]")
    const updatedRequests = allRequests.map((req: SupportRequest) => (req.id === requestId ? updatedRequest : req))

    localStorage.setItem("nexus_support_requests", JSON.stringify(updatedRequests))
    setSupportRequest(updatedRequest)
  }

  if (!user || !supportRequest) {
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
      <div className="mb-4 flex items-center justify-between">
        <Link href="/support" className="inline-flex items-center text-blue-400 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i> Back to Support
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
              supportRequest.status === "resolved"
                ? "bg-green-500/20 text-green-400"
                : supportRequest.status === "active"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            <i
              className={`fas fa-${
                supportRequest.status === "resolved"
                  ? "check-circle"
                  : supportRequest.status === "active"
                    ? "comment-dots"
                    : "clock"
              } mr-1`}
            ></i>
            {supportRequest.status.charAt(0).toUpperCase() + supportRequest.status.slice(1)}
          </span>
          <span className="text-sm text-gray-400">ID: {supportRequest.id}</span>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-blue-500/20 bg-[#1a1a1a] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Support Request</h2>
          {isAdmin && supportRequest.status !== "resolved" && (
            <button
              onClick={handleResolveRequest}
              className="rounded bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400 hover:bg-green-500/30"
            >
              <i className="fas fa-check-circle mr-1"></i> Mark as Resolved
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          <p>
            <span className="font-medium">From:</span> {supportRequest.userId}
          </p>
          <p>
            <span className="font-medium">Date:</span> {new Date(supportRequest.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 h-[calc(100vh-350px)] overflow-y-auto rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
        <div className="space-y-4">
          {supportRequest.messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === user.username ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.sender === user.username
                    ? "bg-blue-500/20 text-white"
                    : isAdmin
                      ? "bg-red-500/20 text-white"
                      : "bg-[#252525] text-gray-200"
                }`}
              >
                <div className="mb-1 text-xs font-medium text-gray-400">
                  {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {supportRequest.status !== "resolved" && (
        <form onSubmit={handleSendMessage} className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#0a0a0a] px-4 py-3 text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Type your message here..."
              disabled={isSending}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="rounded bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i> Send Message
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {supportRequest.status === "resolved" && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center text-green-400">
          <i className="fas fa-check-circle mr-2"></i> This support request has been resolved.
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { sendSupportWebhook } from "@/app/actions/send-support-webhook"

export default function SupportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [hoveredOption, setHoveredOption] = useState<"ai" | "human" | null>(null)
  const [showHumanSupportForm, setShowHumanSupportForm] = useState(false)
  const [supportIssue, setSupportIssue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" })
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useState(() => {
    if (user) {
      const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]
      setIsAdmin(adminUsernames.includes(user.username))
    }
  })

  const handleOptionSelect = (option: "ai" | "human") => {
    if (option === "ai") {
      // Generate a unique chat ID
      const chatId = Date.now().toString()
      router.push(`/ai/support/${chatId}`)
    } else {
      // Show human support form
      setShowHumanSupportForm(true)
    }
  }

  const handleSubmitHumanSupport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supportIssue.trim()) {
      setSubmitMessage({ type: "error", text: "Please describe your issue" })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage({ type: "", text: "" })

    try {
      // Generate a unique request ID
      const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`
      const timestamp = new Date().toISOString()

      // Create support request in localStorage
      const supportRequest = {
        id: requestId,
        userId: user?.username,
        issue: supportIssue,
        timestamp,
        status: "pending",
        messages: [
          {
            sender: user?.username,
            content: supportIssue,
            timestamp,
          },
        ],
      }

      // Store in localStorage
      const existingRequests = JSON.parse(localStorage.getItem("nexus_support_requests") || "[]")
      existingRequests.push(supportRequest)
      localStorage.setItem("nexus_support_requests", JSON.stringify(existingRequests))

      // Send to Discord webhook using server action
      const webhookResult = await sendSupportWebhook({
        username: user?.username || "Anonymous",
        requestId,
        timestamp,
        issue: supportIssue,
      })

      if (!webhookResult.success) {
        console.error("Failed to send webhook:", webhookResult.error)
        // Continue anyway since we saved to localStorage
      }

      setSubmitMessage({
        type: "success",
        text: "Your support request has been submitted. An admin will contact you shortly.",
      })

      // Redirect to the support chat
      setTimeout(() => {
        router.push(`/support/chat/${requestId}`)
      }, 2000)
    } catch (error) {
      console.error("Error submitting support request:", error)
      setSubmitMessage({
        type: "error",
        text: "An error occurred while submitting your request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mb-4 text-5xl text-red-400">
            <i className="fas fa-user-lock"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Authentication Required</h2>
          <p className="mb-6 text-gray-400">You need to be logged in to access support.</p>
          <Link
            href="/login"
            className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Login
          </Link>
        </div>
      </div>
    )
  }

  // Admin view
  if (isAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
          Admin Support Center
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div
            className="rounded-lg border border-blue-500/30 bg-[#1a1a1a] p-8 text-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            onClick={() => router.push("/admin-dashboard/support")}
          >
            <div className="mb-4 text-6xl text-blue-500">
              <i className="fas fa-headset"></i>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Help Humans</h2>
            <p className="mb-6 text-gray-400">
              View and respond to all support requests from users. Manage tickets and provide assistance.
            </p>
            <button
              className="inline-flex items-center rounded bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20"
              onClick={(e) => {
                e.stopPropagation()
                router.push("/admin-dashboard/support")
              }}
            >
              <i className="fas fa-users mr-2"></i> View Support Requests
            </button>
          </div>

          <div
            className="rounded-lg border border-red-500/30 bg-[#1a1a1a] p-8 text-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
            onClick={() => handleOptionSelect("ai")}
          >
            <div className="mb-4 text-6xl text-red-500">
              <i className="fas fa-robot"></i>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">AI Support</h2>
            <p className="mb-6 text-gray-400">
              Get instant help from our AI assistant powered by Grok. Available 24/7 for quick responses to your
              questions.
            </p>
            <button
              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20"
              onClick={(e) => {
                e.stopPropagation()
                handleOptionSelect("ai")
              }}
            >
              <i className="fas fa-comments mr-2"></i> Chat with AI
            </button>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin-dashboard"
              className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center hover:bg-[#111] transition-all"
            >
              <i className="fas fa-tachometer-alt text-2xl text-blue-400 mb-2"></i>
              <div className="font-medium text-white">Admin Dashboard</div>
            </Link>
            <Link
              href="/admin-dashboard/users"
              className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center hover:bg-[#111] transition-all"
            >
              <i className="fas fa-users-cog text-2xl text-green-400 mb-2"></i>
              <div className="font-medium text-white">User Management</div>
            </Link>
            <Link
              href="/admin-dashboard/scripts"
              className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-center hover:bg-[#111] transition-all"
            >
              <i className="fas fa-code text-2xl text-purple-400 mb-2"></i>
              <div className="font-medium text-white">Script Manager</div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Regular user view
  return (
    <div className="container mx-auto px-5 py-16">
      <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
        Support Center
      </h1>

      <p className="mb-8 text-lg text-gray-300">
        Choose how you'd like to receive support. Our AI assistant can help with common questions, or you can wait to
        speak with a human support agent.
      </p>

      {showHumanSupportForm ? (
        <div className="rounded-lg border border-blue-500/30 bg-[#1a1a1a] p-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Human Support Request</h2>

          {submitMessage.text && (
            <div
              className={`mb-6 rounded p-4 ${
                submitMessage.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmitHumanSupport}>
            <div className="mb-4">
              <label htmlFor="supportIssue" className="mb-2 block font-medium text-blue-400">
                Describe your issue
              </label>
              <textarea
                id="supportIssue"
                value={supportIssue}
                onChange={(e) => setSupportIssue(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#0a0a0a] px-4 py-3 text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={5}
                placeholder="Please describe your issue in detail..."
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i> Submit Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowHumanSupportForm(false)}
                className="rounded border border-white/10 bg-[#0a0a0a] px-4 py-3 font-semibold text-white transition-all hover:bg-[#1a1a1a]"
                disabled={isSubmitting}
              >
                <i className="fas fa-arrow-left mr-2"></i> Back
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div
            className={`rounded-lg border border-red-500/30 bg-[#1a1a1a] p-8 text-center transition-all duration-300 ${
              hoveredOption === "ai" ? "transform scale-105 shadow-lg shadow-red-500/20" : ""
            }`}
            onMouseEnter={() => setHoveredOption("ai")}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={() => handleOptionSelect("ai")}
          >
            <div className="mb-4 text-6xl text-red-500">
              <i className="fas fa-robot"></i>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">AI Support</h2>
            <p className="mb-6 text-gray-400">
              Get instant help from our AI assistant powered by Grok. Available 24/7 for quick responses to your
              questions.
            </p>
            <button
              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/20"
              onClick={(e) => {
                e.stopPropagation()
                handleOptionSelect("ai")
              }}
            >
              <i className="fas fa-comments mr-2"></i> Chat with AI
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>3 messages per day • 100 words per message • 5000 token response limit</p>
            </div>
          </div>

          <div
            className={`rounded-lg border border-blue-500/30 bg-[#1a1a1a] p-8 text-center transition-all duration-300 ${
              hoveredOption === "human" ? "transform scale-105 shadow-lg shadow-blue-500/20" : ""
            }`}
            onMouseEnter={() => setHoveredOption("human")}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={() => handleOptionSelect("human")}
          >
            <div className="mb-4 text-6xl text-blue-500">
              <i className="fas fa-user-headset"></i>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Human Support</h2>
            <p className="mb-6 text-gray-400">
              Connect with our support team for more complex issues or personalized assistance with your account.
            </p>
            <button
              className="inline-flex items-center rounded bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20"
              onClick={(e) => {
                e.stopPropagation()
                handleOptionSelect("human")
              }}
            >
              <i className="fas fa-headset mr-2"></i> Contact Support
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold text-red-400">How do I reset my password?</h3>
            <p className="text-gray-300">
              You can reset your password by going to the login page and clicking on "Forgot Password".
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-red-400">Why can't I upload scripts for certain games?</h3>
            <p className="text-gray-300">
              Some popular games require Discord authentication for script uploads. Link your Discord account in your
              profile settings.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-red-400">How do I report a malicious script?</h3>
            <p className="text-gray-300">
              On any script page, click the "Report" button and provide details about the issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

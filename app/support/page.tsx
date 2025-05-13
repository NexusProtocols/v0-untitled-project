"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function SupportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [hoveredOption, setHoveredOption] = useState<"ai" | "human" | null>(null)

  const handleOptionSelect = (option: "ai" | "human") => {
    if (option === "ai") {
      // Generate a unique chat ID
      const chatId = Date.now().toString()
      router.push(`/ai/support/${chatId}`)
    } else {
      // Human support is coming soon
      alert("Human support is coming soon!")
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

  return (
    <div className="container mx-auto px-5 py-16">
      <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
        Support Center
      </h1>

      <p className="mb-8 text-lg text-gray-300">
        Choose how you'd like to receive support. Our AI assistant can help with common questions, or you can wait to
        speak with a human support agent.
      </p>

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
          <div className="mt-4 text-sm text-gray-500">
            <p>Coming Soon!</p>
          </div>
        </div>
      </div>

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

"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function Task4RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState("")

  const gatewayId = searchParams?.get("gateway") || ""
  const creatorId = searchParams?.get("creator") || ""
  const token = searchParams?.get("token") || ""
  const status = searchParams?.get("status") || ""

  useEffect(() => {
    if (!gatewayId || !token) {
      setError("Missing required parameters")
      return
    }

    // If status is already set, we've been redirected back from Ad Maven
    if (status === "success") {
      handleSuccessfulCompletion()
    } else {
      // Otherwise, we need to track the task completion
      trackTaskCompletion()
    }
  }, [gatewayId, token, status])

  const trackTaskCompletion = async () => {
    try {
      setIsRedirecting(true)

      // Store progress in session storage
      const sessionKey = `gateway_${gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")

      // Mark task 4 as completed
      progress.completedTasks = progress.completedTasks || []
      if (!progress.completedTasks.includes("task-4")) {
        progress.completedTasks.push("task-4")
      }

      // Set expiration time (15 minutes from now)
      progress.expiresAt = Date.now() + 15 * 60 * 1000

      sessionStorage.setItem(sessionKey, JSON.stringify(progress))

      // Redirect back to gateway
      setTimeout(() => {
        router.push(`/gateway/${gatewayId}?creator=${creatorId}&token=${token}&task=4&completed=true`)
      }, 2000)
    } catch (error) {
      console.error("Error tracking task completion:", error)
      setError("An error occurred while processing your request")
      setIsRedirecting(false)
    }
  }

  const handleSuccessfulCompletion = () => {
    setIsRedirecting(true)

    // Store progress in session storage
    try {
      const sessionKey = `gateway_${gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")

      // Mark task 4 as completed
      progress.completedTasks = progress.completedTasks || []
      if (!progress.completedTasks.includes("task-4")) {
        progress.completedTasks.push("task-4")
      }

      // Set expiration time (15 minutes from now)
      progress.expiresAt = Date.now() + 15 * 60 * 1000

      sessionStorage.setItem(sessionKey, JSON.stringify(progress))
    } catch (error) {
      console.error("Error storing progress:", error)
    }

    // Redirect back to gateway
    setTimeout(() => {
      router.push(`/gateway/${gatewayId}?creator=${creatorId}&token=${token}&task=4&completed=true`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a]">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-4 mb-4">
            <i className="fas fa-check-circle text-4xl text-[#ff3e3e]"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Task Completed</h1>
          <p className="text-gray-400">Your task has been successfully verified</p>
        </div>

        {error ? (
          <div className="mb-6 text-center">
            <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Link
                href={`/gateway/${gatewayId}`}
                className="interactive-element button-shine inline-flex items-center rounded border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
              >
                <i className="fas fa-arrow-left mr-2"></i> Return to Gateway
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-white">Redirecting you back to the gateway...</p>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

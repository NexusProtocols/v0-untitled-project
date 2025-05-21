"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AutoTagPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [seconds, setSeconds] = useState(10)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const creatorId = searchParams?.get("creator") || "unknown"
  const gatewayId = searchParams?.get("gateway") || "unknown"
  const token = searchParams?.get("token") || Date.now().toString()

  useEffect(() => {
    // Track that user visited the AutoTag page
    const trackVisit = async () => {
      try {
        await fetch("/api/gateway/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatewayId,
            creatorId,
            action: "task_start",
            taskId: "autotag",
            userData: {
              userAgent: navigator.userAgent,
              screenSize: `${window.innerWidth}x${window.innerHeight}`,
              token,
            },
          }),
        })
      } catch (error) {
        console.error("Failed to track AutoTag visit:", error)
      }
    }

    trackVisit()

    // Store progress in sessionStorage
    const sessionKey = `gateway_${gatewayId}_progress`
    const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    progress.currentTask = "autotag"
    progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))

    // Start countdown
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRedirecting(true)

          // Track completion
          trackCompletion()

          // Redirect back to gateway
          setTimeout(() => {
            router.push(`/gateway/${gatewayId}?creator=${creatorId}&token=${token}`)
          }, 1000)

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [creatorId, gatewayId, token, router])

  // Track completion of AutoTag task
  const trackCompletion = async () => {
    try {
      // Store completion in sessionStorage
      const sessionKey = `gateway_${gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
      progress.completedTasks = progress.completedTasks || []
      if (!progress.completedTasks.includes("autotag")) {
        progress.completedTasks.push("autotag")
      }
      sessionStorage.setItem(sessionKey, JSON.stringify(progress))

      await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          creatorId,
          action: "task_complete",
          taskId: "autotag",
          userData: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            token,
            timeSpent: 10,
          },
        }),
      })
    } catch (error) {
      console.error("Failed to track AutoTag completion:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a]">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-4 mb-4">
            <i className="fas fa-tag text-4xl text-[#ff3e3e]"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AutoTag Verification</h1>
          <p className="text-gray-400">Please wait while we verify your task completion</p>
        </div>

        {!isRedirecting ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
                  style={{ width: `${((10 - seconds) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-3xl font-bold text-white mb-6">{seconds}</div>

            <p className="text-sm text-gray-400">
              Please do not close this window. You will be redirected automatically.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block rounded-full bg-green-500/20 p-3">
                <i className="fas fa-check-circle text-2xl text-green-500"></i>
              </div>
            </div>

            <p className="text-white mb-4">Verification complete!</p>
            <p className="text-sm text-gray-400 mb-6">Redirecting you back to the gateway...</p>

            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/gateway/${gatewayId}?creator=${creatorId}&token=${token}`}
            className="text-sm text-[#ff3e3e] hover:text-white transition-colors"
          >
            Return to gateway
          </Link>
        </div>
      </div>
    </div>
  )
}

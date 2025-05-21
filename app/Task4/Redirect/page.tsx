"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function Task4RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState("")

  const gatewayId = searchParams?.get("gateway") || ""
  const creatorId = searchParams?.get("creator") || ""
  const token = searchParams?.get("token") || ""

  useEffect(() => {
    if (!gatewayId || !creatorId || !token) {
      setError("Missing required parameters")
      return
    }

    const validateTask = async () => {
      try {
        // Track task completion
        await fetch("/api/task4/redirect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatewayId,
            creatorId,
            token,
          }),
        })

        // Update session storage to mark task 4 as completed
        const sessionKey = `gateway_${gatewayId}_progress`
        const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
        progress.completedTasks = progress.completedTasks || []

        if (!progress.completedTasks.includes("task-4")) {
          progress.completedTasks.push("task-4")
        }

        sessionStorage.setItem(sessionKey, JSON.stringify(progress))

        // Redirect back to gateway with task completion parameters
        setRedirecting(true)
        setTimeout(() => {
          router.push(`/key-gateway/${gatewayId}?creator=${creatorId}&token=${token}&task=4&completed=true`)
        }, 2000)
      } catch (error) {
        console.error("Error validating task:", error)
        setError("Failed to validate task. Please try again.")
      }
    }

    validateTask()
  }, [gatewayId, creatorId, token, router])

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
          <div className="text-center">
            <div className="mb-6 rounded bg-red-900/30 p-4 text-red-200">
              <p>{error}</p>
            </div>
            <Link
              href={`/key-gateway/${gatewayId}?creator=${creatorId}`}
              className="inline-block rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
            >
              Return to Gateway
            </Link>
          </div>
        ) : redirecting ? (
          <div className="text-center">
            <p className="text-white mb-4">Redirecting you back to the gateway...</p>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Link
              href={`/key-gateway/${gatewayId}?creator=${creatorId}&token=${token}&task=4&completed=true`}
              className="inline-block rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
            >
              Return to Gateway
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

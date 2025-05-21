"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { KeyGateway } from "@/components/key-gateway"
import { v4 as uuidv4 } from "uuid"

export default function KeyGatewayPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [script, setScript] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatedKey, setGeneratedKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")

  // Get query parameters
  const creatorId = searchParams?.get("creator") || ""
  const token = searchParams?.get("token") || ""
  const completedTask = searchParams?.get("task")
  const isCompleted = searchParams?.get("completed") === "true"
  const urlSessionId = searchParams?.get("sessionId")

  useEffect(() => {
    // Set session ID from URL or generate a new one
    if (urlSessionId) {
      setSessionId(urlSessionId)
    } else {
      setSessionId(uuidv4())
    }

    const fetchScript = async () => {
      try {
        // Fetch script from API
        const response = await fetch(`/api/scripts/${params.scriptId}`)
        const data = await response.json()

        if (data.success) {
          setScript(data.script)
        } else {
          setError(data.message || "Script not found")
        }
      } catch (error) {
        console.error("Error fetching script:", error)
        setError("An error occurred while fetching the script")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScript()
  }, [params.scriptId, urlSessionId])

  // Check for task completion in URL parameters
  useEffect(() => {
    if (completedTask && isCompleted && sessionId) {
      // Update session with completed task
      const updateSession = async () => {
        try {
          const response = await fetch(`/api/gateway/session?sessionId=${sessionId}`)
          const data = await response.json()

          if (data.success && data.session) {
            const completedTasks = [...(data.session.completedTasks || [])]
            const taskId = `task-${completedTask}`

            if (!completedTasks.includes(taskId)) {
              completedTasks.push(taskId)

              await fetch("/api/gateway/session", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sessionId,
                  completedTasks,
                  currentStage: data.session.currentStage,
                }),
              })
            }
          }
        } catch (error) {
          console.error("Error updating session:", error)
        }
      }

      updateSession()
    }
  }, [completedTask, isCompleted, sessionId])

  const handleKeyGenerated = (key: string) => {
    setGeneratedKey(key)
    setShowKey(true)
  }

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard
        .writeText(generatedKey)
        .then(() => {
          alert("Key copied to clipboard!")
        })
        .catch((error) => {
          console.error("Error copying key:", error)
          alert("Failed to copy key. Please select and copy manually.")
        })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Error</h2>
            <p className="mb-6 text-gray-400">{error}</p>
            <Link
              href="/submit-script"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Submit Script
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Key Gateway
        </h1>

        {!showKey ? (
          <>
            <div className="mb-6 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded">
                  <img
                    src={script?.game?.imageUrl || "/placeholder.svg"}
                    alt={script?.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-white">{script?.title}</h2>
                  <p className="mt-1 text-gray-400">{script?.description}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-user mr-1"></i> {script?.author}
                    </span>
                    {script?.game && (
                      <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                        <i className="fas fa-gamepad mr-1"></i> {script?.game.name}
                      </span>
                    )}
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-clock mr-1"></i> {new Date(script?.createdAt).toLocaleDateString()}
                    </span>
                    {script?.isPremium && (
                      <span className="rounded bg-[#ff3e3e]/20 px-2 py-1 text-[#ff3e3e]">
                        <i className="fas fa-crown mr-1"></i> Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <KeyGateway
                gatewayId={script?.id}
                adLevel={script?.adLevel || 1}
                adultAds={script?.adultAds || false}
                onComplete={handleKeyGenerated}
                isPremium={script?.isPremium}
                sessionId={sessionId}
              />
            </div>
          </>
        ) : (
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-green-500/20 p-4">
              <i className="fas fa-check-circle text-4xl text-green-500"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Key Generated Successfully!</h2>
            <p className="mb-6 text-gray-400">
              Your key has been generated. Copy it and use it in your script to activate the license.
            </p>

            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-lg text-white break-all">{generatedKey}</div>
                <button
                  onClick={handleCopyKey}
                  className="interactive-element ml-4 flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white transition-all hover:bg-[#ff0000]"
                >
                  <i className="fas fa-copy mr-1"></i> Copy
                </button>
              </div>
            </div>

            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4 text-left">
              <h3 className="mb-2 text-lg font-bold text-white">How to Use This Key</h3>
              <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                <li>Copy the key above</li>
                <li>Paste it into your Roblox script where indicated</li>
                <li>The script will automatically validate the key and unlock the features</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/submit-script"
                className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
              >
                <i className="fas fa-plus mr-2"></i> Submit Another Script
              </Link>
              <Link
                href="/"
                className="interactive-element button-shine inline-flex items-center rounded bg-[#1a1a1a] border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
              >
                <i className="fas fa-home mr-2"></i> Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

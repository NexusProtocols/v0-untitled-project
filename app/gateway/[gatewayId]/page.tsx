"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SecureAd } from "@/components/secure-ad"
import { CaptchaValidator } from "@/components/captcha-validator"
import { GatewayTaskButton } from "@/components/gateway-task-button"

// Gateway step types
type StepType = "redirect" | "article" | "operagx" | "youtube" | "direct"

// Gateway step interface
interface GatewayStep {
  id: string
  type: StepType
  title: string
  description: string
  content?: {
    url?: string
    videoId?: string
  }
}

export default function GatewayPage() {
  const params = useParams()
  const router = useRouter()
  const [gateway, setGateway] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [captchaValidated, setCaptchaValidated] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [allTasksCompleted, setAllTasksCompleted] = useState(false)
  const [showFinalReward, setShowFinalReward] = useState(false)
  const [validationToken, setValidationToken] = useState("")
  const rewardRef = useRef<HTMLDivElement>(null)
  const [lastVisitTime, setLastVisitTime] = useState<number | null>(null)

  // Multi-stage gateway
  const totalStages = gateway?.stages?.length || 1
  const [currentStage, setCurrentStage] = useState(-1) // Start at -1 for CAPTCHA pre-stage
  const stagesCompleted = Array(totalStages + 1).fill(false) // +1 for CAPTCHA pre-stage

  // Fetch gateway data
  useEffect(() => {
    const fetchGateway = async () => {
      try {
        // Check if this user has visited recently (rate limiting)
        const now = Date.now()
        const lastVisit = localStorage.getItem(`gateway_visit_${params.gatewayId}`)

        if (lastVisit) {
          const lastVisitTime = Number.parseInt(lastVisit)
          const timeSinceLastVisit = now - lastVisitTime

          // If less than 30 seconds since last visit, don't count as a new visit
          if (timeSinceLastVisit < 30000) {
            setLastVisitTime(lastVisitTime)
          } else {
            // Update visit time and count as a new visit
            localStorage.setItem(`gateway_visit_${params.gatewayId}`, now.toString())
            incrementGatewayVisits(params.gatewayId as string)
          }
        } else {
          // First visit
          localStorage.setItem(`gateway_visit_${params.gatewayId}`, now.toString())
          incrementGatewayVisits(params.gatewayId as string)
        }

        // In a real implementation, fetch from API
        // For now, get from localStorage
        const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const currentGateway = allGateways.find((g: any) => g.id === params.gatewayId)

        if (!currentGateway) {
          setError("Gateway not found")
          setIsLoading(false)
          return
        }

        // Ensure gateway has steps array
        if (!currentGateway.steps) {
          currentGateway.steps = []
        }

        setGateway(currentGateway)

        // Check if user has a valid CAPTCHA token
        const captchaToken = localStorage.getItem("captchaToken")
        const captchaExpires = localStorage.getItem("captchaExpires")

        if (captchaToken && captchaExpires) {
          const expiresAt = new Date(captchaExpires).getTime()
          const now = Date.now()

          if (expiresAt > now) {
            setCaptchaValidated(true)
          }
        }

        // Check for session progress
        const sessionKey = `gateway_${params.gatewayId}_progress`
        const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")

        // If we have valid progress that hasn't expired
        if (progress.expiresAt && progress.expiresAt > Date.now()) {
          // Restore progress
          if (progress.completedTasks && progress.completedTasks.length > 0) {
            setCompletedTasks(progress.completedTasks)
          }

          // If we have a current stage, restore it
          if (progress.currentStage !== undefined) {
            setCurrentStage(progress.currentStage)

            // If we're past the CAPTCHA stage, mark it as completed
            if (progress.currentStage >= 0) {
              setCaptchaValidated(true)
            }

            // If we're in a task stage, show tasks
            if (progress.currentStage > 0) {
              setShowTasks(true)
            }
          }

          // Check URL parameters for task completion
          const searchParams = new URLSearchParams(window.location.search)
          const completedTask = searchParams.get("task")
          const isCompleted = searchParams.get("completed") === "true"

          if (completedTask && isCompleted && !progress.completedTasks?.includes(`task-${completedTask}`)) {
            const updatedTasks = [...(progress.completedTasks || []), `task-${completedTask}`]
            setCompletedTasks(updatedTasks)

            // Update session storage
            progress.completedTasks = updatedTasks
            sessionStorage.setItem(sessionKey, JSON.stringify(progress))
          }
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("An error occurred while fetching the gateway")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGateway()
  }, [params.gatewayId])

  // Check if all tasks are completed
  useEffect(() => {
    if (
      gateway?.stages &&
      currentStage > 0 &&
      currentStage <= gateway.stages.length &&
      completedTasks.length === gateway.stages[currentStage - 1]?.taskCount &&
      showTasks
    ) {
      setAllTasksCompleted(true)
      // Mark current stage as completed
      stagesCompleted[currentStage] = true

      // If this is the final stage, show the reward
      if (currentStage === totalStages) {
        handleClaimReward()
      }
    }
  }, [completedTasks, gateway, showTasks, currentStage, totalStages])

  // Function to increment gateway visits
  const incrementGatewayVisits = (gatewayId: string) => {
    try {
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const updatedGateways = allGateways.map((g: any) => {
        if (g.id === gatewayId) {
          // Initialize stats if not present
          if (!g.stats) {
            g.stats = { visits: 0, completions: 0, conversionRate: 0, revenue: 0 }
          }

          // Increment visits
          const visits = (g.stats?.visits || 0) + 1
          return {
            ...g,
            stats: {
              ...g.stats,
              visits,
              conversionRate: g.stats?.completions ? (g.stats.completions / visits) * 100 : 0,
              revenue: calculateEstimatedRevenue(visits, g.stats?.completions || 0, g.settings?.adLevel || 3),
            },
          }
        }
        return g
      })

      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
    } catch (error) {
      console.error("Error incrementing gateway visits:", error)
    }
  }

  // Function to increment gateway completions
  const incrementGatewayCompletions = (gatewayId: string) => {
    try {
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const updatedGateways = allGateways.map((g: any) => {
        if (g.id === gatewayId) {
          // Initialize stats if not present
          if (!g.stats) {
            g.stats = { visits: 1, completions: 0, conversionRate: 0, revenue: 0 }
          }

          // Increment completions
          const completions = (g.stats?.completions || 0) + 1
          const visits = g.stats?.visits || 1
          return {
            ...g,
            stats: {
              ...g.stats,
              completions,
              conversionRate: (completions / visits) * 100,
              revenue: calculateEstimatedRevenue(visits, completions, g.settings?.adLevel || 3),
            },
          }
        }
        return g
      })

      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
    } catch (error) {
      console.error("Error incrementing gateway completions:", error)
    }
  }

  // Calculate estimated revenue
  const calculateEstimatedRevenue = (visits: number, completions: number, adLevel: number) => {
    // Base CPM rate ($ per 1000 visits)
    const baseCPM = 2.5

    // Adjust based on ad level
    const adLevelMultiplier = 0.8 + adLevel * 0.2

    // Adjust based on completion rate
    const completionRate = visits > 0 ? completions / visits : 0
    const completionMultiplier = 1 + completionRate * 0.5

    // Calculate revenue
    const revenue = (visits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier

    return Number.parseFloat(revenue.toFixed(2))
  }

  // Handle CAPTCHA validation
  const handleCaptchaValidated = (token: string) => {
    setCaptchaValidated(true)
    setValidationToken(token)
    setCurrentStage(0) // Move to stage 0 (pre-stage)
    stagesCompleted[0] = true // Mark CAPTCHA as completed

    // Store progress in sessionStorage
    const sessionKey = `gateway_${params.gatewayId}_progress`
    const progress = {
      captchaValidated: true,
      currentStage: 0,
      completedTasks: [],
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))
  }

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    const updatedTasks = [...completedTasks, taskId]
    setCompletedTasks(updatedTasks)

    // Store progress in sessionStorage
    const sessionKey = `gateway_${params.gatewayId}_progress`
    const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    progress.completedTasks = updatedTasks
    progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))
  }

  // Handle start tasks
  const handleStartTasks = () => {
    setShowTasks(true)
    setCurrentStage(1) // Move to stage 1 (first actual stage)

    // Store progress in sessionStorage
    const sessionKey = `gateway_${params.gatewayId}_progress`
    const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    progress.currentStage = 1
    progress.showTasks = true
    progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))
  }

  // Move to next stage
  const handleNextStage = () => {
    if (currentStage < totalStages) {
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)
      // Reset completed tasks for the new stage
      setCompletedTasks([])
      setAllTasksCompleted(false)

      // Store progress in sessionStorage
      const sessionKey = `gateway_${params.gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
      progress.currentStage = nextStage
      progress.completedTasks = []
      progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
      sessionStorage.setItem(sessionKey, JSON.stringify(progress))
    } else {
      // Final stage completed
      handleClaimReward()
    }
  }

  // Handle claim reward
  const handleClaimReward = async () => {
    setShowFinalReward(true)
    incrementGatewayCompletions(params.gatewayId as string)

    // Clear session progress
    sessionStorage.removeItem(`gateway_${params.gatewayId}_progress`)

    try {
      // Get the stored CAPTCHA token
      const captchaToken = localStorage.getItem("captchaToken")

      // Mark the gateway as completed on the server
      const response = await fetch("/api/gateway/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId: params.gatewayId,
          token: captchaToken,
          completed: true,
          stages: totalStages,
          currentStage: currentStage,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to complete gateway")
        return
      }

      // Handle different reward types
      if (gateway?.reward?.type === "paste" && gateway?.reward?.content) {
        // For paste rewards, just show the content
        setShowFinalReward(true)
      } else if (gateway?.reward?.type === "url" && gateway?.reward?.url) {
        // For URL rewards, redirect with the token
        const hasParams = gateway.reward.url.includes("?")
        const separator = hasParams ? "&" : "?"
        const redirectUrl = `${gateway.reward.url}${separator}token=${data.token}`

        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1500)
      } else {
        // Fallback - show completion message
        setShowFinalReward(true)
      }
    } catch (error) {
      console.error("Error completing gateway:", error)
      // Don't show error, just complete the gateway
      setShowFinalReward(true)
    }
  }

  // Handle copy reward
  const handleCopyReward = () => {
    if (gateway?.reward?.content) {
      navigator.clipboard
        .writeText(gateway.reward.content)
        .then(() => {
          alert("Content copied to clipboard!")
        })
        .catch((error) => {
          console.error("Error copying content:", error)
          alert("Failed to copy content. Please select and copy manually.")
        })
    }
  }

  // Function to determine task type based on index
  const getTaskType = (index: number): GatewayStep["type"] => {
    const taskTypes: GatewayStep["type"][] = ["redirect", "article", "operagx", "youtube", "direct"]
    return taskTypes[index % taskTypes.length]
  }

  // Update the useEffect hook to check for task completion in URL parameters
  useEffect(() => {
    // Check URL parameters for task completion
    const searchParams = new URLSearchParams(window.location.search)
    const completedTask = searchParams.get("task")
    const isCompleted = searchParams.get("completed") === "true"

    if (completedTask && isCompleted && !completedTasks.includes(`task-${completedTask}`)) {
      handleTaskComplete(`task-${completedTask}`)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-white/80 text-lg">Loading gateway...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Gateway Error</h2>
            <p className="text-gray-300 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
            >
              <i className="fas fa-home mr-2"></i> Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Close button */}
      <div className="absolute top-6 right-6 z-50">
        <Link
          href="/"
          className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all duration-200 group"
        >
          <i className="fas fa-times text-lg group-hover:scale-110 transition-transform"></i>
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Gateway Card */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Hero Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={gateway?.imageUrl || "/placeholder.svg?height=256&width=400"}
                alt={gateway?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Floating info badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
                <p className="text-white/90 text-sm font-medium">{gateway?.creatorName || "Unknown Creator"}</p>
              </div>

              {/* Progress indicator */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">
                    {currentStage < 1 ? "Verification" : `Stage ${currentStage}/${totalStages}`}
                  </span>
                  <span className="text-white/60 text-sm">
                    {Math.round(((currentStage + 1) / (totalStages + 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${((currentStage + 1) / (totalStages + 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h1 className="text-2xl font-bold text-white mb-2">{gateway?.title || "Gateway Access"}</h1>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {gateway?.description || "Complete the verification steps to access your content"}
              </p>

              {/* CAPTCHA validation */}
              {!captchaValidated ? (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-shield-alt text-2xl text-red-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Security Verification</h3>
                    <p className="text-gray-400 text-sm">Please complete the security check to continue</p>
                  </div>
                  <CaptchaValidator onValidated={handleCaptchaValidated} />
                </div>
              ) : !showTasks && !showFinalReward ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <i className="fas fa-check-circle text-2xl text-green-400"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Verification Complete</h3>
                    <p className="text-gray-400 text-sm mb-6">Ready to begin the gateway process</p>
                  </div>
                  <button
                    onClick={handleStartTasks}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
                  >
                    <i className="fas fa-play mr-3 group-hover:scale-110 transition-transform"></i>
                    Start Gateway
                  </button>
                </div>
              ) : showTasks && !showFinalReward ? (
                <div className="space-y-6">
                  {/* Task progress */}
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">
                        Progress: {completedTasks.length}/{gateway?.stages?.[currentStage - 1]?.taskCount || 0}
                      </span>
                      <span className="text-red-400 font-semibold">
                        {gateway?.stages?.[currentStage - 1]?.taskCount > 0
                          ? Math.round((completedTasks.length / gateway.stages[currentStage - 1].taskCount) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            gateway?.stages?.[currentStage - 1]?.taskCount > 0
                              ? (completedTasks.length / gateway.stages[currentStage - 1].taskCount) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-4">
                    {Array.from({ length: gateway?.stages?.[currentStage - 1]?.taskCount || 0 }).map((_, index) => (
                      <GatewayTaskButton
                        key={`task-${currentStage}-${index}`}
                        taskType={getTaskType(index)}
                        taskNumber={index + 1}
                        onComplete={() => handleTaskComplete(`task-${currentStage}-${index}`)}
                        creatorId={gateway?.creatorId || "unknown"}
                        gatewayId={gateway?.id || "unknown"}
                        content={{
                          url: `https://geometrydoomeddrone.com/az0utitpz4?key=883f2bc65de3ac114b8ad78247cfc0b3&creator=${gateway?.creatorId || "unknown"}&gateway=${gateway?.id || "unknown"}`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Next stage button */}
                  {allTasksCompleted && (
                    <button
                      onClick={handleNextStage}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
                    >
                      <span className="mr-3">
                        {currentStage === totalStages ? "Complete Gateway" : "Continue to Next Stage"}
                      </span>
                      <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <i className="fas fa-trophy text-2xl text-green-400"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gateway Complete!</h3>
                    <p className="text-gray-400 text-sm mb-6">You have successfully completed all verification steps</p>
                  </div>

                  {gateway?.reward?.type === "paste" ? (
                    <div className="space-y-4">
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">Your Reward:</span>
                          <button
                            onClick={handleCopyReward}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                          >
                            <i className="fas fa-copy mr-1"></i> Copy
                          </button>
                        </div>
                        <div className="bg-black/60 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-all">
                            {gateway?.reward?.content || "No content available"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-white">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <p className="text-gray-300">Redirecting to your reward...</p>
                    </div>
                  )}

                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                  >
                    <i className="fas fa-home mr-2"></i> Return Home
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Subtle ads */}
          {showTasks && (
            <div className="mt-8 space-y-4 opacity-60">
              <div className="flex justify-center">
                <SecureAd adType="BANNER_300x250" creatorId={gateway?.creatorId || "unknown"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

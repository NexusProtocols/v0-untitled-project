"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SecureAd } from "@/components/secure-ad"
import { CaptchaValidator } from "@/components/captcha-validator"
import { GatewayTaskButton } from "@/components/gateway-task-button"
import Head from "next/head"

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
  const [stagesCompleted, setStagesCompleted] = useState<boolean[]>([])
  const [readyToComplete, setReadyToComplete] = useState(false)

  // Fetch gateway data
  useEffect(() => {
    const fetchGateway = async () => {
      try {
        // Gateway-specific rate limiting
        const now = Date.now()
        const gatewayRateLimitKey = `gateway_${params.gatewayId}_rate_limit`
        const lastVisit = localStorage.getItem(gatewayRateLimitKey)

        if (lastVisit) {
          const lastVisitTime = Number.parseInt(lastVisit)
          const timeSinceLastVisit = now - lastVisitTime

          // Gateway-specific rate limit: 10 seconds between visits to same gateway
          if (timeSinceLastVisit < 10000) {
            setLastVisitTime(lastVisitTime)
          } else {
            // Update visit time and count as a new visit
            localStorage.setItem(gatewayRateLimitKey, now.toString())
            incrementGatewayVisits(params.gatewayId as string)
          }
        } else {
          // First visit to this gateway
          localStorage.setItem(gatewayRateLimitKey, now.toString())
          incrementGatewayVisits(params.gatewayId as string)
        }

        // Try to fetch from Vercel Blob first, then fallback to localStorage
        let currentGateway = null
        try {
          const response = await fetch(`/api/gateway/get?id=${params.gatewayId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              currentGateway = data.gateway
            }
          }
        } catch (error) {
          console.error("Error fetching from blob storage:", error)
        }

        // Fallback to localStorage
        if (!currentGateway) {
          const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
          currentGateway = allGateways.find((g: any) => g.id === params.gatewayId)
        }

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

        // Initialize stages completed array
        const stagesCompletedArray = Array(totalStages + 1).fill(false) // +1 for CAPTCHA
        setStagesCompleted(stagesCompletedArray)

        // Check if user has a valid CAPTCHA token
        const captchaToken = localStorage.getItem("captchaToken")
        const captchaExpires = localStorage.getItem("captchaExpires")

        if (captchaToken && captchaExpires) {
          const expiresAt = new Date(captchaExpires).getTime()
          const now = Date.now()

          if (expiresAt > now) {
            setCaptchaValidated(true)
            stagesCompletedArray[0] = true
            setStagesCompleted([...stagesCompletedArray])
          }
        }

        // Check for persistent progress (no expiration)
        const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
        const persistentProgress = JSON.parse(localStorage.getItem(persistentKey) || "{}")

        // Restore persistent progress
        if (persistentProgress.completedTasks && persistentProgress.completedTasks.length > 0) {
          setCompletedTasks(persistentProgress.completedTasks)
        }

        if (persistentProgress.currentStage !== undefined) {
          setCurrentStage(persistentProgress.currentStage)

          // Mark completed stages as green (but not the current stage unless it's completed)
          for (let i = 0; i < persistentProgress.currentStage; i++) {
            stagesCompletedArray[i] = true
          }
          setStagesCompleted([...stagesCompletedArray])

          // If we're past the CAPTCHA stage, mark it as completed
          if (persistentProgress.currentStage >= 0) {
            setCaptchaValidated(true)
          }

          // If we're in a task stage, show tasks
          if (persistentProgress.currentStage > 0) {
            setShowTasks(true)
          }
        }

        // Check URL parameters for task completion
        const searchParams = new URLSearchParams(window.location.search)
        const completedTask = searchParams.get("task")
        const isCompleted = searchParams.get("completed") === "true"

        if (completedTask && isCompleted && !persistentProgress.completedTasks?.includes(`task-${completedTask}`)) {
          const updatedTasks = [...(persistentProgress.completedTasks || []), `task-${completedTask}`]
          setCompletedTasks(updatedTasks)

          // Update persistent storage
          persistentProgress.completedTasks = updatedTasks
          localStorage.setItem(persistentKey, JSON.stringify(persistentProgress))
        }

        // Restore completed tasks from localStorage
        const storedCompletedTasks = localStorage.getItem(`gateway_${params.gatewayId}_completed_tasks`)
        if (storedCompletedTasks) {
          const tasks = JSON.parse(storedCompletedTasks)
          setCompletedTasks(tasks)
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

      // If this is the final stage, show ready to complete but don't auto-complete
      if (currentStage === totalStages) {
        setReadyToComplete(true)
      }
    }
  }, [completedTasks, gateway, showTasks, currentStage, totalStages])

  // Function to increment gateway visits (prevent duplicates)
  const incrementGatewayVisits = (gatewayId: string) => {
    try {
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const updatedGateways = allGateways.map((g: any) => {
        if (g.id === gatewayId) {
          // Initialize stats if not present
          if (!g.stats) {
            g.stats = { visits: 0, completions: 0, conversionRate: 0, revenue: 0 }
          }

          // Only increment if this is a new visit (prevent duplicates)
          const lastVisitKey = `gateway_${gatewayId}_last_visit_counted`
          const lastVisitCounted = localStorage.getItem(lastVisitKey)
          const now = Date.now()

          if (!lastVisitCounted || now - Number.parseInt(lastVisitCounted) > 60000) {
            // 1 minute cooldown
            localStorage.setItem(lastVisitKey, now.toString())

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
        }
        return g
      })

      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
    } catch (error) {
      console.error("Error incrementing gateway visits:", error)
    }
  }

  // Function to increment gateway completions (prevent duplicates)
  const incrementGatewayCompletions = (gatewayId: string) => {
    try {
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const updatedGateways = allGateways.map((g: any) => {
        if (g.id === gatewayId) {
          // Initialize stats if not present
          if (!g.stats) {
            g.stats = { visits: 1, completions: 0, conversionRate: 0, revenue: 0 }
          }

          // Only increment if this is a new completion (prevent duplicates)
          const lastCompletionKey = `gateway_${gatewayId}_last_completion_counted`
          const lastCompletionCounted = localStorage.getItem(lastCompletionKey)
          const now = Date.now()

          if (!lastCompletionCounted || now - Number.parseInt(lastCompletionCounted) > 300000) {
            // 5 minute cooldown
            localStorage.setItem(lastCompletionKey, now.toString())

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

    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[0] = true // Mark CAPTCHA as completed
    setStagesCompleted(newStagesCompleted)

    // Store progress in persistent storage (no expiration)
    const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
    const progress = {
      captchaValidated: true,
      currentStage: 0,
      completedTasks: [],
    }
    localStorage.setItem(persistentKey, JSON.stringify(progress))
  }

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    const updatedTasks = [...completedTasks, taskId]
    setCompletedTasks(updatedTasks)

    // Store progress in persistent storage (no expiration)
    const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
    const progress = JSON.parse(localStorage.getItem(persistentKey) || "{}")
    progress.completedTasks = updatedTasks
    localStorage.setItem(persistentKey, JSON.stringify(progress))

    // Save completed tasks to localStorage
    localStorage.setItem(`gateway_${params.gatewayId}_completed_tasks`, JSON.stringify(updatedTasks))
  }

  // Handle start tasks
  const handleStartTasks = () => {
    setShowTasks(true)
    setCurrentStage(1) // Move to stage 1 (first actual stage)

    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[1] = false // Current stage is not completed yet
    setStagesCompleted(newStagesCompleted)

    // Store progress in persistent storage
    const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
    const progress = JSON.parse(localStorage.getItem(persistentKey) || "{}")
    progress.currentStage = 1
    progress.showTasks = true
    localStorage.setItem(persistentKey, JSON.stringify(progress))
  }

  // Move to next stage
  const handleNextStage = () => {
    if (currentStage < totalStages) {
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)

      // Mark current stage as completed and move to next
      const newStagesCompleted = [...stagesCompleted]
      newStagesCompleted[currentStage] = true
      setStagesCompleted(newStagesCompleted)

      // Reset completed tasks for the new stage
      setCompletedTasks([])
      setAllTasksCompleted(false)
      setReadyToComplete(false)

      // Store progress in persistent storage
      const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
      const progress = JSON.parse(localStorage.getItem(persistentKey) || "{}")
      progress.currentStage = nextStage
      progress.completedTasks = []
      localStorage.setItem(persistentKey, JSON.stringify(progress))
    }
  }

  // Handle manual gateway completion
  const handleCompleteGateway = async () => {
    // Mark final stage as completed
    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[currentStage] = true
    setStagesCompleted(newStagesCompleted)

    setShowFinalReward(true)
    incrementGatewayCompletions(params.gatewayId as string)

    // Clear persistent progress
    localStorage.removeItem(`gateway_${params.gatewayId}_persistent_progress`)

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
        console.error("Gateway completion failed:", data.error)
        // Don't show error to user, just complete the gateway
        setShowFinalReward(true)
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
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Gateway</h2>
          <p className="text-gray-400">Please wait while we prepare your experience...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-exclamation-triangle text-4xl text-red-400"></i>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Gateway Error</h2>
            <p className="text-gray-300 mb-12 text-xl">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-home mr-3"></i> Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ensure gateway has steps array
  const steps = gateway?.steps || []

  return (
    <>
      <Head>
        <title>{gateway?.title || "Gateway Access"} | NEXUS</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Top banner ad */}
        <div className="container mx-auto px-5 pt-8">
          <div className="flex justify-center">
            <SecureAd adType="BANNER_728x90" creatorId={gateway?.creatorId || "unknown"} />
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-5 py-8 relative z-10">
          <div className="relative">
            {/* Side ads */}
            <div className="absolute -left-40 top-0 hidden xl:block">
              <SecureAd adType="BANNER_160x600" creatorId={gateway?.creatorId || "unknown"} />
            </div>
            <div className="absolute -right-40 top-0 hidden xl:block">
              <SecureAd adType="BANNER_160x600" creatorId={gateway?.creatorId || "unknown"} />
            </div>

            <div className="mx-auto max-w-4xl">
              {/* Header with Gateway Info */}
              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-8">
                  {gateway?.imageUrl && (
                    <div className="w-full lg:w-1/3">
                      <div className="relative h-56 w-full overflow-hidden rounded-xl shadow-lg">
                        <img
                          src={gateway.imageUrl || "/placeholder.svg"}
                          alt={gateway.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>
                  )}
                  <div className="w-full lg:w-2/3">
                    <h1 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                      {gateway?.title || "Gateway Access"}
                    </h1>
                    <p className="mb-6 text-gray-300 text-lg leading-relaxed">
                      {gateway?.description || "Complete all verification steps to access your content"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <i className="fas fa-user text-red-400"></i>
                        <span className="text-gray-300 font-medium">{gateway?.creatorName || "Unknown Creator"}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <i className="fas fa-tasks text-red-400"></i>
                        <span className="text-gray-300 font-medium">
                          {totalStages} Stage{totalStages !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-stage progress indicator */}
              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentStage < 1 ? "Security Verification" : `Stage ${currentStage} of ${totalStages}`}
                  </h2>
                  <p className="text-gray-400">
                    {currentStage < 1
                      ? "Complete security verification to proceed"
                      : `Complete all tasks in this stage to continue`}
                  </p>
                </div>

                <div className="flex justify-center items-center gap-4 mb-6">
                  {/* CAPTCHA verification stage */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStage === -1
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                          : stagesCompleted[0]
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                            : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {currentStage === -1 && (
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
                      )}
                      <i className="fas fa-shield-alt text-lg"></i>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Verify</span>
                  </div>

                  {/* Connector line */}
                  {totalStages > 0 && <div className="w-8 h-0.5 bg-gray-700"></div>}

                  {/* Gateway stages */}
                  {Array.from({ length: totalStages }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          index + 1 === currentStage
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                            : stagesCompleted[index + 1]
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                              : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {index + 1 === currentStage && (
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
                        )}
                        <span className="text-lg font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">Stage {index + 1}</span>
                      {/* Remove connector line after the last stage */}
                      {index < totalStages - 1 && <div className="w-8 h-0.5 bg-gray-700 mt-2"></div>}
                    </div>
                  ))}
                </div>

                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${((currentStage + 1 + (stagesCompleted[currentStage + 1] ? 1 : 0)) / (totalStages + 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* CAPTCHA validation */}
              {!captchaValidated ? (
                <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-8">
                  <CaptchaValidator onValidated={handleCaptchaValidated} />
                </div>
              ) : !showTasks && !showFinalReward ? (
                <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-8 text-center">
                  <div className="mb-6 inline-block rounded-full bg-green-500/20 p-6">
                    <i className="fas fa-rocket text-5xl text-green-400"></i>
                  </div>
                  <h2 className="mb-4 text-3xl font-bold text-white">Ready to Begin</h2>
                  <p className="mb-8 text-gray-300 text-lg">
                    Security verification complete. You can now start the gateway process.
                  </p>
                  <button
                    onClick={handleStartTasks}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                  >
                    <i className="fas fa-play mr-3"></i> Start Gateway Process
                  </button>
                </div>
              ) : showTasks && !showFinalReward ? (
                <>
                  {/* Progress bar */}
                  <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg text-white font-bold">
                        Task Progress: {completedTasks.length}/{gateway?.stages?.[currentStage - 1]?.taskCount || 0}
                      </div>
                      <div className="text-lg text-red-400 font-bold">
                        {gateway?.stages?.[currentStage - 1]?.taskCount > 0
                          ? Math.round((completedTasks.length / gateway.stages[currentStage - 1].taskCount) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
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
                  <div className="mb-8 space-y-6">
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
                        isCompleted={completedTasks.includes(`task-${currentStage}-${index}`)}
                      />
                    ))}
                  </div>

                  {/* Next stage or complete gateway button */}
                  {allTasksCompleted && (
                    <div className="mb-8 text-center">
                      {currentStage === totalStages && readyToComplete ? (
                        <button
                          onClick={handleCompleteGateway}
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                        >
                          <span className="mr-3">Complete Gateway</span>
                          <i className="fas fa-trophy"></i>
                        </button>
                      ) : (
                        <button
                          onClick={handleNextStage}
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                        >
                          <span className="mr-3">Continue to Next Stage</span>
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bottom ads */}
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SecureAd adType="BANNER_300x250" creatorId={gateway?.creatorId || "unknown"} />
                    <SecureAd adType="BANNER_300x250_ALT" creatorId={gateway?.creatorId || "unknown"} />
                  </div>

                  {/* Native banner */}
                  <div className="mb-8">
                    <SecureAd adType="NATIVE_BANNER_1" creatorId={gateway?.creatorId || "unknown"} />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-8">
                  <div className="text-center mb-8">
                    <div className="mb-6 inline-block rounded-full bg-green-500/20 p-6">
                      <i className="fas fa-trophy text-5xl text-green-400"></i>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Gateway Completed!</h2>
                    <p className="mb-8 text-gray-300 text-lg">
                      Congratulations! You have successfully completed all verification steps.
                    </p>
                  </div>

                  {gateway?.reward?.type === "paste" ? (
                    <div className="mb-8">
                      <div className="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-white">Your Reward:</h3>
                          <button
                            onClick={handleCopyReward}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                          >
                            <i className="fas fa-copy mr-2"></i> Copy to Clipboard
                          </button>
                        </div>
                        <div className="bg-black/60 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap break-all text-sm text-gray-300 font-mono">
                            {gateway?.reward?.content || "No content available"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 text-center">
                      <p className="mb-6 text-white text-lg">Redirecting you to your reward...</p>
                      <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <Link
                      href="/"
                      className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105"
                    >
                      <i className="fas fa-home mr-2"></i> Return Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom banner ads */}
        <div className="container mx-auto px-5 py-8">
          <div className="mb-8 flex justify-center">
            <SecureAd adType="BANNER_728x90" creatorId={gateway?.creatorId || "unknown"} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SecureAd adType="BANNER_300x250" creatorId={gateway?.creatorId || "unknown"} />
            <SecureAd adType="NATIVE_BANNER_2" creatorId={gateway?.creatorId || "unknown"} className="h-full" />
            <SecureAd adType="BANNER_300x250_ALT" creatorId={gateway?.creatorId || "unknown"} />
          </div>
        </div>
      </div>
    </>
  )
}

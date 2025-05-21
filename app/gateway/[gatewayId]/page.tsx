"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SecureAd } from "@/components/secure-ad"
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

// Default gateway data for fallback
const DEFAULT_GATEWAY = {
  id: "default-gateway",
  title: "Gateway",
  description: "Complete all tasks to access the content",
  creatorId: "system",
  creatorName: "System",
  steps: [],
  stages: [
    {
      id: "stage-1",
      title: "Stage 1",
      description: "Complete these tasks to proceed",
      taskCount: 3,
    },
  ],
  reward: {
    type: "paste",
    content: "Thank you for completing the gateway!",
  },
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
          // Use default gateway as fallback
          console.warn("Gateway not found, using default gateway")
          const defaultGateway = {
            ...DEFAULT_GATEWAY,
            id: params.gatewayId as string,
          }
          setGateway(defaultGateway)
          setIsLoading(false)
          return
        }

        // Ensure gateway has steps array
        if (!currentGateway.steps) {
          currentGateway.steps = []
        }

        // Ensure gateway has stages array
        if (!currentGateway.stages) {
          currentGateway.stages = [
            {
              id: "stage-1",
              title: "Stage 1",
              description: "Complete these tasks to proceed",
              taskCount: 3,
            },
          ]
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
      } catch (error) {
        console.error("Error fetching gateway:", error)
        // Use default gateway as fallback
        const defaultGateway = {
          ...DEFAULT_GATEWAY,
          id: params.gatewayId as string,
        }
        setGateway(defaultGateway)
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
  }

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => [...prev, taskId])
  }

  // Handle start tasks
  const handleStartTasks = () => {
    setShowTasks(true)
    setCurrentStage(1) // Move to stage 1 (first actual stage)
  }

  // Move to next stage
  const handleNextStage = () => {
    if (currentStage < totalStages) {
      setCurrentStage(currentStage + 1)
      // Reset completed tasks for the new stage
      setCompletedTasks([])
      setAllTasksCompleted(false)
    } else {
      // Final stage completed
      handleClaimReward()
    }
  }

  // Handle claim reward
  const handleClaimReward = async () => {
    setShowFinalReward(true)
    incrementGatewayCompletions(params.gatewayId as string)

    try {
      // Get the stored CAPTCHA token
      const captchaToken = localStorage.getItem("captchaToken")

      if (!captchaToken) {
        setError("Session expired. Please refresh and try again.")
        return
      }

      // Mark the gateway as completed on the server
      try {
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
          console.warn("Gateway completion API returned error:", data.error)
          // Continue anyway - we don't want to block the user if the API fails
        }

        // If reward is a URL, redirect with the token
        if (gateway?.reward?.type === "url" && gateway?.reward?.url) {
          // Check if the URL already has query parameters
          const hasParams = gateway.reward.url.includes("?")
          const separator = hasParams ? "&" : "?"

          // Redirect to the reward URL with the token
          const redirectUrl = `${gateway.reward.url}${separator}token=${data.token || "demo-token"}`

          setTimeout(() => {
            window.location.href = redirectUrl
          }, 1500)
        }
      } catch (error) {
        console.error("Error completing gateway:", error)
        // Continue anyway - we don't want to block the user if the API fails
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
  }

  // Handle scroll to reward
  const handleScrollToReward = () => {
    if (rewardRef.current) {
      rewardRef.current.scrollIntoView({ behavior: "smooth" })
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
  const getTaskType = (index: number): StepType => {
    const taskTypes: StepType[] = ["redirect", "article", "operagx", "youtube", "direct"]
    return taskTypes[index % taskTypes.length]
  }

  // Function to get safe task URL
  const getSafeTaskUrl = (index: number) => {
    // Use a safe default URL that won't cause errors
    return "https://example.com"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Error</h2>
            <p className="mb-6 text-gray-400">{error}</p>
            <Link
              href="/"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-home mr-2"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ensure gateway has steps array
  const steps = gateway?.steps || []

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#050505]">
      {/* Top banner ad */}
      <div className="container mx-auto px-5 pt-8">
        <div className="flex justify-center">
          <SecureAd
            adType="BANNER_728x90"
            creatorId={gateway?.creatorId || "unknown"}
            fallback={
              <div className="bg-[#0a0a0a] h-[90px] w-[728px] flex items-center justify-center text-gray-500">
                Advertisement Space
              </div>
            }
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-5 py-8">
        <div className="relative">
          {/* Side ads */}
          <div className="absolute -left-40 top-0 hidden xl:block">
            <SecureAd
              adType="BANNER_160x600"
              creatorId={gateway?.creatorId || "unknown"}
              fallback={
                <div className="bg-[#0a0a0a] h-[600px] w-[160px] flex items-center justify-center text-gray-500">
                  Ad Space
                </div>
              }
            />
          </div>
          <div className="absolute -right-40 top-0 hidden xl:block">
            <SecureAd
              adType="BANNER_160x600"
              creatorId={gateway?.creatorId || "unknown"}
              fallback={
                <div className="bg-[#0a0a0a] h-[600px] w-[160px] flex items-center justify-center text-gray-500">
                  Ad Space
                </div>
              }
            />
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Header with Gateway Info */}
            <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 shadow-lg shadow-[#ff3e3e]/5">
              <div className="flex flex-col md:flex-row gap-6">
                {gateway?.imageUrl && (
                  <div className="w-full md:w-1/3">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={gateway.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={gateway.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                          e.currentTarget.onerror = null
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="w-full md:w-2/3">
                  <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
                    {gateway?.title || "Gateway"}
                  </h1>
                  <p className="mb-4 text-gray-400">
                    {gateway?.description || "Complete all tasks to access the content"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-user mr-1"></i> {gateway?.creatorName || "Unknown"}
                    </span>
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-tasks mr-1"></i> {steps.length} Tasks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-stage progress indicator */}
            <div className="mb-8">
              <div className="text-center mb-2">
                <h2 className="text-lg font-medium text-white">
                  {currentStage < 1 ? "Verification" : `Stage ${currentStage} of ${totalStages}`}
                </h2>
              </div>
              <div className="flex justify-center items-center gap-2 mb-4">
                {/* CAPTCHA verification stage */}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStage === -1
                      ? "bg-[#ff3e3e] text-white"
                      : stagesCompleted[0]
                        ? "bg-green-500 text-white"
                        : "bg-[#1a1a1a] text-gray-400"
                  }`}
                >
                  {currentStage === -1 && (
                    <div className="absolute inset-0 rounded-full bg-[#ff3e3e] animate-ping opacity-30"></div>
                  )}
                  {stagesCompleted[0] ? <i className="fas fa-check"></i> : <i className="fas fa-shield-alt"></i>}
                </div>

                {/* Gateway stages */}
                {Array.from({ length: totalStages }).map((_, index) => (
                  <div
                    key={index}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                      index + 1 === currentStage
                        ? "bg-[#ff3e3e] text-white"
                        : stagesCompleted[index + 1]
                          ? "bg-green-500 text-white"
                          : "bg-[#1a1a1a] text-gray-400"
                    }`}
                  >
                    {index + 1 === currentStage && (
                      <div className="absolute inset-0 rounded-full bg-[#ff3e3e] animate-ping opacity-30"></div>
                    )}
                    {stagesCompleted[index + 1] ? <i className="fas fa-check"></i> : <span>{index + 1}</span>}
                  </div>
                ))}
              </div>
              <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
                  style={{
                    width: `${((currentStage + 1 + (stagesCompleted[currentStage + 1] ? 1 : 0)) / (totalStages + 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* CAPTCHA validation */}
            {!captchaValidated ? (
              <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 text-center">
                <div className="mb-4 inline-block rounded-full bg-[#ff3e3e]/20 p-4">
                  <i className="fas fa-shield-alt text-4xl text-[#ff3e3e]"></i>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">Human Verification Required</h2>
                <p className="mb-6 text-gray-400">Please complete the verification below to continue.</p>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleCaptchaValidated("demo-token")}
                    className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  >
                    <i className="fas fa-check-circle mr-2"></i> Verify (Demo Mode)
                  </button>
                </div>
              </div>
            ) : !showTasks && !showFinalReward ? (
              <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 text-center">
                <div className="mb-4 inline-block rounded-full bg-[#ff3e3e]/20 p-4">
                  <i className="fas fa-rocket text-4xl text-[#ff3e3e]"></i>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">Ready to Begin</h2>
                <p className="mb-6 text-gray-400">
                  You're about to start the gateway process. Complete all tasks to access the content.
                </p>
                <button
                  onClick={handleStartTasks}
                  className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                >
                  <i className="fas fa-play mr-2"></i> Start Tasks
                </button>
              </div>
            ) : showTasks && !showFinalReward ? (
              <>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-white font-medium">
                      {completedTasks.length} of {gateway?.stages?.[currentStage - 1]?.taskCount || 0} Tasks Completed
                    </div>
                    <div className="text-sm text-gray-400">
                      {gateway?.stages?.[currentStage - 1]?.taskCount > 0
                        ? Math.round((completedTasks.length / gateway.stages[currentStage - 1].taskCount) * 100)
                        : 0}
                      % Complete
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
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
                <div className="mb-8 space-y-4">
                  {Array.from({ length: gateway?.stages?.[currentStage - 1]?.taskCount || 0 }).map((_, index) => (
                    <GatewayTaskButton
                      key={`task-${currentStage}-${index}`}
                      taskType={getTaskType(index)}
                      taskNumber={index + 1}
                      onComplete={() => handleTaskComplete(`task-${currentStage}-${index}`)}
                      creatorId={gateway?.creatorId || "unknown"}
                      gatewayId={gateway?.id || "unknown"}
                      content={{
                        url: getSafeTaskUrl(index),
                      }}
                    />
                  ))}
                </div>

                {/* Next stage button */}
                {allTasksCompleted && (
                  <div className="mb-8 text-center">
                    <button
                      onClick={handleNextStage}
                      className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                    >
                      <i className="fas fa-arrow-right mr-2"></i> Continue to Next Stage
                    </button>
                  </div>
                )}

                {/* Bottom ads */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SecureAd
                    adType="BANNER_300x250"
                    creatorId={gateway?.creatorId || "unknown"}
                    fallback={
                      <div className="bg-[#0a0a0a] h-[250px] w-[300px] flex items-center justify-center text-gray-500">
                        Ad Space
                      </div>
                    }
                  />
                  <SecureAd
                    adType="BANNER_300x250_ALT"
                    creatorId={gateway?.creatorId || "unknown"}
                    fallback={
                      <div className="bg-[#0a0a0a] h-[250px] w-[300px] flex items-center justify-center text-gray-500">
                        Ad Space
                      </div>
                    }
                  />
                </div>

                {/* Native banner */}
                <div className="mb-8">
                  <SecureAd
                    adType="NATIVE_BANNER_1"
                    creatorId={gateway?.creatorId || "unknown"}
                    fallback={
                      <div className="bg-[#0a0a0a] h-[250px] w-full flex items-center justify-center text-gray-500">
                        Native Ad Space
                      </div>
                    }
                  />
                </div>
              </>
            ) : (
              <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
                <div className="text-center mb-6">
                  <div className="mb-4 inline-block rounded-full bg-green-500/20 p-4">
                    <i className="fas fa-check-circle text-4xl text-green-500"></i>
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Gateway Completed!</h2>
                  <p className="mb-6 text-gray-400">You have successfully completed all tasks.</p>
                </div>

                {gateway?.reward?.type === "paste" ? (
                  <div className="mb-6">
                    <div className="mb-4 rounded border border-white/10 bg-[#000000] p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-medium">Your Reward:</h3>
                        <button
                          onClick={handleCopyReward}
                          className="interactive-element rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white transition-all hover:bg-[#ff0000]"
                        >
                          <i className="fas fa-copy mr-1"></i> Copy to Clipboard
                        </button>
                      </div>
                      <div className="relative">
                        <pre className="whitespace-pre-wrap break-all text-sm text-gray-300 font-mono bg-[#0a0a0a] p-4 rounded-lg max-h-96 overflow-y-auto">
                          {gateway?.reward?.content || "No content available"}
                        </pre>
                        <div className="absolute inset-0 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-white">Redirecting you to your reward...</p>
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="interactive-element button-shine inline-flex items-center rounded border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
                  >
                    <i className="fas fa-home mr-2"></i> Back to Home
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
          <SecureAd
            adType="BANNER_728x90"
            creatorId={gateway?.creatorId || "unknown"}
            fallback={
              <div className="bg-[#0a0a0a] h-[90px] w-[728px] flex items-center justify-center text-gray-500">
                Advertisement Space
              </div>
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SecureAd
            adType="BANNER_300x250"
            creatorId={gateway?.creatorId || "unknown"}
            fallback={
              <div className="bg-[#0a0a0a] h-[250px] w-[300px] flex items-center justify-center text-gray-500">
                Ad Space
              </div>
            }
          />
          <SecureAd
            adType="NATIVE_BANNER_2"
            creatorId={gateway?.creatorId || "unknown"}
            className="h-full"
            fallback={
              <div className="bg-[#0a0a0a] h-full w-full flex items-center justify-center text-gray-500">
                Native Ad Space
              </div>
            }
          />
          <SecureAd
            adType="BANNER_300x250_ALT"
            creatorId={gateway?.creatorId || "unknown"}
            fallback={
              <div className="bg-[#0a0a0a] h-[250px] w-[300px] flex items-center justify-center text-gray-500">
                Ad Space
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}

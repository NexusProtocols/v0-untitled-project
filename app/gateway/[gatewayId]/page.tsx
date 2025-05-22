"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SecureAd } from "@/components/secure-ad"
import { CaptchaValidator } from "@/components/captcha-validator"
import { GatewayTaskButton } from "@/components/gateway-task-button"
import { v4 as uuidv4 } from "uuid"

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
  const searchParams = useSearchParams()
  const [gateway, setGateway] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [captchaValidated, setCaptchaValidated] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [allTasksCompleted, setAllTasksCompleted] = useState(false)
  const [showFinalReward, setShowFinalReward] = useState(false)
  const [validationToken, setValidationToken] = useState("")
  const [rewardContent, setRewardContent] = useState<string>("")
  const [rewardUrl, setRewardUrl] = useState<string>("")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const rewardRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string>("")

  // Multi-stage gateway
  const totalStages = gateway?.stages?.length || 1
  const [currentStage, setCurrentStage] = useState(-1) // Start at -1 for CAPTCHA pre-stage
  const [stagesCompleted, setStagesCompleted] = useState<boolean[]>(Array(totalStages + 1).fill(false)) // +1 for CAPTCHA pre-stage

  // Check for session ID in URL or create a new one
  useEffect(() => {
    const urlSessionId = searchParams?.get("sessionId")

    if (urlSessionId) {
      console.log(`Using existing session ID: ${urlSessionId}`)
      setSessionId(urlSessionId)

      // Fetch session data
      const fetchSessionData = async () => {
        try {
          const response = await fetch(`/api/gateway/session?sessionId=${urlSessionId}`)
          const data = await response.json()

          if (data.success && data.session) {
            console.log(`Loaded session data:`, data.session)
            // Restore session state
            setCompletedTasks(data.session.completedTasks || [])
            setCurrentStage(data.session.currentStage || -1)

            // Update stages completed array
            const newStagesCompleted = [...stagesCompleted]
            if (data.session.currentStage >= 0) {
              newStagesCompleted[0] = true // CAPTCHA stage
              setCaptchaValidated(true)
            }

            for (let i = 1; i <= data.session.currentStage; i++) {
              newStagesCompleted[i] = true
            }
            setStagesCompleted(newStagesCompleted)

            if (data.session.currentStage >= 0) {
              setShowTasks(true)
            }
          }
        } catch (error) {
          console.error("Error fetching session data:", error)
        }
      }

      fetchSessionData()
    } else {
      // Generate a new session ID
      const newSessionId = uuidv4()
      console.log(`Created new session ID: ${newSessionId}`)
      setSessionId(newSessionId)

      // Create a new session
      const createSession = async () => {
        try {
          const response = await fetch("/api/gateway/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gatewayId: params.gatewayId,
              completedTasks: [],
              currentStage: -1,
            }),
          })

          const data = await response.json()
          if (!data.success) {
            console.error("Failed to create session:", data.message)
          }
        } catch (error) {
          console.error("Error creating session:", error)
        }
      }

      createSession()
    }
  }, [params.gatewayId, searchParams, stagesCompleted])

  // Fetch gateway data
  useEffect(() => {
    const fetchGateway = async () => {
      try {
        // Fetch gateway data from API with improved error handling
        const response = await fetch(`/api/gateway/${params.gatewayId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          setError(data.message || "Failed to fetch gateway")
          setIsLoading(false)
          return
        }

        setGateway(data.gateway)
        console.log("Gateway data loaded:", data.gateway)

        // Check if user has a valid CAPTCHA token
        const captchaToken = localStorage.getItem("captchaToken")
        const captchaExpires = localStorage.getItem("captchaExpires")

        if (captchaToken && captchaExpires) {
          const expiresAt = new Date(captchaExpires).getTime()
          const now = Date.now()

          if (expiresAt > now) {
            setCaptchaValidated(true)

            // Update stages completed
            const newStagesCompleted = [...stagesCompleted]
            newStagesCompleted[0] = true
            setStagesCompleted(newStagesCompleted)
          }
        }

        // Check URL parameters for task completion
        const completedTask = searchParams?.get("task")
        const isCompleted = searchParams?.get("completed") === "true"

        if (completedTask && isCompleted) {
          const taskId = `task-${completedTask}`

          // Only add if not already in the completed tasks
          if (!completedTasks.includes(taskId)) {
            const updatedTasks = [...completedTasks, taskId]
            setCompletedTasks(updatedTasks)

            // Update session
            updateSession(updatedTasks, currentStage)
          }
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError(error instanceof Error ? error.message : "An error occurred while fetching the gateway")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.gatewayId) {
      fetchGateway()
    }
  }, [params.gatewayId, searchParams, completedTasks, currentStage, stagesCompleted])

  // Check if all tasks are completed
  useEffect(() => {
    if (
      gateway?.stages &&
      currentStage > 0 &&
      currentStage <= gateway.stages.length &&
      gateway.stages[currentStage - 1]?.taskCount > 0 &&
      completedTasks.length >= gateway.stages[currentStage - 1]?.taskCount &&
      showTasks
    ) {
      console.log(`All tasks completed for stage ${currentStage}`)
      setAllTasksCompleted(true)

      // Mark current stage as completed
      const newStagesCompleted = [...stagesCompleted]
      newStagesCompleted[currentStage] = true
      setStagesCompleted(newStagesCompleted)

      // If this is the final stage, show the reward
      if (currentStage === totalStages) {
        handleClaimReward()
      }
    } else {
      setAllTasksCompleted(false)
    }
  }, [completedTasks, gateway, showTasks, currentStage, totalStages, stagesCompleted])

  // Function to update session in the database
  const updateSession = async (tasks: string[], stage: number) => {
    try {
      console.log(`Updating session ${sessionId} with ${tasks.length} tasks and stage ${stage}`)
      const response = await fetch("/api/gateway/session", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          completedTasks: tasks,
          currentStage: stage,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        console.error("Failed to update session:", data.message)
      }
    } catch (error) {
      console.error("Error updating session:", error)
    }
  }

  // Handle CAPTCHA validation
  const handleCaptchaValidated = (token: string) => {
    setCaptchaValidated(true)
    setValidationToken(token)
    setCurrentStage(0) // Move to stage 0 (pre-stage)

    // Mark CAPTCHA as completed
    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[0] = true
    setStagesCompleted(newStagesCompleted)

    // Update session
    updateSession(completedTasks, 0)
  }

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    console.log(`Task ${taskId} completed`)

    // Only add if not already in the completed tasks
    if (!completedTasks.includes(taskId)) {
      const updatedTasks = [...completedTasks, taskId]
      setCompletedTasks(updatedTasks)

      // Update session
      updateSession(updatedTasks, currentStage)
    }
  }

  // Handle start tasks
  const handleStartTasks = () => {
    setShowTasks(true)
    setCurrentStage(1) // Move to stage 1 (first actual stage)

    // Update session
    updateSession(completedTasks, 1)
  }

  // Move to next stage
  const handleNextStage = () => {
    if (currentStage < totalStages) {
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)
      // Reset completed tasks for the new stage
      setCompletedTasks([])
      setAllTasksCompleted(false)

      // Update session
      updateSession([], nextStage)
    } else {
      // Final stage completed
      handleClaimReward()
    }
  }

  // Handle claim reward
  const handleClaimReward = async () => {
    try {
      console.log("Claiming reward for gateway:", params.gatewayId)

      // Mark the gateway as completed on the server
      const response = await fetch("/api/gateway/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId: params.gatewayId,
          sessionId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "Failed to complete gateway")
        return
      }

      // Set the reward content or URL
      if (gateway?.reward?.type === "paste" && gateway?.reward?.content) {
        setRewardContent(gateway.reward.content)
        setShowFinalReward(true)
      } else if (gateway?.reward?.type === "url" && gateway?.reward?.url) {
        // Check if the URL already has query parameters
        const hasParams = gateway.reward.url.includes("?")
        const separator = hasParams ? "&" : "?"

        // Set the redirect URL with the token
        const redirectUrl = `${gateway.reward.url}${separator}token=${data.token}`
        setRewardUrl(redirectUrl)
        setIsRedirecting(true)
        setShowFinalReward(true)

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1500)
      } else {
        setError("Invalid reward configuration")
      }
    } catch (error) {
      console.error("Error completing gateway:", error)
      setError("An error occurred while completing the gateway")
    }
  }

  // Handle copy reward
  const handleCopyReward = () => {
    if (rewardContent) {
      navigator.clipboard
        .writeText(rewardContent)
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

  // Function to check if a specific task is completed
  const isTaskCompleted = (stageNum: number, taskNum: number) => {
    const taskId = `task-${stageNum}-${taskNum}`
    return completedTasks.includes(taskId)
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
          <SecureAd adType="BANNER_728x90" creatorId={gateway?.creatorId || "unknown"} />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-5 py-8">
        <div className="relative">
          {/* Side ads */}
          <div className="absolute -left-40 top-0 hidden xl:block">
            <SecureAd adType="BANNER_160x600" creatorId={gateway?.creatorId || "unknown"} />
          </div>
          <div className="absolute -right-40 top-0 hidden xl:block">
            <SecureAd adType="BANNER_160x600" creatorId={gateway?.creatorId || "unknown"} />
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Header with Gateway Info */}
            <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 shadow-lg shadow-[#ff3e3e]/5">
              <div className="flex flex-col md:flex-row gap-6">
                {gateway?.imageUrl && (
                  <div className="w-full md:w-1/3">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={gateway.imageUrl || "/placeholder.svg"}
                        alt={gateway.title}
                        className="h-full w-full object-cover"
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
                      <i className="fas fa-tasks mr-1"></i> {gateway?.stages?.[currentStage - 1]?.taskCount || 0} Tasks
                    </span>
                    <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                      <i className="fas fa-key mr-1"></i> Session ID: {sessionId.substring(0, 8)}...
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
              <CaptchaValidator onValidated={handleCaptchaValidated} />
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
                  {Array.from({ length: gateway?.stages?.[currentStage - 1]?.taskCount || 0 }).map((_, index) => {
                    const taskId = `task-${currentStage}-${index + 1}`
                    return (
                      <GatewayTaskButton
                        key={`task-${currentStage}-${index}`}
                        taskType={getTaskType(index)}
                        taskNumber={index + 1}
                        onComplete={() => handleTaskComplete(taskId)}
                        creatorId={gateway?.creatorId || "unknown"}
                        gatewayId={gateway?.id || "unknown"}
                        sessionId={sessionId}
                        content={{
                          url: `https://geometrydoomeddrone.com/az0utitpz4?key=883f2bc65de3ac114b8ad78247cfc0b3&creator=${gateway?.creatorId || "unknown"}&gateway=${gateway?.id || "unknown"}&sessionId=${sessionId}`,
                        }}
                        isCompleted={completedTasks.includes(taskId)}
                      />
                    )
                  })}
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
                  <SecureAd adType="BANNER_300x250" creatorId={gateway?.creatorId || "unknown"} />
                  <SecureAd adType="BANNER_300x250_ALT" creatorId={gateway?.creatorId || "unknown"} />
                </div>

                {/* Native banner */}
                <div className="mb-8">
                  <SecureAd adType="NATIVE_BANNER_1" creatorId={gateway?.creatorId || "unknown"} />
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

                {gateway?.reward?.type === "paste" && rewardContent ? (
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
                          {rewardContent}
                        </pre>
                        <div className="absolute inset-0 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ) : isRedirecting ? (
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-white">Redirecting you to your reward...</p>
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-white">Processing your reward...</p>
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
          <SecureAd adType="BANNER_728x90" creatorId={gateway?.creatorId || "unknown"} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SecureAd adType="BANNER_300x250" creatorId={gateway?.creatorId || "unknown"} />
          <SecureAd adType="NATIVE_BANNER_2" creatorId={gateway?.creatorId || "unknown"} className="h-full" />
          <SecureAd adType="BANNER_300x250_ALT" creatorId={gateway?.creatorId || "unknown"} />
        </div>
      </div>
    </div>
  )
}

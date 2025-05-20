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

  // Multi-stage gateway - Using Script 1's approach
  const totalStages = 5
  const [currentStage, setCurrentStage] = useState(0) // 0 for CAPTCHA, 1-5 for stages
  const stagesCompleted = new Array(totalStages + 1).fill(false) // +1 for CAPTCHA

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
            setCurrentStage(1) // Move to first stage if CAPTCHA is valid
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

  // Check if all tasks are completed - Using Script 1's logic
  useEffect(() => {
    if (gateway && gateway.steps && completedTasks.length === gateway.steps.length && showTasks) {
      setAllTasksCompleted(true)
      // Mark current stage as completed
      stagesCompleted[currentStage] = true

      // If this is the final stage, show the reward
      if (currentStage === totalStages) {
        handleClaimReward()
      }
    }
  }, [completedTasks, gateway, showTasks, currentStage])

  // Increment gateway visits
  const incrementGatewayVisits = async (gatewayId: string) => {
    try {
      // In a real implementation, this would be an API call
      console.log(`Incrementing visits for gateway ${gatewayId}`)
      // For now, just log it
    } catch (error) {
      console.error("Error incrementing gateway visits:", error)
    }
  }

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId])
    }
  }

  // Handle moving to next stage
  const handleNextStage = () => {
    // Mark current stage as completed
    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[currentStage] = true

    // Reset tasks for next stage
    setCompletedTasks([])
    setAllTasksCompleted(false)
    setShowTasks(true)

    // Move to next stage
    setCurrentStage(currentStage + 1)
  }

  // Handle claiming reward
  const handleClaimReward = () => {
    setShowFinalReward(true)
    setShowTasks(false)

    // If reward is a URL, redirect after a delay
    if (gateway?.reward?.type === "url" && gateway?.reward?.content) {
      setTimeout(() => {
        window.location.href = gateway.reward.content
      }, 3000)
    }
  }

  // Handle copying reward to clipboard
  const handleCopyReward = () => {
    if (gateway?.reward?.content) {
      navigator.clipboard.writeText(gateway.reward.content)
      alert("Copied to clipboard!")
    }
  }

  // Handle CAPTCHA validation - Modified for Script 1's flow
  const handleCaptchaValidated = (token: string) => {
    setCaptchaValidated(true)
    setValidationToken(token)
    setCurrentStage(1) // Move to first stage after CAPTCHA
    stagesCompleted[0] = true // Mark CAPTCHA as completed
  }

  // Handle start tasks - Simplified from Script 1
  const handleStartTasks = () => {
    setShowTasks(true)
    setCurrentStage(1)
  }

  // [Rest of your handler functions remain the same...]

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
            {/* Header with Gateway Info - Using Script 1's design */}
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
                      <i className="fas fa-tasks mr-1"></i> {steps.length} Tasks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-stage progress indicator - Using Script 1's design */}
            <div className="mb-8">
              <div className="text-center mb-2">
                <h2 className="text-lg font-medium text-white">
                  Stage {currentStage} of {totalStages}
                </h2>
              </div>
              <div className="flex justify-center items-center gap-2 mb-4">
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
                    width: `${((currentStage + (stagesCompleted[currentStage] ? 1 : 0)) / totalStages) * 100}%`,
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
                {/* Progress bar - Using Script 1's design */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-white font-medium">
                      {completedTasks.length} of {steps.length} Tasks Completed
                    </div>
                    <div className="text-sm text-gray-400">
                      {steps.length > 0 ? Math.round((completedTasks.length / steps.length) * 100) : 0}% Complete
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
                      style={{ width: `${steps.length > 0 ? (completedTasks.length / steps.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="mb-8 space-y-4">
                  {steps.map((step: GatewayStep, index: number) => (
                    <GatewayTaskButton
                      key={step.id}
                      taskType={step.type}
                      taskNumber={index + 1}
                      onComplete={() => handleTaskComplete(step.id)}
                      creatorId={gateway?.creatorId || "unknown"}
                      gatewayId={gateway?.id || "unknown"}
                      content={step.content}
                    />
                  ))}
                </div>

                {/* Next stage button */}
                {allTasksCompleted && currentStage < totalStages && (
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

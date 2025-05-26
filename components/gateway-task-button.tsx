"use client"

import { useState, useEffect, useRef } from "react"

type StepType = "redirect" | "article" | "operagx" | "youtube" | "direct"

interface GatewayTaskButtonProps {
  taskType: StepType
  taskNumber: number
  onComplete: () => void
  creatorId: string
  gatewayId: string
  sessionId: string
  content?: {
    url?: string
    videoId?: string
  }
  secureAuth?: boolean
  apiEndpoint?: string
  isCompleted?: boolean
}

export function GatewayTaskButton({
  taskType,
  taskNumber,
  onComplete,
  creatorId,
  gatewayId,
  sessionId,
  content,
  secureAuth = false,
  apiEndpoint,
  isCompleted: initialIsCompleted = false,
}: GatewayTaskButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted)
  const [taskStarted, setTaskStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const taskFooterRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Update isCompleted if the prop changes
  useEffect(() => {
    setIsCompleted(initialIsCompleted)
  }, [initialIsCompleted])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Handle task completion
  const handleComplete = async () => {
    if (isCompleted) return

    setIsLoading(true)
    setError(null)

    // If secure auth is enabled, validate with the creator's API
    if (secureAuth && apiEndpoint) {
      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatewayId,
            creatorId,
            taskId: `task-${taskNumber}`,
            sessionId,
            timestamp: Date.now(),
          }),
        })

        const data = await response.json()

        if (!data.success) {
          setIsLoading(false)
          setError("Task validation failed. Please try again.")
          return
        }
      } catch (error) {
        console.error("Error validating task:", error)
        setIsLoading(false)
        setError("Task validation failed. Please try again.")
        return
      }
    }

    // Track task completion
    try {
      const taskId = `task-${taskNumber}`
      console.log(`Marking task ${taskId} as complete for session ${sessionId}`)

      const response = await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          creatorId,
          sessionId,
          action: "task_complete",
          taskId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        console.error("Error tracking task completion:", data.message || "Unknown error")
        setError("Failed to track task completion. Please try again.")
        setIsLoading(false)
        return
      }

      setIsCompleted(true)
      setIsLoading(false)
      onComplete()
    } catch (error) {
      console.error("Error tracking task completion:", error)
      setError("Failed to track task completion. Please try again.")
      setIsLoading(false)
    }
  }

  // Update the task handlers and timers
  const handleDirectLinkTask = () => {
    setTaskStarted(true)
    const url =
      content?.url ||
      `https://geometrydoomeddrone.com/az0utitpz4?key=883f2bc65de3ac114b8ad78247cfc0b3&creator=${creatorId}&gateway=${gatewayId}&sessionId=${sessionId}`
    window.open(url, "_blank")

    // Start countdown for completion (8 seconds for task 1)
    timerRef.current = setTimeout(() => {
      handleComplete()
    }, 8000) // 8 seconds for task 1
  }

  // Handle interstitial ad task
  const handleInterstitialTask = () => {
    setTaskStarted(true)

    // Create and load the ad script
    const script = document.createElement("script")
    script.src = "//acscdn.com/script/aclib.js"
    script.onload = () => {
      // @ts-ignore
      window.aclib?.runInterstitial({
        zoneId: "9962174",
        customParams: { creatorId, gatewayId, sessionId },
      })

      // Start countdown for completion (25 seconds for task 2)
      timerRef.current = setTimeout(() => {
        handleComplete()
      }, 25000) // 25 seconds for task 2
    }
    document.head.appendChild(script)
  }

  // Handle external validation task (Ad Maven)
  const handleExternalValidationTask = () => {
    setTaskStarted(true)

    // Generate a token for validation
    const token = Date.now().toString()
    const returnUrl = `${window.location.origin}/Task4/Redirect?gateway=${gatewayId}&creator=${creatorId}&token=${token}&sessionId=${sessionId}`

    // Open Ad Maven link
    window.open(
      `https://free-content.pro/s?TFleLfjA&creator=${creatorId}&gateway=${gatewayId}&sessionId=${sessionId}&redirect=${encodeURIComponent(returnUrl)}`,
      "_blank",
    )

    // For task 3, automatically complete after 20 seconds as requested
    timerRef.current = setTimeout(() => {
      handleComplete()
    }, 20000) // 20 seconds for task 3 as requested
  }

  // Handle AutoTag redirect task
  const handleAutoTagTask = () => {
    setTaskStarted(true)

    // Generate a token for validation
    const token = Date.now().toString()

    // Redirect to AutoTag page with session ID
    window.location.href = `/AutoTag?creator=${creatorId}&gateway=${gatewayId}&token=${token}&sessionId=${sessionId}`
  }

  // Handle footer validation task
  const handleFooterValidationTask = () => {
    setTaskStarted(true)

    if (taskFooterRef.current) {
      // Create and load the script
      const script = document.createElement("script")
      script.src = "https://cdn.work.ink/js/redirect.js?id=700"
      script.dataset.url = `https://work.ink/direct/700?creator=${creatorId}&gateway=${gatewayId}&sessionId=${sessionId}`
      script.dataset.ids = "TaskFooter"
      taskFooterRef.current.appendChild(script)

      // Start countdown for completion (10 seconds for task 5)
      timerRef.current = setTimeout(() => {
        handleComplete()
      }, 10000) // 10 seconds for task 5
    }
  }

  // Get task handler based on type
  const getTaskHandler = () => {
    switch (taskType) {
      case "redirect":
        return handleDirectLinkTask
      case "article":
        return handleInterstitialTask
      case "operagx":
        return handleExternalValidationTask
      case "youtube":
        return handleAutoTagTask
      case "direct":
        return handleFooterValidationTask
      default:
        return handleDirectLinkTask
    }
  }

  // Get task title based on type
  const getTaskTitle = () => {
    switch (taskType) {
      case "redirect":
        return "Direct Link Task"
      case "article":
        return "Interstitial Ad Task"
      case "operagx":
        return "External Validation Task"
      case "youtube":
        return "AutoTag Redirect Task"
      case "direct":
        return "Footer Validation Task"
      default:
        return `Task ${taskNumber}`
    }
  }

  // Get task description based on type
  const getTaskDescription = () => {
    switch (taskType) {
      case "redirect":
        return "Click the button to open a direct link in a new tab"
      case "article":
        return "Complete the interstitial ad to continue"
      case "operagx":
        return "Visit the external site and stay for at least 10 seconds"
      case "youtube":
        return "Complete the AutoTag redirect to continue"
      case "direct":
        return "Complete the footer validation to continue"
      default:
        return "Complete this task to continue"
    }
  }

  // Check for task completion in session on mount
  useEffect(() => {
    if (sessionId) {
      fetch(`/api/gateway/session?sessionId=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.session && data.session.completedTasks) {
            const taskId = `task-${taskNumber}`
            if (data.session.completedTasks.includes(taskId)) {
              console.log(`Task ${taskId} is already completed in session ${sessionId}`)
              setIsCompleted(true)
            }
          }
        })
        .catch((error) => {
          console.error("Error checking session:", error)
        })
    }
  }, [sessionId, taskNumber])

  return (
    <div
      className={`rounded-lg border-l-4 ${isCompleted ? "border-green-500 bg-green-900/20" : "border-[#ff3e3e] bg-[#1a1a1a]"} p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${isCompleted ? "bg-green-500" : "bg-[#ff3e3e]"} text-white`}
          >
            {isCompleted ? <i className="fas fa-check"></i> : taskNumber}
          </div>
          <h3 className="text-xl font-bold text-white">{getTaskTitle()}</h3>
        </div>
        {isCompleted && (
          <div className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">Completed</div>
        )}
      </div>

      <div className="mb-6">
        <p className="text-gray-400">{getTaskDescription()}</p>
        {error && (
          <div className="mt-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
            <i className="fas fa-exclamation-triangle mr-1"></i> {error}
          </div>
        )}
      </div>

      {!isCompleted && !taskStarted ? (
        <div className="text-center">
          <button
            onClick={getTaskHandler()}
            className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
          >
            <i className="fas fa-play mr-2"></i> Start Task {taskNumber}
          </button>
        </div>
      ) : !isCompleted && taskStarted ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block rounded-full bg-[#ff3e3e]/20 px-4 py-2 text-lg font-bold text-white">
              <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-block rounded-full bg-green-500/20 p-3">
            <i className="fas fa-check-circle text-2xl text-green-500"></i>
          </div>
        </div>
      )}

      {/* Task footer for footer validation task */}
      {taskType === "direct" && <div id="TaskFooter" ref={taskFooterRef}></div>}
    </div>
  )
}

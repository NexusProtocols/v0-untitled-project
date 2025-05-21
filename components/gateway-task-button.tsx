"use client"

import { useState, useEffect, useRef } from "react"

type StepType = "redirect" | "article" | "operagx" | "youtube" | "direct"

interface GatewayTaskButtonProps {
  taskType: StepType
  taskNumber: number
  onComplete: () => void
  creatorId: string
  gatewayId: string
  content?: {
    url?: string
    videoId?: string
  }
  secureAuth?: boolean
  apiEndpoint?: string
}

export function GatewayTaskButton({
  taskType,
  taskNumber,
  onComplete,
  creatorId,
  gatewayId,
  content,
  secureAuth = false,
  apiEndpoint,
}: GatewayTaskButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [taskStarted, setTaskStarted] = useState(false)
  const taskFooterRef = useRef<HTMLDivElement>(null)

  // Handle task completion
  const handleComplete = async () => {
    if (isCompleted) return

    setIsLoading(true)

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
            timestamp: Date.now(),
          }),
        })

        const data = await response.json()

        if (!data.success) {
          setIsLoading(false)
          alert("Task validation failed. Please try again.")
          return
        }
      } catch (error) {
        console.error("Error validating task:", error)
        setIsLoading(false)
        alert("Task validation failed. Please try again.")
        return
      }
    }

    // Track task completion
    try {
      await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          creatorId,
          action: "task_complete",
          taskId: `task-${taskNumber}`,
        }),
      })

      // Update session storage to mark this task as completed
      const sessionKey = `gateway_${gatewayId}_progress`
      const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
      progress.completedTasks = progress.completedTasks || []

      // Make sure we're using the correct task ID format
      const taskId = `task-${taskNumber}`
      if (!progress.completedTasks.includes(taskId)) {
        progress.completedTasks.push(taskId)
      }

      sessionStorage.setItem(sessionKey, JSON.stringify(progress))
    } catch (error) {
      console.error("Error tracking task completion:", error)
    }

    setIsCompleted(true)
    setIsLoading(false)
    onComplete()
  }

  // Update the task handlers and timers
  const handleDirectLinkTask = () => {
    setTaskStarted(true)
    const url =
      content?.url ||
      `https://geometrydoomeddrone.com/az0utitpz4?key=883f2bc65de3ac114b8ad78247cfc0b3&creator=${creatorId}&gateway=${gatewayId}`
    window.open(url, "_blank")

    // Start countdown for completion (8 seconds for task 1)
    const timer = setTimeout(() => {
      handleComplete()
    }, 8000) // 8 seconds for task 1

    return () => clearTimeout(timer)
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
        customParams: { creatorId, gatewayId },
      })

      // Start countdown for completion (25 seconds for task 2)
      const timer = setTimeout(() => {
        handleComplete()
      }, 25000) // 25 seconds for task 2

      return () => clearTimeout(timer)
    }
    document.head.appendChild(script)
  }

  // Handle external validation task (Ad Maven)
  const handleExternalValidationTask = () => {
    setTaskStarted(true)

    // Generate a token for validation
    const token = Date.now().toString()
    const returnUrl = `${window.location.origin}/Task4/Redirect?gateway=${gatewayId}&creator=${creatorId}&token=${token}`

    // Store token in sessionStorage with expiration
    const sessionKey = `gateway_${gatewayId}_progress`
    const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    progress.token = token
    progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))

    // Open Ad Maven link
    window.open(
      `https://free-content.pro/s?TFleLfjA&creator=${creatorId}&gateway=${gatewayId}&redirect=${encodeURIComponent(returnUrl)}`,
      "_blank",
    )

    // Check for validation every second
    const checkInterval = setInterval(() => {
      const updatedProgress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
      if (updatedProgress.completedTasks && updatedProgress.completedTasks.includes("task-4")) {
        clearInterval(checkInterval)
        handleComplete()
      }
    }, 1000)

    // Clear interval after 5 minutes to prevent memory leaks
    setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000)
  }

  // Handle AutoTag redirect task
  const handleAutoTagTask = () => {
    setTaskStarted(true)

    // Generate a token for validation
    const token = Date.now().toString()

    // Store token in sessionStorage with expiration
    const sessionKey = `gateway_${gatewayId}_progress`
    const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    progress.token = token
    progress.expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
    progress.currentTask = "task-4"
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))

    // Redirect to AutoTag page
    window.location.href = `/AutoTag?creator=${creatorId}&gateway=${gatewayId}&token=${token}`
  }

  // Handle footer validation task
  const handleFooterValidationTask = () => {
    setTaskStarted(true)

    if (taskFooterRef.current) {
      // Create and load the script
      const script = document.createElement("script")
      script.src = "https://cdn.work.ink/js/redirect.js?id=700"
      script.dataset.url = `https://work.ink/direct/700?creator=${creatorId}&gateway=${gatewayId}`
      script.dataset.ids = "TaskFooter"
      taskFooterRef.current.appendChild(script)

      // Start countdown for completion (10 seconds for task 5)
      const timer = setTimeout(() => {
        handleComplete()
      }, 10000) // 10 seconds for task 5

      return () => clearTimeout(timer)
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

  // Check for token in URL for external validation task
  useEffect(() => {
    if (taskType === "operagx") {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")
      const storedToken = localStorage.getItem("task3_token")

      if (token && storedToken && token === storedToken) {
        localStorage.setItem("task3_verified", "true")
        localStorage.removeItem("task3_token")
        handleComplete()
      }
    }
  }, [taskType])

  // Update the render function to not show countdown timer
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

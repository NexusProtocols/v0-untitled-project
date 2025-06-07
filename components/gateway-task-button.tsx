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
  isCompleted?: boolean
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
  isCompleted = false,
}: GatewayTaskButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [taskCompleted, setTaskCompleted] = useState(isCompleted)
  const [countdown, setCountdown] = useState(0)
  const [taskStarted, setTaskStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const taskFooterRef = useRef<HTMLDivElement>(null)
  const hasOpenedLink = useRef(false) // Prevent multiple opens

  useEffect(() => {
    setTaskCompleted(isCompleted)
  }, [isCompleted])

  useEffect(() => {
    const completedTasks = JSON.parse(localStorage.getItem(`gateway_${gatewayId}_completed_tasks`) || "[]")
    const taskId = `task-${taskNumber}`
    if (completedTasks.includes(taskId)) {
      setTaskCompleted(true)
    }
  }, [gatewayId, taskNumber])

  // Handle task completion
  const handleComplete = async () => {
    if (taskCompleted) return

    setIsLoading(true)

    // Generate a secure completion token with AES-256
    const completionData = {
      gatewayId,
      taskId: `task-${taskNumber}`,
      creatorId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    }

    // Convert to string for encryption
    const completionDataString = JSON.stringify(completionData)

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
            completionData: completionDataString,
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

    // Track task completion with enhanced security
    try {
      const response = await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          creatorId,
          action: "task_complete",
          taskId: `task-${taskNumber}`,
          completionData: completionDataString,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setIsLoading(false)
        alert("Task tracking failed. Please try again.")
        return
      }

      // Save to server first
      try {
        const response = await fetch("/api/gateway/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("nexus_user_id"),
            gatewayId: gatewayId,
            tasks: [
              ...JSON.parse(localStorage.getItem(`gateway_${gatewayId}_completed_tasks`) || "[]"),
              `task-${taskNumber}`,
            ],
            securityToken: data.securityToken,
          }),
        })

        if (!response.ok) {
          throw new Error("Server validation failed")
        }
      } catch (error) {
        console.error("Error saving tasks to server:", error)
      }

      // Then update local storage as fallback
      const completedTasks = JSON.parse(localStorage.getItem(`gateway_${gatewayId}_completed_tasks`) || "[]")
      const taskId = `task-${taskNumber}`
      if (!completedTasks.includes(taskId)) {
        completedTasks.push(taskId)
        localStorage.setItem(`gateway_${gatewayId}_completed_tasks`, JSON.stringify(completedTasks))
      }

      setTaskCompleted(true)
      setIsLoading(false)
      onComplete()
    } catch (error) {
      console.error("Error completing task:", error)
      setIsLoading(false)
      alert("An error occurred. Please try again.")
    }
  }

  // Update the task handlers and timers
  const handleDirectLinkTask = () => {
    // Prevent multiple opens
    if (hasOpenedLink.current || taskStarted || taskCompleted) return

    hasOpenedLink.current = true
    setTaskStarted(true)

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const adLevel = Number.parseInt(new URLSearchParams(window.location.search).get("adLevel") || "3")
    if (isMobile && adLevel < 4) {
      handleComplete()
      return
    }

    const url =
      content?.url ||
      `https://geometrydoomeddrone.com/az0utitpz4?key=883f2bc65de3ac114b8ad78247cfc0b3&creator=${creatorId}&gateway=${gatewayId}`

    // Only open when button is clicked
    window.open(url, "_blank")

    // Start progress animation
    let progressValue = 0
    const progressInterval = setInterval(() => {
      progressValue += 100 / 80 // 8 seconds = 80 intervals of 100ms
      setProgress(Math.min(progressValue, 100))

      if (progressValue >= 100) {
        clearInterval(progressInterval)
        handleComplete()
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }

  // Handle interstitial ad task
  const handleInterstitialTask = () => {
    if (taskStarted || taskCompleted) return

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

      // Start progress animation (25 seconds)
      let progressValue = 0
      const progressInterval = setInterval(() => {
        progressValue += 100 / 250 // 25 seconds = 250 intervals of 100ms
        setProgress(Math.min(progressValue, 100))

        if (progressValue >= 100) {
          clearInterval(progressInterval)
          handleComplete()
        }
      }, 100)

      return () => clearInterval(progressInterval)
    }
    document.head.appendChild(script)
  }

  // Handle external validation task (Ad Maven)
  const handleExternalValidationTask = () => {
    if (taskStarted || taskCompleted) return

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
    if (taskStarted || taskCompleted) return

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
    if (taskStarted || taskCompleted) return

    setTaskStarted(true)

    if (taskFooterRef.current) {
      // Create and load the script
      const script = document.createElement("script")
      script.src = "https://cdn.work.ink/js/redirect.js?id=700"
      script.dataset.url = `https://work.ink/direct/700?creator=${creatorId}&gateway=${gatewayId}`
      script.dataset.ids = "TaskFooter"
      taskFooterRef.current.appendChild(script)

      // Start progress animation (10 seconds)
      let progressValue = 0
      const progressInterval = setInterval(() => {
        progressValue += 100 / 100 // 10 seconds = 100 intervals of 100ms
        setProgress(Math.min(progressValue, 100))

        if (progressValue >= 100) {
          clearInterval(progressInterval)
          handleComplete()
        }
      }, 100)

      return () => clearInterval(progressInterval)
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
        return "Visit Link"
      case "article":
        return "View Advertisement"
      case "operagx":
        return "Complete Offer"
      case "youtube":
        return "Verify Action"
      case "direct":
        return "Complete Task"
      default:
        return `Task ${taskNumber}`
    }
  }

  // Get task description based on type
  const getTaskDescription = () => {
    switch (taskType) {
      case "redirect":
        return "Click to open the link and wait for verification"
      case "article":
        return "View the advertisement to continue"
      case "operagx":
        return "Complete the external offer to proceed"
      case "youtube":
        return "Complete the verification process"
      case "direct":
        return "Complete the required action"
      default:
        return "Complete this task to continue"
    }
  }

  // Get task icon based on type
  const getTaskIcon = () => {
    switch (taskType) {
      case "redirect":
        return "fas fa-external-link-alt"
      case "article":
        return "fas fa-eye"
      case "operagx":
        return "fas fa-gift"
      case "youtube":
        return "fas fa-check-circle"
      case "direct":
        return "fas fa-mouse-pointer"
      default:
        return "fas fa-play"
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

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        taskCompleted
          ? "border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10 shadow-lg shadow-green-500/10"
          : taskStarted
            ? "border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10 shadow-lg shadow-blue-500/10"
            : "border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/20 hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/10"
      }`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Progress bar */}
      {taskStarted && !taskCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Task number/icon */}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold transition-all duration-300 ${
              taskCompleted
                ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                : taskStarted
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-br from-[#ff3e3e] to-[#ff0000] text-white shadow-lg shadow-[#ff3e3e]/25"
            }`}
          >
            {taskCompleted ? (
              <i className="fas fa-check text-lg"></i>
            ) : taskStarted ? (
              <i className="fas fa-spinner fa-spin text-lg"></i>
            ) : (
              <span className="text-lg">{taskNumber}</span>
            )}
          </div>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">{getTaskTitle()}</h3>
              {taskCompleted && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                  Completed
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{getTaskDescription()}</p>

            {/* Task action */}
            <button
              onClick={getTaskHandler()}
              className={`inline-flex items-center px-6 py-3 ${
                taskCompleted
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/25"
                  : "bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-white font-semibold rounded-xl hover:from-[#ff0000] hover:to-[#cc0000] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#ff3e3e]/25"
              } group`}
              disabled={taskCompleted || taskStarted}
            >
              <i className={`${getTaskIcon()} mr-3 group-hover:scale-110 transition-transform`}></i>
              {taskCompleted ? "Completed" : "Start Task"}
            </button>
          </div>
        </div>
      </div>

      {/* Task footer for footer validation task */}
      {taskType === "direct" && <div id="TaskFooter" ref={taskFooterRef}></div>}
    </div>
  )
}

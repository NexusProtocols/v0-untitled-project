"use client"

import { useState } from "react"

interface GatewayTaskButtonProps {
  taskType: string
  taskNumber: number
  onComplete: () => void
  creatorId: string
  gatewayId: string
  content?: {
    url?: string
    videoId?: string
    downloadUrl?: string
    customHtml?: string
  }
}

export function GatewayTaskButton({
  taskType,
  taskNumber,
  onComplete,
  creatorId,
  gatewayId,
  content = {},
}: GatewayTaskButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Handle task completion
  const handleComplete = async () => {
    if (isLoading || isCompleted) return

    setIsLoading(true)

    try {
      // Track task completion
      await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          taskId: `task-${taskNumber}`,
          action: "task_complete",
          userData: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            taskType,
            taskNumber,
            creatorId,
          },
        }),
      }).catch(() => {
        // Silently fail - we don't want to block the user if tracking fails
        console.log("Failed to track task completion, but continuing...")
      })

      // Simulate a delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      setIsCompleted(true)
      onComplete()
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle task action (e.g., opening a link)
  const handleTaskAction = () => {
    // Start countdown timer
    let count = 5
    setCountdown(count)

    const timer = setInterval(() => {
      count -= 1
      setCountdown(count)

      if (count <= 0) {
        clearInterval(timer)
        // Auto-complete after countdown
        handleComplete()
      }
    }, 1000)

    // Open link in new tab if available
    if (content?.url) {
      try {
        window.open(content.url, "_blank", "noopener,noreferrer")
      } catch (error) {
        console.error("Failed to open URL:", error)
        // If opening the URL fails, we'll still allow the user to complete the task
      }
    }
  }

  // Get task icon based on type
  const getTaskIcon = () => {
    switch (taskType) {
      case "redirect":
        return "fa-external-link-alt"
      case "article":
        return "fa-newspaper"
      case "operagx":
        return "fa-opera"
      case "youtube":
        return "fa-youtube"
      case "direct":
        return "fa-link"
      default:
        return "fa-check"
    }
  }

  // Get task label based on type
  const getTaskLabel = () => {
    switch (taskType) {
      case "redirect":
        return "Visit Website"
      case "article":
        return "Read Article"
      case "operagx":
        return "Install Opera GX"
      case "youtube":
        return "Watch Video"
      case "direct":
        return "Complete Task"
      default:
        return "Complete Task"
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4 transition-all hover:border-[#ff3e3e]/30 hover:shadow-[0_0_15px_-3px_rgba(255,62,62,0.3)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff3e3e]/20 text-[#ff3e3e]">
            {taskNumber}
          </div>
          <div>
            <h3 className="font-medium text-white">{getTaskLabel()}</h3>
            <p className="text-xs text-gray-400">
              {isCompleted
                ? "Task completed"
                : countdown > 0 && countdown < 5
                  ? `Completing in ${countdown}s...`
                  : "Complete this task to progress"}
            </p>
          </div>
        </div>
        {isCompleted ? (
          <div className="rounded-full bg-green-500/20 p-2 text-green-500">
            <i className="fas fa-check"></i>
          </div>
        ) : (
          <button
            onClick={isLoading ? undefined : countdown < 5 ? handleComplete : handleTaskAction}
            disabled={isLoading}
            className="interactive-element rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Processing...</span>
              </div>
            ) : countdown < 5 && countdown > 0 ? (
              <span>Complete ({countdown}s)</span>
            ) : (
              <>
                <i className={`fas ${getTaskIcon()} mr-2`}></i>
                {getTaskLabel()}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

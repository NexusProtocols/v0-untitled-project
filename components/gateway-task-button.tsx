"use client"

import { useState, useEffect } from "react"
import { DIRECT_LINK } from "@/lib/ad-utils"

interface GatewayTaskButtonProps {
  taskType: "redirect" | "article" | "operagx" | "youtube" | "direct"
  taskNumber: number
  onComplete: () => void
  creatorId: string
  gatewayId: string
  content?: {
    url?: string
    videoId?: string
    title?: string
    description?: string
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
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Handle loading animation
  useEffect(() => {
    if (isActive && !isCompleted && loadingProgress < 100) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 100) {
            clearInterval(interval)
            // Don't call onComplete here - we'll do it in a separate useEffect
            return 100
          }
          return newProgress
        })
      }, 300) // Adjust speed as needed
      return () => clearInterval(interval)
    }
  }, [isActive, isCompleted, loadingProgress])

  // Handle completion in a separate useEffect to avoid setState during render
  useEffect(() => {
    if (loadingProgress >= 100 && !isCompleted) {
      setIsCompleted(true)
      onComplete()
    }
  }, [loadingProgress, isCompleted, onComplete])

  // Handle task activation
  const handleActivate = async () => {
    if (isCompleted) return

    setIsActive(true)
    setIsLoading(true)

    try {
      // For direct link, get the encrypted link from the server
      if (taskType === "direct") {
        const response = await fetch(`/api/direct-link?gatewayId=${gatewayId}&creatorId=${creatorId}&token=valid`)
        const data = await response.json()

        if (data.success) {
          // Open the direct link in a new tab
          window.open(DIRECT_LINK, "_blank")
        }
      } else if (taskType === "redirect") {
        // Open the redirect URL in a new tab
        if (content.url) {
          window.open(content.url, "_blank")
        }
      } else if (taskType === "operagx") {
        // Open the Opera GX download page
        window.open("https://www.opera.com/gx", "_blank")
      } else if (taskType === "youtube") {
        // Open the YouTube video
        if (content.videoId) {
          window.open(`https://www.youtube.com/watch?v=${content.videoId}`, "_blank")
        }
      } else if (taskType === "article") {
        // Open the article URL
        if (content.url) {
          window.open(content.url, "_blank")
        }
      }
    } catch (error) {
      console.error("Error activating task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get task icon
  const getTaskIcon = () => {
    switch (taskType) {
      case "redirect":
        return "fas fa-external-link-alt"
      case "article":
        return "fas fa-newspaper"
      case "operagx":
        return "fas fa-gamepad"
      case "youtube":
        return "fab fa-youtube"
      case "direct":
        return "fas fa-link"
      default:
        return "fas fa-check"
    }
  }

  // Get task title
  const getTaskTitle = () => {
    switch (taskType) {
      case "redirect":
        return content.title || "Visit Website"
      case "article":
        return content.title || "Read Article"
      case "operagx":
        return "Download Opera GX"
      case "youtube":
        return content.title || "Watch Video"
      case "direct":
        return "Visit Sponsor"
      default:
        return "Complete Task"
    }
  }

  // Get task description
  const getTaskDescription = () => {
    switch (taskType) {
      case "redirect":
        return content.description || "Visit this website to continue"
      case "article":
        return content.description || "Read this article to continue"
      case "operagx":
        return "Download Opera GX browser to continue"
      case "youtube":
        return content.description || "Watch this video to continue"
      case "direct":
        return "Visit our sponsor to continue"
      default:
        return "Complete this task to continue"
    }
  }

  return (
    <div
      className={`rounded-lg border ${
        isCompleted
          ? "border-green-500/30 bg-[#050505]"
          : isActive
            ? "border-[#ff3e3e] bg-[#0a0a0a]"
            : "border-white/10 bg-[#050505]"
      } p-4 transition-all hover:bg-[#0a0a0a] ${isCompleted ? "" : "hover:scale-[1.02]"}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
            isCompleted ? "bg-green-500/20" : isActive ? "bg-[#ff3e3e]/20" : "bg-[#1a1a1a]"
          }`}
        >
          <i
            className={`${getTaskIcon()} ${
              isCompleted ? "text-green-400" : isActive ? "text-[#ff3e3e]" : "text-gray-400"
            } text-xl`}
          ></i>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">
            Task {taskNumber}: {getTaskTitle()}
          </h4>
          <p className="text-sm text-gray-400">{getTaskDescription()}</p>
        </div>
        {isCompleted ? (
          <div className="rounded bg-green-500/20 px-3 py-1 text-sm text-green-400">
            <i className="fas fa-check mr-1"></i> Completed
          </div>
        ) : isActive ? (
          <div className="text-center">
            <div className="w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleActivate}
            disabled={isLoading}
            className="interactive-element rounded bg-[#1a1a1a] px-3 py-1 text-sm text-white hover:bg-[#ff3e3e]/80"
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Start"
            )}
          </button>
        )}
      </div>
    </div>
  )
}

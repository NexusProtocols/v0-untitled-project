"use client"

import { useState, useEffect } from "react"
import { SecureAd } from "./secure-ad"

interface GatewayTaskButtonProps {
  taskType: string
  taskNumber: number
  onComplete: () => void
  creatorId: string
  gatewayId: string
  content?: {
    url?: string
    videoId?: string
  }
}

export function GatewayTaskButton({
  taskType,
  taskNumber,
  onComplete,
  creatorId,
  gatewayId,
  content,
}: GatewayTaskButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(15) // 15 seconds countdown

  // Handle task completion
  const handleComplete = async () => {
    if (isCompleted) return

    setIsLoading(true)

    try {
      // In a real implementation, send a request to the server
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Track task completion
      try {
        // In a real implementation, send a request to the server
        // For now, just log to console
        console.log(`Task ${taskNumber} completed for gateway ${gatewayId} by creator ${creatorId}`)
      } catch (error) {
        console.error("Error tracking task completion:", error)
      }

      setIsCompleted(true)
      onComplete()
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle task expansion
  const handleExpand = () => {
    if (isCompleted) return
    setIsExpanded(true)

    // Start countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Clean up interval
    return () => clearInterval(interval)
  }

  // Auto-complete when countdown reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && isExpanded && !isCompleted) {
      handleComplete()
    }
  }, [timeRemaining, isExpanded, isCompleted])

  // Render task content based on type
  const renderTaskContent = () => {
    if (!isExpanded) return null

    switch (taskType) {
      case "redirect":
        return (
          <div className="mt-4 rounded bg-[#0a0a0a] p-4">
            <p className="mb-4 text-gray-400">
              Please wait while we prepare your redirect. You will be able to complete this task in{" "}
              <span className="font-bold text-white">{timeRemaining}</span> seconds.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] transition-all duration-1000"
                  style={{ width: `${((15 - timeRemaining) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center">
              <SecureAd adType="BANNER_300x250" creatorId={creatorId} />
            </div>
            {content?.url && (
              <div className="mt-4 text-center">
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff3e3e] hover:underline"
                  onClick={(e) => {
                    // Prevent default if countdown is not complete
                    if (timeRemaining > 0) {
                      e.preventDefault()
                    }
                  }}
                >
                  {timeRemaining === 0 ? "Click here to visit the website" : "Please wait..."}
                </a>
              </div>
            )}
          </div>
        )

      case "article":
        return (
          <div className="mt-4 rounded bg-[#0a0a0a] p-4">
            <p className="mb-4 text-gray-400">
              Please read the article below. You will be able to complete this task in{" "}
              <span className="font-bold text-white">{timeRemaining}</span> seconds.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] transition-all duration-1000"
                  style={{ width: `${((15 - timeRemaining) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="mb-4 rounded border border-white/10 bg-[#050505] p-4">
              <h3 className="mb-2 text-lg font-bold text-white">Sample Article Title</h3>
              <p className="text-gray-400">
                This is a sample article content. In a real implementation, this would be actual content from the
                creator. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam
                ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
              </p>
            </div>
            <div className="flex justify-center">
              <SecureAd adType="BANNER_300x250" creatorId={creatorId} />
            </div>
          </div>
        )

      case "youtube":
        return (
          <div className="mt-4 rounded bg-[#0a0a0a] p-4">
            <p className="mb-4 text-gray-400">
              Please watch the video below. You will be able to complete this task in{" "}
              <span className="font-bold text-white">{timeRemaining}</span> seconds.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] transition-all duration-1000"
                  style={{ width: `${((15 - timeRemaining) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            {content?.videoId ? (
              <div className="mb-4 aspect-video w-full overflow-hidden rounded">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${content.videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="mb-4 flex aspect-video w-full items-center justify-center rounded bg-[#050505]">
                <p className="text-gray-500">Video not available</p>
              </div>
            )}
            <div className="flex justify-center">
              <SecureAd adType="BANNER_300x250" creatorId={creatorId} />
            </div>
          </div>
        )

      case "operagx":
        return (
          <div className="mt-4 rounded bg-[#0a0a0a] p-4">
            <p className="mb-4 text-gray-400">
              Please complete the Opera GX offer. You will be able to complete this task in{" "}
              <span className="font-bold text-white">{timeRemaining}</span> seconds.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] transition-all duration-1000"
                  style={{ width: `${((15 - timeRemaining) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="mb-4 rounded border border-[#ff3e3e]/20 bg-[#050505] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 rounded bg-[#ff3e3e]">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Opera GX"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Opera GX</h3>
                    <p className="text-sm text-gray-400">Gaming Browser</p>
                  </div>
                </div>
                <a
                  href="#"
                  className="rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
                  onClick={(e) => {
                    e.preventDefault()
                    // In a real implementation, this would open the Opera GX offer
                    alert("This would open the Opera GX offer in a real implementation")
                  }}
                >
                  Download
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <SecureAd adType="BANNER_300x250" creatorId={creatorId} />
            </div>
          </div>
        )

      case "direct":
      default:
        return (
          <div className="mt-4 rounded bg-[#0a0a0a] p-4">
            <p className="mb-4 text-gray-400">
              Please wait while we prepare your task. You will be able to complete this task in{" "}
              <span className="font-bold text-white">{timeRemaining}</span> seconds.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] transition-all duration-1000"
                  style={{ width: `${((15 - timeRemaining) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center">
              <SecureAd adType="BANNER_300x250" creatorId={creatorId} />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4 transition-all hover:border-[#ff3e3e]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full ${
              isCompleted
                ? "bg-green-500 text-white"
                : isExpanded
                  ? "bg-[#ff3e3e] text-white"
                  : "bg-[#0a0a0a] text-gray-400"
            }`}
          >
            {isCompleted ? <i className="fas fa-check"></i> : <span className="text-sm font-medium">{taskNumber}</span>}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              {getTaskTitle(taskType)} {isCompleted && <span className="text-green-500">(Completed)</span>}
            </h3>
            <p className="text-sm text-gray-400">{getTaskDescription(taskType)}</p>
          </div>
        </div>
        {!isExpanded ? (
          <button
            onClick={handleExpand}
            disabled={isCompleted}
            className={`rounded px-4 py-2 font-medium transition-all ${
              isCompleted ? "cursor-not-allowed bg-green-500 text-white" : "bg-[#ff3e3e] text-white hover:bg-[#ff0000]"
            }`}
          >
            {isCompleted ? "Completed" : "Start Task"}
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCompleted || timeRemaining > 0 || isLoading}
            className={`rounded px-4 py-2 font-medium transition-all ${
              isCompleted
                ? "cursor-not-allowed bg-green-500 text-white"
                : timeRemaining > 0
                  ? "cursor-not-allowed bg-gray-700 text-gray-300"
                  : isLoading
                    ? "cursor-not-allowed bg-[#ff3e3e] text-white"
                    : "bg-[#ff3e3e] text-white hover:bg-[#ff0000]"
            }`}
          >
            {isCompleted ? (
              "Completed"
            ) : isLoading ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : timeRemaining > 0 ? (
              `Wait ${timeRemaining}s`
            ) : (
              "Complete Task"
            )}
          </button>
        )}
      </div>

      {renderTaskContent()}
    </div>
  )
}

// Helper functions to get task title and description
function getTaskTitle(taskType: string): string {
  switch (taskType) {
    case "redirect":
      return "Visit Website"
    case "article":
      return "Read Article"
    case "operagx":
      return "Opera GX Offer"
    case "youtube":
      return "Watch Video"
    case "direct":
    default:
      return "Complete Task"
  }
}

function getTaskDescription(taskType: string): string {
  switch (taskType) {
    case "redirect":
      return "Visit a website to complete this task"
    case "article":
      return "Read an article to complete this task"
    case "operagx":
      return "Complete an Opera GX offer to proceed"
    case "youtube":
      return "Watch a YouTube video to complete this task"
    case "direct":
    default:
      return "Complete this task to proceed"
  }
}

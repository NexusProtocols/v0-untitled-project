"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
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
  const [userId, setUserId] = useState<string>("")

  // Multi-stage gateway
  const totalStages = gateway?.stages?.length || 1
  const [currentStage, setCurrentStage] = useState(-1) // Start at -1 for CAPTCHA pre-stage
  const [stagesCompleted, setStagesCompleted] = useState<boolean[]>([])
  const [readyToComplete, setReadyToComplete] = useState(false)

  // Generate or get a unique user ID for tracking progress
  useEffect(() => {
    // Try to get existing user ID from localStorage
    let existingUserId = localStorage.getItem("nexus_user_id")

    // If no user ID exists, create one
    if (!existingUserId) {
      existingUserId = uuidv4()
      localStorage.setItem("nexus_user_id", existingUserId)
    }

    setUserId(existingUserId)
  }, [])

  // Fetch gateway data
  useEffect(() => {
    const fetchGateway = async () => {
      if (!userId) return // Wait for userId to be set

      try {
        setIsLoading(true)

        // Track gateway visit
        try {
          await fetch("/api/gateway/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gatewayId: params.gatewayId,
              userId: userId,
            }),
          })
        } catch (error) {
          console.error("Error tracking gateway visit:", error)
        }

        // Try to fetch from Supabase via API
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
          console.error("Error fetching from database:", error)
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

        // Try to fetch user progress from Supabase
        try {
          const response = await fetch(`/api/gateway/progress?userId=${userId}&gatewayId=${params.gatewayId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.progress) {
              // Restore progress from database
              const progress = data.progress

              if (progress.completedTasks && progress.completedTasks.length > 0) {
                setCompletedTasks(progress.completedTasks)
              }

              if (progress.currentStage !== undefined) {
                setCurrentStage(progress.currentStage)

                // Mark completed stages as green (but not the current stage unless it's completed)
                for (let i = 0; i < progress.currentStage; i++) {
                  stagesCompletedArray[i] = true
                }
                setStagesCompleted([...stagesCompletedArray])

                // If we're past the CAPTCHA stage, mark it as completed
                if (progress.currentStage >= 0) {
                  setCaptchaValidated(true)
                }

                // If we're in a task stage, show tasks
                if (progress.currentStage > 0) {
                  setShowTasks(true)
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching progress from database:", error)
        }

        // Fallback to localStorage for progress
        if (currentStage === -1) {
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
        }

        // Try to fetch completed tasks from Supabase
        try {
          const response = await fetch(`/api/gateway/tasks?userId=${userId}&gatewayId=${params.gatewayId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.tasks && data.tasks.length > 0) {
              setCompletedTasks(data.tasks)
            }
          }
        } catch (error) {
          console.error("Error fetching completed tasks from database:", error)
        }

        // Fallback to localStorage for completed tasks
        if (completedTasks.length === 0) {
          const storedCompletedTasks = localStorage.getItem(`gateway_${params.gatewayId}_completed_tasks`)
          if (storedCompletedTasks) {
            const tasks = JSON.parse(storedCompletedTasks)
            setCompletedTasks(tasks)
          }
        }

        // Check URL parameters for task completion
        const searchParams = new URLSearchParams(window.location.search)
        const completedTask = searchParams.get("task")
        const isCompleted = searchParams.get("completed") === "true"

        if (completedTask && isCompleted && !completedTasks.includes(`task-${completedTask}`)) {
          handleTaskComplete(`task-${completedTask}`)
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("An error occurred while fetching the gateway")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchGateway()
    }
  }, [params.gatewayId, userId])

  // Update the useEffect that handles stage completion to prevent skipping stages
  // Replace the existing useEffect that checks if all tasks are completed with this enhanced version:

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
      } else {
        // For non-final stages, prepare for next stage but don't auto-advance
        // This prevents skipping stages
        const newStagesCompleted = [...stagesCompleted]
        newStagesCompleted[currentStage] = true
        setStagesCompleted(newStagesCompleted)
      }
    }
  }, [completedTasks, gateway, showTasks, currentStage, totalStages, stagesCompleted])

  // Add a new function to handle stage advancement with secure validation
  const advanceToNextStage = async () => {
    if (!allTasksCompleted) return

    // Create a secure validation token using AES-256
    const timestamp = Date.now()
    const stageData = {
      gatewayId: params.gatewayId,
      userId: userId,
      currentStage: currentStage,
      nextStage: currentStage + 1,
      timestamp: timestamp,
    }

    // Convert to string for encryption
    const stageDataString = JSON.stringify(stageData)

    try {
      // Encrypt the stage data for secure transmission
      const response = await fetch("/api/gateway/validate-stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stageData: stageDataString,
          validationToken: validationToken,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        console.error("Stage validation failed:", data.error)
        return
      }

      // Proceed to next stage
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)
      setShowTasks(true)
      setAllTasksCompleted(false)

      // Update progress in database
      await fetch("/api/gateway/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          gatewayId: params.gatewayId,
          progress: {
            captchaValidated: true,
            currentStage: nextStage,
            completedTasks: completedTasks,
          },
        }),
      })

      // Update local storage as fallback
      const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
      const progress = {
        captchaValidated: true,
        currentStage: nextStage,
        completedTasks: completedTasks,
      }
      localStorage.setItem(persistentKey, JSON.stringify(progress))
    } catch (error) {
      console.error("Error advancing stage:", error)
    }
  }

  // Add a function to handle gateway completion with secure validation
  const completeGateway = async () => {
    if (!readyToComplete) return

    setIsLoading(true)

    try {
      // Create a secure completion token using AES-256
      const completionData = {
        gatewayId: params.gatewayId,
        userId: userId,
        completedStages: totalStages,
        timestamp: Date.now(),
      }

      // Convert to string for encryption
      const completionDataString = JSON.stringify(completionData)

      // Send completion request with encrypted data
      const response = await fetch("/api/gateway/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completionData: completionDataString,
          validationToken: validationToken,
          userId: userId,
          gatewayId: params.gatewayId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        console.error("Gateway completion failed:", data.error)
        setIsLoading(false)
        return
      }

      // Mark all stages as completed
      const allCompleted = Array(totalStages + 1).fill(true)
      setStagesCompleted(allCompleted)

      // Show final reward
      setShowFinalReward(true)
      setValidationToken(data.token)

      // Scroll to reward
      setTimeout(() => {
        if (rewardRef.current) {
          rewardRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 500)
    } catch (error) {
      console.error("Error completing gateway:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle CAPTCHA validation
  const handleCaptchaValidated = async (token: string) => {
    setCaptchaValidated(true)
    setValidationToken(token)
    setCurrentStage(0) // Move to stage 0 (pre-stage)

    const newStagesCompleted = [...stagesCompleted]
    newStagesCompleted[0] = true // Mark CAPTCHA as completed
    setStagesCompleted(newStagesCompleted)

    // Store progress in Supabase
    try {
      await fetch("/api/gateway/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          gatewayId: params.gatewayId,
          progress: {
            captchaValidated: true,
            currentStage: 0,
            completedTasks: [],
          },
        }),
      })
    } catch (error) {
      console.error("Error saving progress to database:", error)
    }

    // Fallback to localStorage
    const persistentKey = `gateway_${params.gatewayId}_persistent_progress`
    const progress = {
      captchaValidated: true,
      currentStage: 0,
      completedTasks: [],
    }
    localStorage.setItem(persistentKey, JSON.stringify(progress))
  }

  // Handle task completion
  const handleTaskComplete = async (taskId: string) => {
    const updatedTasks = [...completedTasks, taskId]
    setCompletedTasks(updatedTasks)

    // Store completed tasks in Supabase
    try {
      await fetch("/api/gateway/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          gatewayId: params.gatewayId,
          tasks: updatedTasks,
        }),
      })
    } catch (error) {
      console.error("Error saving tasks to database:", error)
    }

    // Update progress in Supabase
    try {
      const progress = {
        captchaValidated: true,
        currentStage: currentStage,
        completedTasks: updatedTasks,
      }

      await fetch("/api/gateway/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          gatewayId: params.gatewayId,
          progress: progress,
        }),
      })
    } catch (error) {
      console.error("Error saving progress to database:", error)
    }
  }
}

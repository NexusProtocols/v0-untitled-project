"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { Gateway } from "@/types/gateway"
import type { Stage } from "@/types/stage"
import GatewayHeader from "@/components/GatewayHeader"
import GatewayFooter from "@/components/GatewayFooter"
import TaskList from "@/components/TaskList"
import { useSession } from "next-auth/react"

async function getGateway(scriptId: string): Promise<Gateway | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gateway/${scriptId}`, { cache: "no-store" })

    if (!res.ok) {
      return undefined
    }

    return res.json()
  } catch (error) {
    console.log("Failed to fetch gateway", error)
    return undefined
  }
}

const KeyGateway = () => {
  const { scriptId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [gateway, setGateway] = useState<Gateway | undefined>(undefined)
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [allTasksCompleted, setAllTasksCompleted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadGateway = async () => {
      if (!scriptId) return

      const fetchedGateway = await getGateway(scriptId as string)
      if (fetchedGateway) {
        setGateway(fetchedGateway)
      } else {
        // Redirect to a "not found" page or display an error message
        router.push("/not-found")
      }
      setIsLoading(false)
    }

    loadGateway()
  }, [scriptId, router])

  useEffect(() => {
    if (!scriptId) return

    const sessionKey = `gateway_${scriptId}_progress`
    const storedProgress = sessionStorage.getItem(sessionKey)

    if (storedProgress) {
      try {
        const progress = JSON.parse(storedProgress)
        setCurrentStage(progress.currentStage || 1)
        setCompletedTasks(progress.completedTasks || [])
      } catch (error) {
        console.error("Error parsing stored progress:", error)
      }
    }
  }, [scriptId])

  useEffect(() => {
    if (!gateway?.stages) return

    const stage = gateway.stages[currentStage - 1]
    if (!stage) return

    if (completedTasks.length === stage.taskCount) {
      setAllTasksCompleted(true)
    } else {
      setAllTasksCompleted(false)
    }
  }, [completedTasks, currentStage, gateway])

  useEffect(() => {
    if (!scriptId) return

    const sessionKey = `gateway_${scriptId}_progress`
    const progress = { currentStage, completedTasks }
    sessionStorage.setItem(sessionKey, JSON.stringify(progress))
  }, [currentStage, completedTasks, scriptId])

  // Add this useEffect to check for task completion in URL parameters
  useEffect(() => {
    // Check URL parameters for task completion
    const searchParams = new URLSearchParams(window.location.search)
    const completedTask = searchParams.get("task")
    const isCompleted = searchParams.get("completed") === "true"

    if (completedTask && isCompleted) {
      const taskId = `task-${completedTask}`

      // Only add if not already in the completed tasks
      if (!completedTasks.includes(taskId)) {
        const updatedTasks = [...completedTasks, taskId]
        setCompletedTasks(updatedTasks)

        // Update session storage
        const sessionKey = `gateway_${scriptId}_progress`
        const progress = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
        progress.completedTasks = updatedTasks
        sessionStorage.setItem(sessionKey, JSON.stringify(progress))

        // Check if all tasks are completed
        if (
          gateway?.stages &&
          currentStage > 0 &&
          currentStage <= gateway.stages.length &&
          updatedTasks.length === gateway.stages[currentStage - 1]?.taskCount
        ) {
          setAllTasksCompleted(true)
        }
      }
    }
  }, [completedTasks, scriptId, gateway, currentStage])

  const handleNextStage = () => {
    if (gateway && currentStage < gateway.stages.length) {
      setCurrentStage(currentStage + 1)
      setCompletedTasks([])
      setAllTasksCompleted(false)
    }
  }

  const handleTaskComplete = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      const updatedTasks = [...completedTasks, taskId]
      setCompletedTasks(updatedTasks)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!gateway) {
    return <div>Gateway not found</div>
  }

  const currentStageData = gateway.stages[currentStage - 1] as Stage

  return (
    <div className="min-h-screen bg-gray-100">
      <GatewayHeader gateway={gateway} currentStage={currentStage} />

      <main className="container mx-auto py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{currentStageData.name}</h2>
          <p className="text-gray-700 mb-4">{currentStageData.description}</p>

          <TaskList
            tasks={currentStageData.tasks}
            completedTasks={completedTasks}
            onTaskComplete={handleTaskComplete}
          />
        </div>
      </main>

      <GatewayFooter
        currentStage={currentStage}
        totalStages={gateway.stages.length}
        allTasksCompleted={allTasksCompleted}
        onNextStage={handleNextStage}
      />
    </div>
  )
}

export default KeyGateway

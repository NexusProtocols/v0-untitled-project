"use client"

import { useState } from "react"
import type { Task } from "@/types/task"
import { SecureAd } from "@/components/secure-ad"

interface TaskListProps {
  tasks: Task[]
  completedTasks: string[]
  onTaskComplete: (taskId: string) => void
}

export default function TaskList({ tasks, completedTasks, onTaskComplete }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const handleTaskClick = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const handleTaskComplete = (taskId: string) => {
    onTaskComplete(taskId)
  }

  // Function to open task in new window
  const openTaskInNewWindow = (task: Task) => {
    if (task.type === "redirect" && task.content?.url) {
      // Open the URL in a new tab
      window.open(task.content.url, "_blank")

      // Mark task as completed after a delay
      setTimeout(() => {
        handleTaskComplete(task.id)
      }, 3000)
    } else if (task.type === "youtube" && task.content?.videoId) {
      // Open YouTube video
      window.open(`https://www.youtube.com/watch?v=${task.content.videoId}`, "_blank")

      // Mark task as completed after a delay
      setTimeout(() => {
        handleTaskComplete(task.id)
      }, 3000)
    }
  }

  return (
    <div className="space-y-4 mb-16">
      {tasks.map((task) => {
        const isCompleted = completedTasks.includes(task.id)
        const isExpanded = expandedTask === task.id

        return (
          <div
            key={task.id}
            className={`border rounded-lg transition-all ${
              isCompleted
                ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                : isExpanded
                  ? "border-[#ff3e3e] bg-[#ff3e3e]/5"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isCompleted ? "bg-green-500 text-white" : "bg-[#ff3e3e] text-white"
                  }`}
                >
                  {isCompleted ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i
                      className={`fas ${
                        task.type === "redirect"
                          ? "fa-link"
                          : task.type === "youtube"
                            ? "fa-youtube"
                            : task.type === "article"
                              ? "fa-newspaper"
                              : task.type === "operagx"
                                ? "fa-opera"
                                : "fa-tasks"
                      }`}
                    ></i>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                </div>
              </div>
              <div>
                {isCompleted ? (
                  <span className="text-green-500 text-sm font-medium">Completed</span>
                ) : (
                  <i className={`fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400`}></i>
                )}
              </div>
            </div>

            {isExpanded && !isCompleted && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <button
                    onClick={() => openTaskInNewWindow(task)}
                    className="interactive-element button-glow rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
                  >
                    <i
                      className={`fas ${
                        task.type === "redirect"
                          ? "fa-external-link-alt"
                          : task.type === "youtube"
                            ? "fa-play"
                            : task.type === "article"
                              ? "fa-book-open"
                              : task.type === "operagx"
                                ? "fa-download"
                                : "fa-check"
                      } mr-2`}
                    ></i>
                    {task.type === "redirect"
                      ? "Visit Link"
                      : task.type === "youtube"
                        ? "Watch Video"
                        : task.type === "article"
                          ? "Read Article"
                          : task.type === "operagx"
                            ? "Download Opera GX"
                            : "Complete Task"}
                  </button>
                </div>

                {/* Ad space */}
                <div className="mt-4">
                  <SecureAd adType="BANNER_300x250" creatorId="unknown" />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

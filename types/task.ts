export type TaskType = "redirect" | "article" | "operagx" | "youtube" | "direct"

export interface Task {
  id: string
  type: TaskType
  title: string
  description: string
  content?: {
    url?: string
    videoId?: string
    customHtml?: string
  }
}

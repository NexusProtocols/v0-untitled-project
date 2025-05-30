export interface Task {
  id: string
  type: "redirect" | "article" | "operagx" | "youtube" | "direct"
  title: string
  description: string
  content?: {
    url?: string
    videoId?: string
  }
}

export interface Stage {
  id: string
  name: string
  description: string
  taskCount: number
  tasks: Task[]
}

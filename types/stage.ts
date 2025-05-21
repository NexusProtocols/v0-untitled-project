import type { Task } from "./task"

export interface Stage {
  id: string
  name: string
  description: string
  taskCount: number
  tasks: Task[]
}

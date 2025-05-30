export interface GatewaySession {
  id: string
  gatewayId: string
  userId?: string | null
  completedTasks: string[]
  currentStage: number
  createdAt: string
  updatedAt: string
  expiresAt: string
}

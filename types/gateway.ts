import type { Stage } from "./stage"

export interface Gateway {
  id: string
  title: string
  description: string
  imageUrl?: string
  creatorId: string
  creatorName: string
  stages: Stage[]
  reward?: {
    type: "url" | "paste"
    url?: string
    content?: string
  }
  settings?: {
    adLevel: number
  }
  stats?: {
    visits: number
    completions: number
    conversionRate: number
    revenue: number
  }
}

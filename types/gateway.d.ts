import type { Stage } from "./stage"

export interface Gateway {
  id: string
  title: string
  description?: string
  creatorId: string
  creatorName: string
  imageUrl?: string
  stages: Stage[]
  reward?: {
    type: "url" | "paste"
    content?: string
    url?: string
  }
  settings?: {
    adLevel: number
    adultAds: boolean
    requireCaptcha: boolean
  }
  stats?: {
    visits: number
    completions: number
    conversionRate: number
    revenue: number
  }
  createdAt: string
  updatedAt: string
}

import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables not found. Using fallback mode.")
}

// Create supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Gateway functions with fallbacks
export async function saveGateway(gatewayData: any) {
  if (!supabase) {
    // Fallback to localStorage for development
    const gateways = JSON.parse(localStorage.getItem("gateways") || "[]")
    const newGateway = {
      ...gatewayData,
      id: gatewayData.id || `gateway-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    gateways.push(newGateway)
    localStorage.setItem("gateways", JSON.stringify(gateways))
    return newGateway
  }

  // Check if gateway already exists (for updates)
  if (gatewayData.id) {
    const { data, error } = await supabase.from("gateways").update(gatewayData).eq("id", gatewayData.id).select()

    if (error) {
      console.error("Error updating gateway:", error)
      throw error
    }

    return data?.[0]
  }

  // Create new gateway
  const { data, error } = await supabase.from("gateways").insert([gatewayData]).select()

  if (error) {
    console.error("Error saving gateway:", error)
    throw error
  }

  return data?.[0]
}

export async function getGateway(gatewayId: string) {
  if (!supabase) {
    // Fallback to localStorage
    const gateways = JSON.parse(localStorage.getItem("gateways") || "[]")
    return gateways.find((g: any) => g.id === gatewayId) || null
  }

  const { data, error } = await supabase.from("gateways").select("*").eq("id", gatewayId).single()

  if (error) {
    console.error("Error fetching gateway:", error)
    throw error
  }

  return data
}

export async function getUserGateways(userId: string) {
  if (!supabase) {
    // Fallback to localStorage
    const gateways = JSON.parse(localStorage.getItem("gateways") || "[]")
    return gateways.filter((g: any) => g.creator_id === userId)
  }

  const { data, error } = await supabase
    .from("gateways")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user gateways:", error)
    throw error
  }

  return data || []
}

export async function getAllGateways() {
  if (!supabase) {
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem("gateways") || "[]")
  }

  const { data, error } = await supabase.from("gateways").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all gateways:", error)
    throw error
  }

  return data || []
}

// Gateway stats functions
export async function incrementGatewayVisit(gatewayId: string) {
  if (!supabase) {
    // Fallback - do nothing for now
    return
  }

  // First get current stats
  const { data: gateway } = await supabase.from("gateways").select("stats").eq("id", gatewayId).single()

  if (!gateway) return

  const stats = gateway.stats || { visits: 0, completions: 0, conversionRate: 0, revenue: 0 }
  const visits = (stats.visits || 0) + 1
  const completions = stats.completions || 0
  const conversionRate = completions > 0 ? (completions / visits) * 100 : 0

  // Calculate revenue based on visits and completions
  const adLevel = 3 // Default ad level if not specified
  const baseCPM = 2.5
  const adLevelMultiplier = 0.8 + adLevel * 0.2
  const completionRate = visits > 0 ? completions / visits : 0
  const completionMultiplier = 1 + completionRate * 0.5
  const revenue = (visits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier

  // Update stats
  const updatedStats = {
    ...stats,
    visits,
    conversionRate,
    revenue: Number.parseFloat(revenue.toFixed(2)),
  }

  await supabase.from("gateways").update({ stats: updatedStats }).eq("id", gatewayId)
}

export async function incrementGatewayCompletion(gatewayId: string) {
  if (!supabase) {
    // Fallback - do nothing for now
    return
  }

  // First get current stats
  const { data: gateway } = await supabase.from("gateways").select("stats").eq("id", gatewayId).single()

  if (!gateway) return

  const stats = gateway.stats || { visits: 1, completions: 0, conversionRate: 0, revenue: 0 }
  const visits = stats.visits || 1
  const completions = (stats.completions || 0) + 1
  const conversionRate = (completions / visits) * 100

  // Calculate revenue based on visits and completions
  const adLevel = 3 // Default ad level if not specified
  const baseCPM = 2.5
  const adLevelMultiplier = 0.8 + adLevel * 0.2
  const completionRate = visits > 0 ? completions / visits : 0
  const completionMultiplier = 1 + completionRate * 0.5
  const revenue = (visits / 1000) * baseCPM * adLevelMultiplier * completionMultiplier

  // Update stats
  const updatedStats = {
    ...stats,
    completions,
    conversionRate,
    revenue: Number.parseFloat(revenue.toFixed(2)),
  }

  await supabase.from("gateways").update({ stats: updatedStats }).eq("id", gatewayId)
}

// Gateway progress functions
export async function saveUserProgress(userId: string, gatewayId: string, progress: any) {
  if (!supabase) {
    // Fallback to localStorage
    const key = `progress_${userId}_${gatewayId}`
    localStorage.setItem(key, JSON.stringify(progress))
    return
  }

  const { error } = await supabase.from("gateway_progress").upsert([
    {
      user_id: userId,
      gateway_id: gatewayId,
      progress_data: progress,
      updated_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("Error saving progress:", error)
    throw error
  }
}

export async function getUserProgress(userId: string, gatewayId: string) {
  if (!supabase) {
    // Fallback to localStorage
    const key = `progress_${userId}_${gatewayId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  }

  const { data, error } = await supabase
    .from("gateway_progress")
    .select("progress_data")
    .eq("user_id", userId)
    .eq("gateway_id", gatewayId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching progress:", error)
    throw error
  }

  return data?.progress_data || null
}

// Task completion functions
export async function saveCompletedTasks(userId: string, gatewayId: string, tasks: string[]) {
  if (!supabase) {
    // Fallback to localStorage
    const key = `tasks_${userId}_${gatewayId}`
    localStorage.setItem(key, JSON.stringify(tasks))
    return
  }

  const { error } = await supabase.from("completed_tasks").upsert([
    {
      user_id: userId,
      gateway_id: gatewayId,
      tasks,
      updated_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("Error saving completed tasks:", error)
    throw error
  }
}

export async function getCompletedTasks(userId: string, gatewayId: string) {
  if (!supabase) {
    // Fallback to localStorage
    const key = `tasks_${userId}_${gatewayId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  const { data, error } = await supabase
    .from("completed_tasks")
    .select("tasks")
    .eq("user_id", userId)
    .eq("gateway_id", gatewayId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching completed tasks:", error)
    throw error
  }

  return data?.tasks || []
}

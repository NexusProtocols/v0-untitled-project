import { supabase } from "./supabase"

export interface ApiKeyValidation {
  isValid: boolean
  user?: {
    id: string
    username: string
    permissions: any
  }
  error?: string
}

export async function validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
  try {
    if (!apiKey || !apiKey.startsWith("nxs_")) {
      return { isValid: false, error: "Invalid API key format" }
    }

    const { data, error } = await supabase.rpc("validate_api_key", { key: apiKey })

    if (error) {
      console.error("Error validating API key:", error)
      return { isValid: false, error: "Database error" }
    }

    if (!data || data.length === 0) {
      return { isValid: false, error: "Invalid or expired API key" }
    }

    const userData = data[0]
    return {
      isValid: true,
      user: {
        id: userData.user_id,
        username: userData.username,
        permissions: userData.permissions,
      },
    }
  } catch (error) {
    console.error("Error in validateApiKey:", error)
    return { isValid: false, error: "Authentication failed" }
  }
}

export function extractApiKey(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Check x-api-key header
  const apiKeyHeader = request.headers.get("x-api-key")
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  // Check query parameter
  const url = new URL(request.url)
  const apiKeyParam = url.searchParams.get("api_key")
  if (apiKeyParam) {
    return apiKeyParam
  }

  return null
}

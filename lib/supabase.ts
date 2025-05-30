import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Create a supabase client with admin privileges for server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

// Create a singleton for client-side usage to prevent multiple instances
let clientSingleton: typeof supabase

export function getSupabaseBrowserClient() {
  if (clientSingleton) return clientSingleton

  clientSingleton = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  return clientSingleton
}

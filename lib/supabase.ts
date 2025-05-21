import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create a Supabase client with the anonymous key for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase admin client with the service role key for server-side usage
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to get the appropriate client based on whether we need admin privileges
export const getSupabaseClient = (admin = false) => {
  return admin ? supabaseAdmin : supabase
}

import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated via session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Get user's API keys
    const { data: keys, error } = await supabase
      .from("user_api_keys")
      .select("id, key_name, permissions, is_active, last_used_at, created_at, expires_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching API keys:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch API keys" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      keys: keys || [],
    })
  } catch (error) {
    console.error("Error in GET /api/user/keys:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated via session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { keyName, permissions, expiresInDays } = await request.json()

    if (!keyName) {
      return NextResponse.json({ success: false, message: "Key name is required" }, { status: 400 })
    }

    // Generate API key
    const { data: apiKeyData, error: keyError } = await supabase.rpc("generate_api_key")

    if (keyError || !apiKeyData) {
      console.error("Error generating API key:", keyError)
      return NextResponse.json({ success: false, message: "Failed to generate API key" }, { status: 500 })
    }

    const apiKey = apiKeyData

    // Calculate expiration date if provided
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    }

    // Default permissions
    const defaultPermissions = {
      scripts: {
        read: true,
        write: true,
        delete: false,
      },
    }

    // Insert new API key
    const { data: newKey, error } = await supabaseAdmin
      .from("user_api_keys")
      .insert([
        {
          id: uuidv4(),
          user_id: session.user.id,
          api_key: apiKey,
          key_name: keyName,
          permissions: permissions || defaultPermissions,
          is_active: true,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id, key_name, permissions, is_active, created_at, expires_at")
      .single()

    if (error) {
      console.error("Error creating API key:", error)
      return NextResponse.json({ success: false, message: "Failed to create API key" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "API key created successfully",
      key: {
        ...newKey,
        api_key: apiKey, // Only return the key once when created
      },
    })
  } catch (error) {
    console.error("Error in POST /api/user/keys:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

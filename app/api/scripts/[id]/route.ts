import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { validateApiKey, extractApiKey } from "@/lib/auth-key"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get script from database - this is public for reading
    const { data: script, error } = await supabase.from("scripts").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, message: "Script not found" }, { status: 404 })
      }
      console.error("Error fetching script:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch script" }, { status: 500 })
    }

    if (!script) {
      return NextResponse.json({ success: false, message: "Script not found" }, { status: 404 })
    }

    // Increment view count
    try {
      await supabaseAdmin.rpc("increment_script_views", { script_id: id })
    } catch (viewError) {
      console.error("Error incrementing views:", viewError)
      // Don't fail the request if view increment fails
    }

    const responseScript = {
      ...script,
      categories: script.categories_json ? JSON.parse(script.categories_json) : [],
      game: {
        id: script.id,
        gameId: script.game_id || "unknown",
        name: script.game_name || "Unknown Game",
        imageUrl: script.game_image || "/placeholder.svg?height=160&width=320",
      },
    }

    return NextResponse.json({
      success: true,
      script: responseScript,
    })
  } catch (error) {
    console.error("Error in GET /api/scripts/[id]:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let user = null
    let authMethod = "none"

    // Try API key authentication first
    const apiKey = extractApiKey(request)
    if (apiKey) {
      const keyValidation = await validateApiKey(apiKey)
      if (keyValidation.isValid && keyValidation.user) {
        user = keyValidation.user
        authMethod = "api_key"
      } else {
        return NextResponse.json({ success: false, message: keyValidation.error || "Invalid API key" }, { status: 401 })
      }
    } else {
      // Fall back to session authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        user = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email,
          permissions: { scripts: { read: true, write: true, delete: false } },
        }
        authMethod = "session"
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check write permissions
    if (!user.permissions?.scripts?.write) {
      return NextResponse.json({ success: false, message: "Insufficient permissions to edit scripts" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()

    // Check if script exists and user owns it
    const { data: existingScript, error: fetchError } = await supabase
      .from("scripts")
      .select("author_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ success: false, message: "Script not found" }, { status: 404 })
      }
      console.error("Error fetching script:", fetchError)
      return NextResponse.json({ success: false, message: "Failed to fetch script" }, { status: 500 })
    }

    if (existingScript.author_id !== user.id) {
      return NextResponse.json({ success: false, message: "You can only edit your own scripts" }, { status: 403 })
    }

    // Update script
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.title) updates.title = data.title
    if (data.description) updates.description = data.description
    if (data.code) updates.code = data.code
    if (data.game) {
      updates.game_id = data.game.gameId
      updates.game_name = data.game.name
      updates.game_image = data.game.imageUrl
    }
    if (data.categories) updates.categories_json = JSON.stringify(data.categories)
    if (typeof data.isPremium === "boolean") updates.is_premium = data.isPremium
    if (typeof data.keySystem === "boolean") updates.key_system = data.keySystem

    const { data: updatedScript, error } = await supabaseAdmin
      .from("scripts")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating script:", error)
      return NextResponse.json({ success: false, message: "Failed to update script" }, { status: 500 })
    }

    const responseScript = {
      ...updatedScript,
      categories: updatedScript.categories_json ? JSON.parse(updatedScript.categories_json) : [],
      game: {
        id: updatedScript.id,
        gameId: updatedScript.game_id || "unknown",
        name: updatedScript.game_name || "Unknown Game",
        imageUrl: updatedScript.game_image || "/placeholder.svg?height=160&width=320",
      },
    }

    return NextResponse.json({
      success: true,
      message: "Script updated successfully",
      script: responseScript,
      authMethod,
    })
  } catch (error) {
    console.error("Error in PUT /api/scripts/[id]:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let user = null

    // Try API key authentication first
    const apiKey = extractApiKey(request)
    if (apiKey) {
      const keyValidation = await validateApiKey(apiKey)
      if (keyValidation.isValid && keyValidation.user) {
        user = keyValidation.user
      } else {
        return NextResponse.json({ success: false, message: keyValidation.error || "Invalid API key" }, { status: 401 })
      }
    } else {
      // Fall back to session authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        user = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email,
          permissions: { scripts: { read: true, write: true, delete: true } },
        }
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check delete permissions
    if (!user.permissions?.scripts?.delete) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions to delete scripts" },
        { status: 403 },
      )
    }

    const { id } = params

    // Check if script exists and user owns it
    const { data: existingScript, error: fetchError } = await supabase
      .from("scripts")
      .select("author_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ success: false, message: "Script not found" }, { status: 404 })
      }
      console.error("Error fetching script:", fetchError)
      return NextResponse.json({ success: false, message: "Failed to fetch script" }, { status: 500 })
    }

    if (existingScript.author_id !== user.id) {
      return NextResponse.json({ success: false, message: "You can only delete your own scripts" }, { status: 403 })
    }

    // Delete script
    const { error } = await supabaseAdmin.from("scripts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting script:", error)
      return NextResponse.json({ success: false, message: "Failed to delete script" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Script deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/scripts/[id]:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

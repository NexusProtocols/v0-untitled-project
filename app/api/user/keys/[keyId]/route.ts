import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { keyId: string } }) {
  try {
    // Check if user is authenticated via session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { keyId } = params

    // Delete the API key (only if it belongs to the user)
    const { error } = await supabaseAdmin.from("user_api_keys").delete().eq("id", keyId).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting API key:", error)
      return NextResponse.json({ success: false, message: "Failed to delete API key" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "API key deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/user/keys/[keyId]:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { keyId: string } }) {
  try {
    // Check if user is authenticated via session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { keyId } = params
    const { isActive, keyName, permissions } = await request.json()

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (typeof isActive === "boolean") {
      updates.is_active = isActive
    }

    if (keyName) {
      updates.key_name = keyName
    }

    if (permissions) {
      updates.permissions = permissions
    }

    // Update the API key (only if it belongs to the user)
    const { data, error } = await supabaseAdmin
      .from("user_api_keys")
      .update(updates)
      .eq("id", keyId)
      .eq("user_id", session.user.id)
      .select("id, key_name, permissions, is_active, last_used_at, created_at, expires_at")
      .single()

    if (error) {
      console.error("Error updating API key:", error)
      return NextResponse.json({ success: false, message: "Failed to update API key" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "API key updated successfully",
      key: data,
    })
  } catch (error) {
    console.error("Error in PATCH /api/user/keys/[keyId]:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

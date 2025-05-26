import { type NextRequest, NextResponse } from "next/server"
import { scriptDb } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scriptId = params.id

    if (!scriptId) {
      return NextResponse.json({ success: false, message: "Script ID is required" }, { status: 400 })
    }

    // Get script from database
    const script = await scriptDb.getScriptById(scriptId)

    if (!script) {
      return NextResponse.json({ success: false, message: "Script not found" }, { status: 404 })
    }

    // Increment views
    await scriptDb.incrementViews(scriptId)

    return NextResponse.json({
      success: true,
      script,
    })
  } catch (error) {
    console.error("Error fetching script:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the script" },
      { status: 500 },
    )
  }
}

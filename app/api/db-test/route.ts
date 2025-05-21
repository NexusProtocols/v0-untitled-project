import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test the database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
    })
  } catch (error) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to the database",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

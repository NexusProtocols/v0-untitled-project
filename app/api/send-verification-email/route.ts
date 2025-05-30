import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email, code, username } = await request.json()

    if (!email || !code || !username) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Send the verification email
    const emailSent = await sendVerificationEmail(email, code, username)

    if (!emailSent) {
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Verification email sent successfully" })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

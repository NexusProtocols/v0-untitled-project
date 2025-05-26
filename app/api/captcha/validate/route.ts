import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { captchaResponse } = body

    // Since CAPTCHA is removed, always return success
    const validationToken = `validated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      message: "Validation successful",
      token: validationToken,
    })
  } catch (error) {
    console.error("Error in captcha validation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
      },
      { status: 500 },
    )
  }
}

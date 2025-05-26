import { type NextRequest, NextResponse } from "next/server"

// Environment variables
const ADMAVEN_API_KEY = "67c51367a37686fb2fdd2313a3bd626f9576cf5b45c6534c25d0bee527f5d2cd"
const ALLOWED_REDIRECT_DOMAINS = ["nexuslive.vercel.app", "localhost", "vercel.app"]

// Verify redirect URLs are whitelisted
function isValidRedirect(url: string) {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_REDIRECT_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.user_id || !data.page_id || !data.creator_id || !data.task_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate redirect URLs if provided
    if (data.redirect) {
      if (!data.redirect.success_url || !isValidRedirect(data.redirect.success_url)) {
        return NextResponse.json({ success: false, error: "Invalid success redirect URL" }, { status: 400 })
      }

      if (data.redirect.fail_url && !isValidRedirect(data.redirect.fail_url)) {
        return NextResponse.json({ success: false, error: "Invalid failure redirect URL" }, { status: 400 })
      }
    }

    // Send conversion to Ad Maven
    try {
      const admavenResponse = await fetch(`https://api.admaven.com/conversion?apikey=${ADMAVEN_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: data.user_id,
          pageid: data.page_id,
          creatorid: data.creator_id,
          value: data.revenue || 0,
          txid: data.task_id,
        }),
      })

      // Store completion in localStorage for fallback
      try {
        const completionsKey = `admaven_completions_${data.user_id}`
        const completions = JSON.parse(localStorage.getItem(completionsKey) || "[]")
        completions.push({
          taskId: data.task_id,
          gatewayId: data.page_id,
          creatorId: data.creator_id,
          timestamp: Date.now(),
        })
        localStorage.setItem(completionsKey, JSON.stringify(completions))
      } catch (error) {
        console.error("Error storing completion in localStorage:", error)
      }

      // If redirect URLs are provided, redirect the user
      if (data.redirect && data.redirect.success_url) {
        const redirectUrl = new URL(data.redirect.success_url)
        redirectUrl.searchParams.append("status", "success")
        redirectUrl.searchParams.append("txid", data.task_id)

        return NextResponse.redirect(redirectUrl.toString())
      }

      // Otherwise return JSON response
      return NextResponse.json({
        success: true,
        message: "Conversion tracked successfully",
      })
    } catch (error) {
      console.error("Error sending conversion to Ad Maven:", error)

      // If redirect URLs are provided, redirect to failure URL
      if (data.redirect && data.redirect.fail_url) {
        const redirectUrl = new URL(data.redirect.fail_url)
        redirectUrl.searchParams.append("status", "error")
        redirectUrl.searchParams.append("error", "Failed to track conversion")

        return NextResponse.redirect(redirectUrl.toString())
      }

      // Otherwise return JSON error
      return NextResponse.json({ success: false, error: "Failed to track conversion" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while processing the request" },
      { status: 500 },
    )
  }
}

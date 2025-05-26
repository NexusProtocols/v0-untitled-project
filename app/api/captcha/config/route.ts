import { NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET() {
  return NextResponse.json({
    siteKey: env.CLOUDFLARE_SITE_KEY,
  })
}

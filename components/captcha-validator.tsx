"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CaptchaValidatorProps {
  onValidated: (token: string) => void
}

export function CaptchaValidator({ onValidated }: CaptchaValidatorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileWidget, setTurnstileWidget] = useState<HTMLDivElement | null>(null)
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)
  const [siteKey, setSiteKey] = useState<string>("")
  const router = useRouter()

  // Fetch the site key from the server
  useEffect(() => {
    async function fetchSiteKey() {
      try {
        const response = await fetch("/api/captcha/config")
        const data = await response.json()
        setSiteKey(data.siteKey)
      } catch (error) {
        console.error("Error fetching captcha config:", error)
        setError("Failed to load security check. Please refresh the page.")
      }
    }

    fetchSiteKey()
  }, [])

  // Load Cloudflare Turnstile script
  useEffect(() => {
    // Only load if not already loaded
    if (!document.getElementById("cloudflare-turnstile-script") && !turnstileLoaded) {
      const script = document.createElement("script")
      script.id = "cloudflare-turnstile-script"
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true

      script.onload = () => {
        setTurnstileLoaded(true)
      }

      document.head.appendChild(script)

      return () => {
        // Clean up script if component unmounts
        if (document.getElementById("cloudflare-turnstile-script")) {
          document.getElementById("cloudflare-turnstile-script")?.remove()
        }
      }
    }
  }, [turnstileLoaded])

  // Initialize Turnstile widget when script is loaded and site key is available
  useEffect(() => {
    if (turnstileLoaded && window.turnstile && !turnstileWidget && siteKey) {
      const widgetId = window.turnstile.render("#turnstile-container", {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => {
          validateCaptcha(token)
        },
      })

      const container = document.getElementById("turnstile-container") as HTMLDivElement
      setTurnstileWidget(container)
    }
  }, [turnstileLoaded, turnstileWidget, siteKey])

  // Handle CAPTCHA validation
  const validateCaptcha = async (token: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/captcha/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captchaResponse: token,
          captchaType: "cloudflare",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store the validation token in localStorage
        localStorage.setItem("captchaToken", data.token)
        localStorage.setItem("captchaExpires", new Date(Date.now() + 30 * 60 * 1000).toISOString())

        // Call the onValidated callback
        onValidated(data.token)
      } else {
        setError(data.error || "CAPTCHA validation failed")
        // Reset the CAPTCHA
        if (window.turnstile) {
          window.turnstile.reset()
        }
      }
    } catch (error) {
      console.error("Error validating CAPTCHA:", error)
      setError("An error occurred. Please try again.")
      // Reset the CAPTCHA
      if (window.turnstile) {
        window.turnstile.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-4 text-center">
        <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-3">
          <i className="fas fa-shield-alt text-3xl text-[#ff3e3e]"></i>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Security Check</h3>
        <p className="mt-2 text-gray-400">Please complete the CAPTCHA to continue</p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/30 p-3 text-center text-red-200">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div id="turnstile-container" className="cloudflare-captcha"></div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <span>Validating...</span>
        </div>
      )}
    </div>
  )
}

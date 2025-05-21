"use client"

import { useState } from "react"

interface CaptchaValidatorProps {
  onValidated: (token: string) => void
}

export function CaptchaValidator({ onValidated }: CaptchaValidatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = async () => {
    setIsLoading(true)
    setError("")

    try {
      // In a real implementation, this would validate with Cloudflare Turnstile or reCAPTCHA
      // For demo purposes, we'll simulate a successful validation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store the token in localStorage with an expiration time (1 hour)
      const token = `demo-token-${Date.now()}`
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      localStorage.setItem("captchaToken", token)
      localStorage.setItem("captchaExpires", expiresAt)

      onValidated(token)
    } catch (error) {
      console.error("Error validating CAPTCHA:", error)
      setError("Failed to validate. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 text-center">
      <div className="mb-4 inline-block rounded-full bg-[#ff3e3e]/20 p-4">
        <i className="fas fa-shield-alt text-4xl text-[#ff3e3e]"></i>
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">Human Verification Required</h2>
      <p className="mb-6 text-gray-400">Please complete the verification below to continue.</p>

      {error && (
        <div className="mb-4 rounded bg-red-500/10 p-3 text-red-400">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-check-circle mr-2"></i> Verify (Demo Mode)
            </>
          )}
        </button>
      </div>
    </div>
  )
}

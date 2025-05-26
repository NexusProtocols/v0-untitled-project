"use client"

import React, { useState } from "react"

interface CaptchaValidatorProps {
  onValidated: (token: string) => void
}

export function CaptchaValidator({ onValidated }: CaptchaValidatorProps) {
  const [loading, setLoading] = useState(false)

  // Since CAPTCHA is removed, automatically validate
  const handleAutoValidate = async () => {
    setLoading(true)

    try {
      // Generate a simple validation token
      const validationToken = `auto_validated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store the validation token in localStorage
      localStorage.setItem("captchaToken", validationToken)
      localStorage.setItem("captchaExpires", new Date(Date.now() + 30 * 60 * 1000).toISOString())

      // Call the onValidated callback
      onValidated(validationToken)
    } catch (error) {
      console.error("Error in auto validation:", error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-validate on component mount
  React.useEffect(() => {
    handleAutoValidate()
  }, [])

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-4 text-center">
        <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-3">
          <i className="fas fa-shield-alt text-3xl text-[#ff3e3e]"></i>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Security Check</h3>
        <p className="mt-2 text-gray-400">Validating access...</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <span className="text-white">Validating...</span>
        </div>
      )}
    </div>
  )
}

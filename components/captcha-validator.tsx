"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CaptchaValidatorProps {
  onValidated: (token: string) => void
}

export function CaptchaValidator({ onValidated }: CaptchaValidatorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [captchaText, setCaptchaText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [fingerprint, setFingerprint] = useState("")
  const router = useRouter()

  // Generate a simple CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaText(result)
    setUserInput("")
  }

  // Generate browser fingerprint
  const generateFingerprint = () => {
    const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
    const timezone = new Date().getTimezoneOffset()
    const plugins = Array.from(navigator.plugins)
      .map((p) => p.name)
      .join(";")
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl")
    const webglInfo = gl ? gl.getParameter(gl.RENDERER) : "unknown"

    const fingerprintData = [navigator.userAgent, screen, timezone, plugins, webglInfo, navigator.language].join("|||")

    // Create a hash of the fingerprint data
    const hash = Array.from(fingerprintData)
      .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
      .toString(36)

    setFingerprint(hash)
  }

  // Initialize CAPTCHA and fingerprint
  useEffect(() => {
    generateCaptcha()
    generateFingerprint()
  }, [])

  // Handle CAPTCHA validation
  const handleValidate = async () => {
    if (userInput !== captchaText) {
      setError("Incorrect CAPTCHA. Please try again.")
      generateCaptcha()
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/captcha/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captchaResponse: userInput,
          fingerprint,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store the validation token in localStorage
        localStorage.setItem("captchaToken", data.data.token)
        localStorage.setItem("captchaExpires", data.data.expiresAt)

        // Call the onValidated callback
        onValidated(data.data.token)
      } else {
        setError(data.error || "CAPTCHA validation failed")
        generateCaptcha()
      }
    } catch (error) {
      console.error("Error validating CAPTCHA:", error)
      setError("An error occurred. Please try again.")
      generateCaptcha()
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

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="relative overflow-hidden rounded bg-[#1a1a1a] p-4">
            <div className="select-none text-2xl font-bold tracking-widest text-white">
              {captchaText.split("").map((char, index) => (
                <span
                  key={index}
                  style={{
                    transform: `rotate(${Math.random() * 20 - 10}deg)`,
                    display: "inline-block",
                    margin: "0 2px",
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)",
                backgroundSize: "4px 4px",
              }}
            ></div>
          </div>
          <button onClick={generateCaptcha} className="ml-2 rounded bg-[#1a1a1a] p-2 text-gray-400 hover:text-white">
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter the text above"
          className="w-full rounded border border-white/10 bg-[#000000] px-4 py-3 text-white transition-all focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={loading || !userInput}
        className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            <span>Validating...</span>
          </div>
        ) : (
          <>Verify</>
        )}
      </button>
    </div>
  )
}

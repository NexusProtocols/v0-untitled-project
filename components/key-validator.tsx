"use client"

import { useState } from "react"

interface KeyValidatorProps {
  onValidate: (key: string, hwid: string) => Promise<any>
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function KeyValidator({ onValidate, onSuccess, onError }: KeyValidatorProps) {
  const [key, setKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const generateHWID = () => {
    // In a real implementation, this would use more sophisticated methods
    // For now, we'll generate a random ID that persists in localStorage
    let hwid = localStorage.getItem("nexus_hwid")
    if (!hwid) {
      hwid = `HWID-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`
      localStorage.setItem("nexus_hwid", hwid)
    }
    return hwid
  }

  const handleValidate = async () => {
    if (!key) {
      setValidationResult({
        success: false,
        message: "Please enter a key",
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const hwid = generateHWID()
      const result = await onValidate(key, hwid)

      if (result.success) {
        setValidationResult({
          success: true,
          message: "Key validated successfully!",
          data: result.data,
        })

        if (onSuccess) {
          onSuccess(result.data)
        }
      } else {
        setValidationResult({
          success: false,
          message: result.error || "Invalid key",
        })

        if (onError) {
          onError(result.error || "Invalid key")
        }
      }
    } catch (error) {
      console.error("Error validating key:", error)

      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      setValidationResult({
        success: false,
        message: errorMessage,
      })

      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
      <h3 className="mb-4 text-xl font-bold text-white">Validate Your Key</h3>

      <div className="mb-4">
        <label htmlFor="key" className="mb-2 block text-sm font-medium text-gray-300">
          License Key
        </label>
        <input
          type="text"
          id="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
          placeholder="Enter your license key (e.g., NEXUS-XXXX-XXXX-XXXX)"
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={isValidating}
        className="interactive-element button-glow w-full rounded bg-[#ff3e3e] px-4 py-3 font-semibold text-white transition-all hover:bg-[#ff0000] disabled:opacity-50"
      >
        {isValidating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            <span>Validating...</span>
          </div>
        ) : (
          "Validate Key"
        )}
      </button>

      {validationResult && (
        <div
          className={`mt-4 rounded p-4 ${
            validationResult.success ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              {validationResult.success ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <i className="fas fa-exclamation-circle"></i>
              )}
            </div>
            <div>
              <p className="font-medium">{validationResult.message}</p>
              {validationResult.success && validationResult.data && (
                <div className="mt-2 text-sm">
                  <p>
                    <span className="font-medium">Type:</span> {validationResult.data.keyType}
                  </p>
                  <p>
                    <span className="font-medium">Expires:</span>{" "}
                    {new Date(validationResult.data.expiresAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Usage:</span> {validationResult.data.usageCount}/
                    {validationResult.data.maxUsage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

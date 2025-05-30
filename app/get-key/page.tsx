"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function GetKeyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(10)
  const [verificationComplete, setVerificationComplete] = useState(false)

  useEffect(() => {
    // Start countdown for verification
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setVerificationComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setIsLoading(false)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    )
  }

  // Render verification screen
  return (
    <div className="container mx-auto px-5 py-16 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg border-l-4 border-[#BA55D3] bg-[#1a1a1a] p-8 shadow-lg text-center">
        <div className="mb-4 text-5xl text-[#BA55D3]">
          <i className="fas fa-key"></i>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370DB] to-[#BA55D3]">
          Key Access
        </h1>
        <p className="mb-6 text-gray-300">
          Please wait while we verify your access. This process ensures maximum security for our key system.
        </p>

        <div className="mb-4 text-2xl font-bold text-[#BA55D3]">
          {countdown > 0 ? `${countdown} second${countdown !== 1 ? "s" : ""} remaining` : "Verification Complete!"}
        </div>

        <div className="w-full h-2 bg-[#050505] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#9370DB] to-[#BA55D3] transition-all duration-1000"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          ></div>
        </div>

        {verificationComplete && (
          <div className="mt-6">
            <p className="mb-4 text-gray-300">
              Verification complete! You can now browse available keys in our key generator.
            </p>
            <Link
              href="/key-generator"
              className="w-full rounded bg-gradient-to-r from-[#9370DB] to-[#BA55D3] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#BA55D3]/20 inline-block"
            >
              <i className="fas fa-key mr-2"></i> Browse Keys
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

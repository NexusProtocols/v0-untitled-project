"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function BanNotification() {
  const { user } = useAuth()
  const [isBanned, setIsBanned] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banExpiration, setBanExpiration] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Check if user is banned
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")

      if (userData.isBanned) {
        setIsBanned(true)
        setBanReason(userData.bannedReason || "Violation of terms of service")
        setBanExpiration(userData.banExpiration || null)
        setShowBanner(true)
      }
    }
  }, [user])

  if (!isBanned || !showBanner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-6 shadow-xl">
        <div className="mb-4 text-center text-5xl text-red-500">
          <i className="fas fa-ban"></i>
        </div>
        <h2 className="mb-4 text-center text-2xl font-bold text-white">Your Account Has Been Banned</h2>
        <div className="mb-6 rounded bg-[#0a0a0a] p-4">
          <p className="mb-2 text-gray-300">
            <span className="font-medium text-red-400">Reason:</span> {banReason}
          </p>
          {banExpiration && (
            <p className="text-gray-300">
              <span className="font-medium text-yellow-400">Ban expires:</span>{" "}
              {new Date(banExpiration).toLocaleString()}
            </p>
          )}
          {!banExpiration && (
            <p className="text-gray-300">
              <span className="font-medium text-red-400">Ban type:</span> Permanent
            </p>
          )}
        </div>
        <p className="mb-6 text-center text-gray-400">
          If you believe this is a mistake, please contact our support team for assistance.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://discord.gg/ZWCqcuxAv3"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-[#5865F2] px-4 py-2 font-semibold text-white transition-all hover:bg-[#4752C4]"
          >
            <i className="fab fa-discord mr-2"></i> Contact Support
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className="rounded border border-white/10 bg-[#050505] px-4 py-2 font-semibold text-white transition-all hover:bg-[#1a1a1a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

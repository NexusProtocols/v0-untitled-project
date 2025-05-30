"use client"

import { useState } from "react"

interface OperaGxOfferwallProps {
  onComplete: () => void
  onSkip?: () => void
}

export function OperaGxOfferwall({ onComplete, onSkip }: OperaGxOfferwallProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleOfferClick = () => {
    // Open Opera GX referral link in a new tab
    window.open("https://operagx.gg/nexus-referral", "_blank")

    // Simulate completion
    setIsCompleting(true)
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  return (
    <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <img src="/placeholder.svg?height=60&width=200" alt="Opera GX" className="h-15" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Complete an offer to continue</h3>
        <p className="mt-2 text-gray-400">Choose one of the offers below to unlock your key instantly</p>
      </div>

      <div className="space-y-4 mb-6">
        <div
          className="interactive-element rounded border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] cursor-pointer"
          onClick={handleOfferClick}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a]"></div>
            <div className="flex-1">
              <h4 className="font-medium text-white">Install Opera GX Browser</h4>
              <p className="text-sm text-gray-400">
                Download and install Opera GX gaming browser - the world's first browser for gamers
              </p>
            </div>
            <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">Easy</div>
          </div>
        </div>

        <div
          className="interactive-element rounded border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] cursor-pointer"
          onClick={handleOfferClick}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a]"></div>
            <div className="flex-1">
              <h4 className="font-medium text-white">Complete a short survey</h4>
              <p className="text-sm text-gray-400">Answer a few questions about your gaming habits and preferences</p>
            </div>
            <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">Medium</div>
          </div>
        </div>

        <div
          className="interactive-element rounded border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] cursor-pointer"
          onClick={handleOfferClick}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a]"></div>
            <div className="flex-1">
              <h4 className="font-medium text-white">Watch a video ad</h4>
              <p className="text-sm text-gray-400">Watch a 30-second video advertisement to unlock your key</p>
            </div>
            <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">Quick</div>
          </div>
        </div>
      </div>

      {isCompleting && (
        <div className="mb-6 rounded bg-green-900/20 p-4 text-center text-green-300">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-300/20 border-t-green-300"></div>
            <span>Verifying completion...</span>
          </div>
        </div>
      )}

      {onSkip && !isCompleting && (
        <div className="text-center">
          <button onClick={onSkip} className="interactive-element text-sm text-gray-400 hover:text-white">
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}

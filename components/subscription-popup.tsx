"use client"

import { useState, useEffect } from "react"

interface SubscriptionPopupProps {
  onSkip: () => void
  onPurchase: (plan: string) => void
}

export function SubscriptionPopup({ onSkip, onPurchase }: SubscriptionPopupProps) {
  const [countdown, setCountdown] = useState(10)

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 mb-6">
      <div className="mb-4 text-center">
        <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-3">
          <i className="fas fa-crown text-3xl text-[#ff3e3e]"></i>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Skip All Gateways with Premium</h3>
        <p className="mt-2 text-gray-400">
          Upgrade to NEXUS Premium to get instant access to all content without gateways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="interactive-element rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all">
          <div className="mb-2 text-center">
            <h4 className="text-lg font-bold text-white">3 Days</h4>
            <p className="text-2xl font-bold text-[#ff3e3e]">$3.99</p>
            <p className="text-xs text-gray-400">One-time payment</p>
          </div>
          <button
            onClick={() => onPurchase("3-day")}
            className="interactive-element button-glow mt-4 w-full rounded bg-[#ff3e3e] px-4 py-2 font-semibold text-white transition-all hover:bg-[#ff0000]"
          >
            Get Started
          </button>
        </div>

        <div className="interactive-element rounded-lg border-2 border-[#ff3e3e] bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ff3e3e] px-3 py-1 text-xs font-bold text-white">
            POPULAR
          </div>
          <div className="mb-2 text-center">
            <h4 className="text-lg font-bold text-white">1 Week</h4>
            <p className="text-2xl font-bold text-[#ff3e3e]">$7.99</p>
            <p className="text-xs text-gray-400">One-time payment</p>
          </div>
          <button
            onClick={() => onPurchase("1-week")}
            className="interactive-element button-glow mt-4 w-full rounded bg-[#ff3e3e] px-4 py-2 font-semibold text-white transition-all hover:bg-[#ff0000]"
          >
            Get Started
          </button>
        </div>

        <div className="interactive-element rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all">
          <div className="mb-2 text-center">
            <h4 className="text-lg font-bold text-white">1 Month</h4>
            <p className="text-2xl font-bold text-[#ff3e3e]">$17.99</p>
            <p className="text-xs text-gray-400">Monthly subscription</p>
          </div>
          <button
            onClick={() => onPurchase("1-month")}
            className="interactive-element button-glow mt-4 w-full rounded bg-[#ff3e3e] px-4 py-2 font-semibold text-white transition-all hover:bg-[#ff0000]"
          >
            Get Started
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="mb-2 text-sm text-gray-400">
          Continue without premium in <span className="font-bold text-white">{countdown}</span> seconds
        </p>
        <button
          onClick={onSkip}
          disabled={countdown > 0}
          className={`interactive-element rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm text-white transition-all ${
            countdown > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0a0a0a]"
          }`}
        >
          {countdown > 0 ? `Please wait (${countdown}s)` : "Continue to Gateway"}
        </button>
      </div>
    </div>
  )
}

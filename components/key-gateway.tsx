"use client"

import { useState, useEffect } from "react"

interface KeyGatewayProps {
  gatewayId: string
  adLevel: number
  adultAds: boolean
  onComplete: (key: string) => void
  onSkip?: () => void
  isPremium?: boolean
}

export function KeyGateway({ gatewayId, adLevel, adultAds, onComplete, onSkip, isPremium = false }: KeyGatewayProps) {
  const [step, setStep] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [showPremiumOffer, setShowPremiumOffer] = useState(false)
  const [showOfferwall, setShowOfferwall] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [generatedKey, setGeneratedKey] = useState("")
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && showPremiumOffer) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, showPremiumOffer])

  // Handle ad loading
  const handleAdLoaded = () => {
    setAdLoaded(true)
    setAdError(false)
  }

  // Handle ad error
  const handleAdError = () => {
    setAdError(true)
    console.error("Ad failed to load")
  }

  // Simulate ad click - safely
  const handleAdClick = () => {
    // Instead of directly opening a new window, we'll just simulate the ad interaction
    console.log("Ad interaction simulated")

    // Move to next step after ad
    if (step < adLevel) {
      setStep(step + 1)
    } else {
      // If this is the last step, show premium offer for level 2+
      if (adLevel >= 2) {
        setShowPremiumOffer(true)
      } else {
        handleComplete()
      }
    }
  }

  // Handle premium offer skip
  const handleSkipPremium = () => {
    if (adLevel >= 4) {
      setShowOfferwall(true)
    } else {
      handleComplete()
    }
  }

  // Handle completion
  const handleComplete = () => {
    setIsCompleting(true)

    // Simulate API call to generate key
    setTimeout(() => {
      // Generate a random key
      const keyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let key = "NEXUS-"

      for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) key += "-"
        key += keyChars.charAt(Math.floor(Math.random() * keyChars.length))
      }

      setGeneratedKey(key)
      onComplete(key)
      setIsCompleting(false)
    }, 1500)
  }

  // Handle premium purchase
  const handlePremiumPurchase = (plan: string) => {
    // In a real implementation, this would redirect to a payment page
    console.log(`Purchasing ${plan} plan`)

    // For now, just complete the process
    handleComplete()
  }

  // Render ad container safely
  const renderSafeAdContainer = () => {
    return (
      <div className="mb-6 relative min-h-[250px] bg-[#0a0a0a] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {!adLoaded && !adError && (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#ff3e3e] border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-400">Loading advertisement...</p>
            </div>
          )}

          {adError && (
            <div className="text-center p-4">
              <i className="fas fa-exclamation-circle text-3xl text-[#ff3e3e] mb-2"></i>
              <p className="text-white">Ad failed to load</p>
              <button
                onClick={handleAdClick}
                className="mt-4 px-4 py-2 bg-[#ff3e3e] text-white rounded hover:bg-[#ff0000]"
              >
                Continue Anyway
              </button>
            </div>
          )}
        </div>

        {/* Hidden iframe for ad content - this prevents direct DOM access */}
        <div className={`${adLoaded ? "block" : "hidden"}`}>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Advertisement</span>
              <button onClick={handleAdClick} className="text-xs text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bg-[#0a0a0a] rounded p-4 text-center">
              <p className="text-white mb-4">Premium Nexus Scripts</p>
              <div className="bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-white py-2 px-4 rounded inline-block">
                Click to Continue
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render premium offer
  const renderPremiumOffer = () => {
    return (
      <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 mb-6">
        <div className="mb-4 text-center">
          <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-3">
            <i className="fas fa-crown text-3xl text-[#ff3e3e]"></i>
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">Skip All Ads with Premium</h3>
          <p className="mt-2 text-gray-400">Upgrade to NEXUS Premium to get instant access to all keys without ads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="interactive-element rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all">
            <div className="mb-2 text-center">
              <h4 className="text-lg font-bold text-white">3 Days</h4>
              <p className="text-2xl font-bold text-[#ff3e3e]">$3.99</p>
              <p className="text-xs text-gray-400">One-time payment</p>
            </div>
            <button
              onClick={() => handlePremiumPurchase("3-day")}
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
              onClick={() => handlePremiumPurchase("1-week")}
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
              onClick={() => handlePremiumPurchase("1-month")}
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
            onClick={handleSkipPremium}
            disabled={countdown > 0}
            className={`interactive-element rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm text-white transition-all ${
              countdown > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0a0a0a]"
            }`}
          >
            {countdown > 0 ? `Please wait (${countdown}s)` : "Continue to Key"}
          </button>
        </div>
      </div>
    )
  }

  // Render offerwall
  const renderOfferwall = () => {
    return (
      <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 mb-6">
        <div className="mb-4 text-center">
          <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-3">
            <i className="fas fa-tasks text-3xl text-[#ff3e3e]"></i>
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">Complete One Offer</h3>
          <p className="mt-2 text-gray-400">Complete one of the offers below to get your key</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center">
                <i className="fas fa-poll text-blue-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium text-white">Complete a short survey</h4>
                <p className="text-sm text-gray-400">Answer a few questions about your gaming habits</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-green-500/20 flex items-center justify-center">
                <i className="fas fa-download text-green-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium text-white">Download an app</h4>
                <p className="text-sm text-gray-400">Install and open the app for 30 seconds</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center">
                <i className="fas fa-user-plus text-purple-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium text-white">Create an account</h4>
                <p className="text-sm text-gray-400">Sign up for a free account on our partner site</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleComplete}
            className="interactive-element rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm text-white transition-all hover:bg-[#0a0a0a]"
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  // Simulate ad loading
  useEffect(() => {
    if (!isPremium && !showPremiumOffer && !showOfferwall) {
      const timer = setTimeout(() => {
        // 90% chance of ad loading successfully
        if (Math.random() > 0.1) {
          handleAdLoaded()
        } else {
          handleAdError()
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isPremium, showPremiumOffer, showOfferwall, step])

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
      {isPremium ? (
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-[#ff3e3e]/20 p-4">
            <i className="fas fa-crown text-4xl text-[#ff3e3e]"></i>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Premium Key Access</h3>
          <p className="mb-6 text-gray-400">As a premium user, you have instant access to this key without ads</p>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isCompleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Generating Key...</span>
              </div>
            ) : (
              <>Generate Key Now</>
            )}
          </button>
        </div>
      ) : showOfferwall ? (
        renderOfferwall()
      ) : showPremiumOffer ? (
        renderPremiumOffer()
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              Gateway {step}/{adLevel}
            </h3>
            <div className="text-sm text-gray-400">
              <i className="fas fa-shield-alt mr-1"></i> Secure Key Generation
            </div>
          </div>

          {renderSafeAdContainer()}

          <div className="text-center">
            <button
              onClick={handleAdClick}
              className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              {step === adLevel ? "Generate Key" : `Continue to Step ${step + 1}`}
            </button>

            {onSkip && (
              <div className="mt-4">
                <button onClick={onSkip} className="interactive-element text-sm text-gray-400 hover:text-white">
                  Skip for now
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

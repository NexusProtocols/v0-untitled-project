"use client"

import { useState, useEffect } from "react"

interface KeyGatewayProps {
  keyId: string
  adLevel: number
  adultAds: boolean
  onComplete: () => void
  onSkip?: () => void
  isPremium?: boolean
}

export function KeyGateway({ keyId, adLevel, adultAds, onComplete, onSkip, isPremium = false }: KeyGatewayProps) {
  const [step, setStep] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [showPremiumOffer, setShowPremiumOffer] = useState(false)
  const [showOfferwall, setShowOfferwall] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && showPremiumOffer) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, showPremiumOffer])

  // Simulate ad click
  const handleAdClick = () => {
    // In a real implementation, this would open an ad
    window.open("https://example.com/ad", "_blank")

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

    // Simulate completion delay
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  // Handle premium purchase
  const handlePremiumPurchase = (plan: string) => {
    // In a real implementation, this would redirect to a payment page
    console.log(`Purchasing ${plan} plan`)

    // For now, just complete the process
    handleComplete()
  }

  // Render native ads
  const renderNativeAds = () => {
    const adCount = adLevel === 1 ? 5 : 10

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: adCount }).map((_, index) => (
          <div
            key={index}
            className="interactive-element relative overflow-hidden rounded border border-white/10 bg-[#050505] p-3 hover:bg-[#0a0a0a] cursor-pointer"
            onClick={() => window.open("https://example.com/native-ad", "_blank")}
          >
            <div className="absolute top-1 right-1 bg-[#ff3e3e] text-white text-xs px-1 rounded">Ad</div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a]"></div>
              <div>
                <h4 className="text-sm font-medium text-white">
                  {adultAds ? `Hot Singles in Your Area ${index + 1}` : `Amazing Product ${index + 1}`}
                </h4>
                <p className="text-xs text-gray-400">
                  {adultAds ? "Click here to meet now!" : "Limited time offer - 50% off!"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render Opera GX offerwall
  const renderOfferwall = () => {
    return (
      <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 mb-6">
        <div className="mb-4 text-center">
          <img src="/placeholder.svg?height=60&width=200" alt="Opera GX" className="h-15 mx-auto" />
          <h3 className="mt-4 text-xl font-bold text-white">Complete an offer to continue</h3>
          <p className="mt-2 text-gray-400">Choose one of the offers below to unlock your key instantly</p>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="interactive-element rounded border border-white/10 bg-[#050505] p-4 hover:bg-[#0a0a0a] cursor-pointer"
              onClick={() => {
                window.open("https://example.com/offerwall", "_blank")
                // Auto-complete after clicking an offer
                setTimeout(() => {
                  handleComplete()
                }, 1000)
              }}
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a]"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">
                    {index === 0
                      ? "Install Opera GX Browser"
                      : index === 1
                        ? "Complete a short survey"
                        : "Watch a video ad"}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {index === 0
                      ? "Download and install Opera GX gaming browser"
                      : index === 1
                        ? "Answer a few questions about your gaming habits"
                        : "Watch a 30-second video advertisement"}
                  </p>
                </div>
                <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">
                  {index === 0 ? "Easy" : index === 1 ? "Medium" : "Quick"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {onSkip && (
          <div className="mt-6 text-center">
            <button onClick={onSkip} className="interactive-element text-sm text-gray-400 hover:text-white">
              Skip for now
            </button>
          </div>
        )}
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
                <span>Processing...</span>
              </div>
            ) : (
              <>Access Key Now</>
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
              <i className="fas fa-shield-alt mr-1"></i> Secure Key Access
            </div>
          </div>

          {renderNativeAds()}

          <div className="text-center">
            <button
              onClick={handleAdClick}
              className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              {step === adLevel ? "Get Key" : `Continue to Step ${step + 1}`}
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

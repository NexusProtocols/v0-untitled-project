"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SubscriptionPopup } from "@/components/subscription-popup"
import { OperaGxOfferwall } from "@/components/opera-gx-offerwall"
import { GatewayStep } from "@/components/gateway-step"
import { AdContainer } from "@/components/ad-container"

export default function GatewayPage() {
  const params = useParams()
  const router = useRouter()
  const [gateway, setGateway] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false)
  const [showOperaGxOffer, setShowOperaGxOffer] = useState(false)
  const [validationToken, setValidationToken] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [reward, setReward] = useState<{ type: string; content?: string; url?: string } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    const fetchGateway = async () => {
      try {
        // Get gateway from localStorage
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const foundGateway = gateways.find((g: any) => g.id === params.gatewayId)

        if (foundGateway) {
          setGateway(foundGateway)

          // Track gateway visit
          await trackGatewayAction("visit")

          // Generate initial validation token
          generateValidationToken()
        } else {
          setError("Gateway not found")
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("An error occurred while fetching the gateway")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGateway()
  }, [params.gatewayId])

  const generateValidationToken = () => {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setValidationToken(token)
    return token
  }

  // Track gateway actions with the API
  const trackGatewayAction = async (action: string, stepId?: string) => {
    try {
      await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId: params.gatewayId,
          stepId,
          action,
          validationToken,
          userData: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      console.error("Failed to track gateway action:", error)
    }
  }

  const handleStartGateway = () => {
    if (gateway?.settings?.showSubscriptionOptions) {
      setShowSubscriptionPopup(true)
    } else {
      startFirstStep()
    }
  }

  const startFirstStep = () => {
    setCurrentStepIndex(0)
  }

  const handleSubscriptionSkip = () => {
    setShowSubscriptionPopup(false)
    startFirstStep()
  }

  const handleSubscriptionPurchase = () => {
    setShowSubscriptionPopup(false)
    // Skip all steps and show reward
    completeGateway()
  }

  const handleStepComplete = async (stepId: string) => {
    // Mark this step as completed
    setCompletedSteps((prev) => [...prev, stepId])

    const nextStepIndex = currentStepIndex + 1

    if (nextStepIndex < gateway.steps.length) {
      // Move to next step
      setCurrentStepIndex(nextStepIndex)

      // Generate new validation token for the next step
      const newToken = generateValidationToken()
    } else {
      // All steps completed
      await completeGateway()
    }
  }

  const handleOperaGxComplete = () => {
    setShowOperaGxOffer(false)
    completeGateway()
  }

  const completeGateway = async () => {
    // Track gateway completion
    await trackGatewayAction("complete")

    setIsCompleted(true)
    setReward(gateway.reward)

    // Update completion count in localStorage
    const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
    const updatedGateways = gateways.map((g: any) => {
      if (g.id === params.gatewayId) {
        const visits = (g.stats?.visits || 0) + 1
        const completions = (g.stats?.completions || 0) + 1

        return {
          ...g,
          stats: {
            ...g.stats,
            visits,
            completions,
            conversionRate: completions / visits,
          },
        }
      }
      return g
    })

    localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
  }

  const handleCopyReward = () => {
    if (reward?.content) {
      navigator.clipboard
        .writeText(reward.content)
        .then(() => {
          alert("Content copied to clipboard!")
        })
        .catch((error) => {
          console.error("Error copying content:", error)
          alert("Failed to copy content. Please select and copy manually.")
        })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Error</h2>
            <p className="mb-6 text-gray-400">{error}</p>
            <Link
              href="/"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-home mr-2"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Determine ad level from gateway settings
  const adLevel = gateway?.settings?.adLevel || 3
  const adultAds = gateway?.settings?.adultAds || false

  // Render ad banners based on the ad level
  const TopBanner = () => (
    <div className="mb-6">
      <AdContainer tier={adLevel as any} adultAds={adultAds} placement="banner" size="large" />
    </div>
  )

  const SideBanner = () => (
    <div className="hidden lg:block fixed right-2 top-1/4 z-10">
      <AdContainer
        tier={adLevel as any}
        adultAds={adultAds}
        placement="sidebar"
        size="large"
        width={160}
        height={600}
      />
    </div>
  )

  const FooterBanner = () => (
    <div className="mt-8 py-8 bg-[#080808] border-t border-white/5">
      <div className="container mx-auto px-5">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">Our Sponsors</h3>
          <p className="text-sm text-gray-400">These sponsors help keep our service free</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <AdContainer tier={adLevel as any} adultAds={adultAds} placement="footer" size="small" />
          <AdContainer tier={adLevel as any} adultAds={adultAds} placement="footer" size="small" />
          {adLevel >= 3 && <AdContainer tier={adLevel as any} adultAds={adultAds} placement="footer" size="small" />}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Main content */}
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            {gateway.title}
          </h1>

          {adLevel >= 2 && <TopBanner />}

          {!isCompleted ? (
            <>
              {currentStepIndex === -1 ? (
                <div className="mb-6 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-40 w-full md:w-1/3 overflow-hidden rounded">
                      <img
                        src={gateway.imageUrl || "/placeholder.svg?height=200&width=400"}
                        alt={gateway.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-xl font-bold text-white">{gateway.title}</h2>
                      <p className="mt-2 text-gray-400">{gateway.description}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                        <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                          <i className="fas fa-user mr-1"></i> {gateway.creatorName}
                        </span>
                        <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                          <i className="fas fa-door-open mr-1"></i> {gateway.steps.length} Steps
                        </span>
                        <span className="rounded bg-[#050505] px-2 py-1 text-gray-300">
                          <i className="fas fa-clock mr-1"></i> {new Date(gateway.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={handleStartGateway}
                          className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                        >
                          <i className="fas fa-play mr-2"></i> Start Gateway
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : showSubscriptionPopup ? (
                <SubscriptionPopup onSkip={handleSubscriptionSkip} onPurchase={handleSubscriptionPurchase} />
              ) : showOperaGxOffer ? (
                <OperaGxOfferwall onComplete={handleOperaGxComplete} onSkip={completeGateway} />
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-white font-medium">
                        Step {currentStepIndex + 1} of {gateway.steps.length}
                      </div>
                      <div className="text-sm text-gray-400">
                        {Math.round(((currentStepIndex + 1) / gateway.steps.length) * 100)}% Complete
                      </div>
                    </div>
                    <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
                        style={{ width: `${((currentStepIndex + 1) / gateway.steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <GatewayStep
                    step={gateway.steps[currentStepIndex]}
                    stepNumber={currentStepIndex + 1}
                    totalSteps={gateway.steps.length}
                    validationToken={validationToken}
                    gatewayId={gateway.id}
                    onComplete={() => handleStepComplete(gateway.steps[currentStepIndex].id)}
                    onShowOperaGx={() => setShowOperaGxOffer(true)}
                  />
                </>
              )}
            </>
          ) : (
            <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
              <div className="mb-4 inline-block rounded-full bg-green-500/20 p-4">
                <i className="fas fa-check-circle text-4xl text-green-500"></i>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">Gateway Completed!</h2>
              <p className="mb-6 text-gray-400">You have successfully completed all steps.</p>

              {reward?.type === "url" ? (
                <div className="mb-6">
                  <p className="mb-4 text-white">Click the button below to access your reward:</p>
                  <a
                    href={reward.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i> Access Reward
                  </a>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="mb-4 text-white">Here is your reward:</p>
                  <div className="mb-4 rounded border border-white/10 bg-[#050505] p-4 text-left">
                    <pre className="whitespace-pre-wrap break-all text-sm text-gray-300">{reward?.content}</pre>
                  </div>
                  <button
                    onClick={handleCopyReward}
                    className="interactive-element rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
                  >
                    <i className="fas fa-copy mr-2"></i> Copy to Clipboard
                  </button>
                </div>
              )}

              <div className="mt-6">
                <Link
                  href="/"
                  className="interactive-element button-shine inline-flex items-center rounded border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
                >
                  <i className="fas fa-home mr-2"></i> Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side banner for desktop */}
      {adLevel >= 3 && <SideBanner />}

      {/* Footer banners */}
      <FooterBanner />
    </>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"

interface GatewayStepProps {
  step: any
  stepNumber: number
  totalSteps: number
  validationToken: string
  gatewayId: string
  onComplete: () => void
  onShowOperaGx: () => void
}

export function GatewayStep({
  step,
  stepNumber,
  totalSteps,
  validationToken,
  gatewayId,
  onComplete,
  onShowOperaGx,
}: GatewayStepProps) {
  const [countdown, setCountdown] = useState(step.waitTime || 10)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [stepStartTime, setStepStartTime] = useState<Date | null>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timeOnPageRef = useRef<NodeJS.Timeout | null>(null)

  // Track time on page
  useEffect(() => {
    if (showContent) {
      setStepStartTime(new Date())
      setTimeOnPage(0)

      // Track presence on the page
      timeOnPageRef.current = setInterval(() => {
        setTimeOnPage((prev) => prev + 1)
      }, 1000)

      // Track that user started this step
      trackStepAction("step_start")
    } else {
      if (timeOnPageRef.current) {
        clearInterval(timeOnPageRef.current)
      }
    }

    return () => {
      if (timeOnPageRef.current) {
        clearInterval(timeOnPageRef.current)
      }
    }
  }, [showContent])

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && showContent) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }
  }, [countdown, showContent])

  // Track step actions with the API
  const trackStepAction = async (action: string) => {
    try {
      await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          stepId: step.id,
          action,
          validationToken,
          userData: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timeOnStep: timeOnPage,
            stepNumber,
          },
        }),
      })
    } catch (error) {
      console.error("Failed to track step action:", error)
    }
  }

  const handleStartStep = () => {
    setShowContent(true)

    // For offerwall type, show Opera GX offer
    if (step.type === "offerwall") {
      onShowOperaGx()
    }
  }

  const handleCompleteStep = async () => {
    // Prevent completion if user hasn't been on the page long enough
    if (timeOnPage < Math.max(5, step.minTimeRequired || 0)) {
      alert("Please stay on this page a bit longer to validate the step.")
      return
    }

    setIsCompleting(true)

    // Generate a secure completion hash using timestamp and step data
    const timestamp = Date.now()
    const completionData = {
      stepId: step.id,
      gatewayId,
      timestamp,
      timeOnPage,
      userAgent: navigator.userAgent,
    }

    // Convert to string for tracking
    const completionDataString = JSON.stringify(completionData)

    // Track step completion with enhanced security
    try {
      const response = await fetch("/api/gateway/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId,
          stepId: step.id,
          action: "step_complete",
          validationToken,
          userData: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timeOnStep: timeOnPage,
            stepNumber,
            completionData: completionDataString,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setIsCompleting(false)
        alert("Step validation failed. Please try again.")
        return
      }

      // Add a small delay to make the process feel more authentic
      setTimeout(() => {
        onComplete()
        setIsCompleting(false)
      }, 1000)
    } catch (error) {
      console.error("Error completing step:", error)
      setIsCompleting(false)
      alert("An error occurred. Please try again.")
    }
  }

  const handleSkipStep = async () => {
    if (step.skipAllowed) {
      // Track that the step was skipped
      await trackStepAction("step_skip")
      onComplete()
    }
  }

  // Load ad if needed
  useEffect(() => {
    if (showContent && !adLoaded) {
      // Simulate ad loading
      setTimeout(() => {
        setAdLoaded(true)
      }, 1000)
    }
  }, [showContent, adLoaded])

  // Handle URL navigation for link steps
  const handleLinkClick = (url: string) => {
    // Open link in new tab
    window.open(url, "_blank")

    // Update countdown to simulate validation
    setCountdown(Math.min(countdown, 3))
  }

  const renderStepContent = () => {
    // Common ad component to show at the bottom of all steps
    const AdFooter = () => (
      <div className="mt-4 p-4 bg-[#111] rounded border border-white/5">
        <div className="text-center text-xs text-gray-500 mb-2">ADVERTISEMENT</div>
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="bg-[#050505] h-[250px] w-[300px] flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="animate-pulse mb-2">Loading ad...</div>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  atOptions = {
                    'key' : 'bcc7655c0da0cf4f4cae5db51791ed6e',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                  };
                  document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/bcc7655c0da0cf4f4cae5db51791ed6e/invoke.js"></scr' + 'ipt>');
                `,
                }}
              />
            </div>
          </div>
          <div className="bg-[#050505] h-[250px] w-[300px] flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="animate-pulse mb-2">Loading ad...</div>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  atOptions = {
                    'key' : 'bcc7655c0da0cf4f4cae5db51791ed6e',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                  };
                  document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/bcc7655c0da0cf4f4cae5db51791ed6e/invoke.js"></scr' + 'ipt>');
                `,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )

    switch (step.type) {
      case "link":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Social Link</h3>
              <p className="text-sm text-gray-400">
                Click the button below to open the link in a new tab. Wait {countdown} seconds before continuing.
              </p>
            </div>
            <div className="mb-4 text-center">
              <button
                onClick={() => handleLinkClick(step.content.url || "https://discord.gg/nexus")}
                className="interactive-element button-glow inline-block rounded bg-[#ff3e3e] px-6 py-3 font-semibold text-white transition-all hover:bg-[#ff0000]"
              >
                <i className={`fab ${step.content.platform === "discord" ? "fa-discord" : "fa-link"} mr-2`}></i>
                {step.content.buttonText || "Open Link"}
              </button>
            </div>
            <AdFooter />
          </div>
        )

      case "article":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Read Article</h3>
              <p className="text-sm text-gray-400">
                Please read the article below and wait {step.waitTime} seconds before continuing.
              </p>
            </div>
            <div className="mb-4 rounded border border-white/10 bg-[#0a0a0a] p-4 h-60 overflow-y-auto">
              <iframe
                src={step.content.url || "about:blank"}
                className="w-full h-full"
                title="Article Content"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <AdFooter />
          </div>
        )

      case "video":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Watch Video</h3>
              <p className="text-sm text-gray-400">
                Please watch the video below and wait {step.waitTime} seconds before continuing.
              </p>
            </div>
            <div className="mb-4 aspect-video overflow-hidden rounded">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${step.content.videoId || "dQw4w9WgXcQ"}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <AdFooter />
          </div>
        )

      case "download":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Download File</h3>
              <p className="text-sm text-gray-400">
                Please download the file below and wait {step.waitTime} seconds before continuing.
              </p>
            </div>
            <div className="mb-4 text-center">
              <a
                href={step.content.downloadUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-element button-glow inline-block rounded bg-[#ff3e3e] px-6 py-3 font-semibold text-white transition-all hover:bg-[#ff0000]"
                onClick={() => {
                  // Track download click
                  console.log("Download clicked")
                }}
              >
                <i className="fas fa-download mr-2"></i> Download Now
              </a>
            </div>
            <AdFooter />
          </div>
        )

      case "offerwall":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Complete Offer</h3>
              <p className="text-sm text-gray-400">
                Please complete one of the offers below and wait {step.waitTime} seconds before continuing.
              </p>
            </div>
            <div className="mb-4 space-y-4">
              <div className="rounded border border-white/10 bg-[#0a0a0a] p-4 hover:bg-[#111] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a] flex items-center justify-center">
                    <i className="fab fa-discord text-3xl text-[#5865F2]"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Join Our Discord</h4>
                    <p className="text-sm text-gray-400">Join our community Discord server for exclusive benefits</p>
                  </div>
                  <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">
                    Easy
                  </div>
                </div>
              </div>

              <div className="rounded border border-white/10 bg-[#0a0a0a] p-4 hover:bg-[#111] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a] flex items-center justify-center">
                    <i className="fab fa-opera text-3xl text-[#FF1B2D]"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Install Opera GX</h4>
                    <p className="text-sm text-gray-400">The browser for gamers with built-in ad blocking</p>
                  </div>
                  <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">
                    Quick
                  </div>
                </div>
              </div>

              <div className="rounded border border-white/10 bg-[#0a0a0a] p-4 hover:bg-[#111] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#1a1a1a] flex items-center justify-center">
                    <i className="far fa-file-alt text-3xl text-gray-400"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Complete Survey</h4>
                    <p className="text-sm text-gray-400">Answer a short survey about your gaming experiences</p>
                  </div>
                  <div className="flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white">
                    Medium
                  </div>
                </div>
              </div>
            </div>
            <AdFooter />
          </div>
        )

      case "custom":
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Custom Content</h3>
              <p className="text-sm text-gray-400">
                Please interact with the content below and wait {step.waitTime} seconds before continuing.
              </p>
            </div>
            <div
              className="mb-4 rounded border border-white/10 bg-[#0a0a0a] p-4"
              dangerouslySetInnerHTML={{ __html: step.content.customHtml || "<p>Custom content goes here</p>" }}
            />
            <AdFooter />
          </div>
        )

      default:
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4 text-center">
              <p className="text-gray-400">Loading content...</p>
            </div>
            <AdFooter />
          </div>
        )
    }
  }

  return (
    <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff3e3e] text-white">
            {stepNumber}
          </div>
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
        </div>
        <div className="text-sm text-gray-400">
          Step {stepNumber} of {totalSteps}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-400">{step.description}</p>
      </div>

      {step.imageUrl && (
        <div className="mb-6">
          <div className="relative h-40 w-full overflow-hidden rounded">
            <img src={step.imageUrl || "/placeholder.svg"} alt={step.title} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {!showContent ? (
        <div className="text-center">
          <button
            onClick={handleStartStep}
            className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
          >
            <i className="fas fa-play mr-2"></i> Start Step
          </button>
        </div>
      ) : (
        <>
          {renderStepContent()}

          <div className="text-center">
            <button
              onClick={handleCompleteStep}
              disabled={countdown > 0 || isCompleting}
              className={`interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50`}
            >
              {isCompleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Processing...</span>
                </div>
              ) : countdown > 0 ? (
                `Please wait (${countdown}s)`
              ) : (
                <>
                  {stepNumber === totalSteps ? "Complete Gateway" : "Continue to Next Step"}{" "}
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>

            {step.skipAllowed && (
              <div className="mt-4">
                <button onClick={handleSkipStep} className="interactive-element text-sm text-gray-400 hover:text-white">
                  Skip this step
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <input type="hidden" name="validationToken" value={validationToken} />
    </div>
  )
}

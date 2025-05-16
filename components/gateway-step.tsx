"use client"

import { useState, useEffect } from "react"

interface GatewayStepProps {
  step: any
  stepNumber: number
  totalSteps: number
  validationToken: string
  onComplete: () => void
  onShowOperaGx: () => void
}

export function GatewayStep({
  step,
  stepNumber,
  totalSteps,
  validationToken,
  onComplete,
  onShowOperaGx,
}: GatewayStepProps) {
  const [countdown, setCountdown] = useState(step.waitTime || 10)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && showContent) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, showContent])

  const handleStartStep = () => {
    setShowContent(true)

    // For offerwall type, show Opera GX offer
    if (step.type === "offerwall") {
      onShowOperaGx()
    }
  }

  const handleCompleteStep = () => {
    setIsCompleting(true)

    // Simulate API call to validate step completion
    setTimeout(() => {
      onComplete()
      setIsCompleting(false)
    }, 1000)
  }

  const handleSkipStep = () => {
    if (step.skipAllowed) {
      onComplete()
    }
  }

  const renderStepContent = () => {
    switch (step.type) {
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
          </div>
        )

      default:
        return (
          <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
            <div className="mb-4 text-center">
              <p className="text-gray-400">Loading content...</p>
            </div>
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

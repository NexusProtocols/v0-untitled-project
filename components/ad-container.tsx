"use client"

import { useEffect, useState, useRef } from "react"

interface AdContainerProps {
  tier: 1 | 2 | 3 | 4 | 5
  adultAds?: boolean
  placement?: "banner" | "sidebar" | "footer" | "popup" | "native"
  size?: "small" | "medium" | "large" | "custom"
  width?: number
  height?: number
  onAdLoaded?: () => void
  creatorId?: string
  pageId?: string
}

export function AdContainer({
  tier = 1,
  adultAds = false,
  placement = "banner",
  size = "medium",
  width,
  height,
  onAdLoaded,
  creatorId = "default",
  pageId = "default",
}: AdContainerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [adError, setAdError] = useState(false)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const adId = useRef(`ad-${Math.random().toString(36).substring(2, 9)}`)

  // Define ad sizes
  const getAdDimensions = () => {
    if (width && height) return { width, height }

    switch (size) {
      case "small":
        return { width: 300, height: 250 }
      case "medium":
        return { width: 728, height: 90 }
      case "large":
        return { width: 970, height: 250 }
      default:
        return { width: 300, height: 250 }
    }
  }

  // Get ad key based on size and adult content flag
  const getAdKey = () => {
    // Non-adult ads
    if (!adultAds) {
      switch (size) {
        case "small":
          return "bcc7655c0da0cf4f4cae5db51791ed6e" // 300x250
        case "medium":
          return "afac5c8a22a4279d096f7e7e4a6af7bb" // 728x90
        case "large":
          return "206fc6e4acc07626edbea4a600bf0144" // 160x600
        default:
          return "bcc7655c0da0cf4f4cae5db51791ed6e" // Default to 300x250
      }
    } else {
      // Adult ads - using the same keys for demo, but would use different ones in production
      return "bcc7655c0da0cf4f4cae5db51791ed6e"
    }
  }

  const loadAdScript = () => {
    try {
      const dimensions = getAdDimensions()
      const adKey = getAdKey()
      const apiKey = "01d60cbbf2c43ca8e7a491a0cb3a7160" // Demo API key

      // Create a script element for the ad
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.innerHTML = `
        atOptions = {
          'key': '${adKey}',
          'format': 'iframe',
          'height': ${dimensions.height},
          'width': ${dimensions.width},
          'params': {
            'creatorId': '${creatorId}',
            'pageId': '${pageId}',
            'tier': ${tier},
            'placement': '${placement}'
          }
        };
      `
      document.head.appendChild(script)

      // Create the invocation script
      const invocationScript = document.createElement("script")
      invocationScript.type = "text/javascript"
      invocationScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      invocationScript.onload = () => {
        setIsLoaded(true)
        if (onAdLoaded) onAdLoaded()
      }
      invocationScript.onerror = () => {
        setAdError(true)
        console.error("Failed to load ad script")
      }
      document.head.appendChild(invocationScript)

      // If tier is high enough, add additional ad formats
      if (tier >= 3) {
        // Add a direct link ad
        const directLinkScript = document.createElement("script")
        directLinkScript.setAttribute("data-cfasync", "false")
        directLinkScript.setAttribute("async", "async")
        directLinkScript.src = "//pl26646335.profitableratecpm.com/7f32779aa4a341d6d3904d2bfbad1ba3/invoke.js"
        document.head.appendChild(directLinkScript)

        // For tier 4+, add native ads
        if (tier >= 4) {
          const nativeScript = document.createElement("script")
          nativeScript.setAttribute("async", "async")
          nativeScript.setAttribute("data-cfasync", "false")
          nativeScript.src = "//pl26646335.profitableratecpm.com/7f32779aa4a341d6d3904d2bfbad1ba3/invoke.js"
          document.head.appendChild(nativeScript)
        }

        // For tier 5, add popunder ads
        if (tier >= 5) {
          const popunderScript = document.createElement("script")
          popunderScript.type = "text/javascript"
          popunderScript.innerHTML = `
            (function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(
            document.createElement('script'),
            'https://inklinkor.com/tag.min.js',
            5846405,
            document.body||document.documentElement)
          `
          document.head.appendChild(popunderScript)
        }
      }
    } catch (error) {
      console.error("Error loading ad:", error)
      setAdError(true)
    }
  }

  useEffect(() => {
    // Load the ad
    loadAdScript()

    // Cleanup function
    return () => {
      // Remove all ad scripts when component unmounts
      const scripts = document.head.querySelectorAll("script[src*='highperformanceformat']")
      scripts.forEach((script) => script.remove())
    }
  }, [tier, size, adultAds, placement])

  const dimensions = getAdDimensions()

  if (!isVisible) return null

  return (
    <div className="ad-container w-full">
      <div className="text-xs text-center text-gray-500 mb-1">ADVERTISEMENT</div>
      <div
        ref={adContainerRef}
        id={adId.current}
        className={`w-full bg-gray-900 flex items-center justify-center overflow-hidden ${adError ? "border border-red-500/20" : "border border-white/5"}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          margin: "0 auto",
        }}
      >
        {!isLoaded && !adError && <div className="animate-pulse text-gray-500">Loading advertisement...</div>}

        {adError && (
          <div className="text-red-400 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i> Ad failed to load
          </div>
        )}

        {tier >= 3 && placement === "footer" && <div id="container-7f32779aa4a341d6d3904d2bfbad1ba3"></div>}
      </div>
    </div>
  )
}

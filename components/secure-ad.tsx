"use client"

import { useEffect, useRef, useState } from "react"
import { AD_FORMATS } from "@/lib/ad-utils"

interface SecureAdProps {
  adType: keyof typeof AD_FORMATS
  creatorId: string
  className?: string
}

export function SecureAd({ adType, creatorId, className = "" }: SecureAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const adConfig = AD_FORMATS[adType]
    if (!adConfig) return

    try {
      // Create a container for the ad if it's a native format
      if (adConfig.format === "native" && adConfig.containerId) {
        const container = document.createElement("div")
        container.id = adConfig.containerId
        adContainerRef.current?.appendChild(container)
      }

      // Create the script element for ad options
      const optionsScript = document.createElement("script")
      optionsScript.type = "text/javascript"

      // Set the ad options
      if (adConfig.format === "iframe") {
        optionsScript.innerHTML = `
          atOptions = {
            'key' : '${adConfig.key}',
            'format' : '${adConfig.format}',
            'height' : ${adConfig.height},
            'width' : ${adConfig.width},
            'params' : { 'creatorId': '${creatorId}' }
          };
        `
      }

      // Append the options script to the container
      adContainerRef.current?.appendChild(optionsScript)

      // Create the invoke script
      const invokeScript = document.createElement("script")
      invokeScript.type = "text/javascript"

      if (adConfig.format === "iframe") {
        invokeScript.src = `//www.highperformanceformat.com/${adConfig.key}/invoke.js`
      } else if (adConfig.format === "native") {
        invokeScript.src = `//pl26476210.profitableratecpm.com/${adConfig.key}/invoke.js`
        invokeScript.async = true
        invokeScript.setAttribute("data-cfasync", "false")
      }

      // Set up event listeners
      invokeScript.onload = () => {
        setIsLoaded(true)
      }

      invokeScript.onerror = () => {
        setIsError(true)
      }

      // Append the invoke script to the container
      adContainerRef.current?.appendChild(invokeScript)

      // Track impression for earnings
      fetch("/api/track-ad-impression", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adKey: adConfig.key,
          creatorId,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error)
    } catch (error) {
      console.error("Error loading ad:", error)
      setIsError(true)
    }

    // Cleanup function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = ""
      }
    }
  }, [adType, creatorId])

  return (
    <div
      ref={adContainerRef}
      className={`ad-container relative overflow-hidden ${className}`}
      style={{
        minHeight: AD_FORMATS[adType].height ? `${AD_FORMATS[adType].height}px` : "auto",
        minWidth: AD_FORMATS[adType].width ? `${AD_FORMATS[adType].width}px` : "auto",
      }}
    >
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] bg-opacity-50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff3e3e] border-t-transparent"></div>
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] bg-opacity-50">
          <div className="text-center text-sm text-gray-400">Ad failed to load</div>
        </div>
      )}
    </div>
  )
}

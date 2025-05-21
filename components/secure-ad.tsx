"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AD_FORMATS } from "@/lib/ad-utils"

interface SecureAdProps {
  adType: keyof typeof AD_FORMATS
  creatorId: string
  className?: string
  fallback?: React.ReactNode
}

export function SecureAd({ adType, creatorId, className = "", fallback }: SecureAdProps) {
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)
  const adFormat = AD_FORMATS[adType]

  useEffect(() => {
    try {
      // Create a unique container ID for this ad instance
      const containerId = `ad-container-${Math.random().toString(36).substring(2, 9)}`

      // Set up the ad options
      const adOptions = {
        ...adFormat,
        params: {
          creatorId,
          timestamp: Date.now(),
        },
      }

      // Create a safe way to load the ad
      const loadAd = () => {
        try {
          // @ts-ignore - atOptions is a global variable used by the ad network
          window.atOptions = adOptions

          // Create and append the script
          const script = document.createElement("script")
          script.type = "text/javascript"
          script.src = "//www.highperformanceformat.com/" + adFormat.key + "/invoke.js"
          script.onerror = () => {
            setAdError(true)
            console.warn("Ad failed to load:", adType)
          }
          script.onload = () => {
            setAdLoaded(true)
          }

          // Append to the container
          const container = document.getElementById(containerId)
          if (container) {
            container.appendChild(script)
          }
        } catch (error) {
          console.error("Error loading ad:", error)
          setAdError(true)
        }
      }

      // Load the ad with a slight delay to prevent race conditions
      const timer = setTimeout(loadAd, 100)

      return () => {
        clearTimeout(timer)
      }
    } catch (error) {
      console.error("Error setting up ad:", error)
      setAdError(true)
    }
  }, [adType, creatorId, adFormat])

  if (adError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`bg-[#0a0a0a] flex items-center justify-center text-gray-500 ${className}`}
        style={{
          width: adFormat.width ? `${adFormat.width}px` : "100%",
          height: adFormat.height ? `${adFormat.height}px` : "250px",
        }}
      >
        Ad Space
      </div>
    )
  }

  return (
    <div
      id={`ad-container-${Math.random().toString(36).substring(2, 9)}`}
      className={`ad-container ${className}`}
      style={{
        width: adFormat.width ? `${adFormat.width}px` : "100%",
        height: adFormat.height ? `${adFormat.height}px` : "250px",
        minHeight: adFormat.height ? `${adFormat.height}px` : "250px",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!adLoaded && (
        <div className="text-center">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#ff3e3e] border-t-transparent"></div>
          <p className="mt-2 text-xs text-gray-500">Loading ad...</p>
        </div>
      )}
    </div>
  )
}

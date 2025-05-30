"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always true, can't be changed
    performance: true,
    advertising: true,
    thirdParty: true,
  })

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("nexus_cookie_consent")
    if (!hasConsented) {
      setShowConsent(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("nexus_cookie_consent", "full")
    localStorage.setItem(
      "nexus_cookie_settings",
      JSON.stringify({
        necessary: true,
        performance: true,
        advertising: true,
        thirdParty: true,
        timestamp: new Date().toISOString(),
      }),
    )
    setShowConsent(false)
  }

  const saveCustomSettings = () => {
    // Necessary cookies are always true
    const settings = {
      ...cookieSettings,
      necessary: true,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("nexus_cookie_consent", "custom")
    localStorage.setItem("nexus_cookie_settings", JSON.stringify(settings))

    // If user opts out of essential cookies, warn them
    if (!settings.advertising || !settings.performance || !settings.thirdParty) {
      localStorage.setItem("nexus_account_limited", "true")
    }

    setShowConsent(false)
    setShowCustomize(false)
  }

  const handleOptOut = () => {
    localStorage.setItem("nexus_cookie_consent", "minimal")
    localStorage.setItem(
      "nexus_cookie_settings",
      JSON.stringify({
        necessary: true,
        performance: false,
        advertising: false,
        thirdParty: false,
        timestamp: new Date().toISOString(),
      }),
    )
    localStorage.setItem("nexus_account_suspended", "true")
    setShowConsent(false)

    // Show warning about account limitations
    alert(
      "WARNING: Your account has been suspended due to opting out of essential cookies. Some features will be unavailable.",
    )
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#ff3e3e]/30 p-4 shadow-lg">
      {!showCustomize ? (
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">This Site Uses Tracking Technologies</h3>
              <p className="text-sm text-gray-300">
                Nexus requires cookies and device fingerprinting for fraud prevention (HWID/IP logging), ad monetization
                (tracking clicks/impressions), and legal compliance (tax reporting). By continuing, you agree to our{" "}
                <Link href="/cookie-policy" className="text-[#ff3e3e] hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
              <p className="text-xs text-gray-400 mt-2">Closing this modal or scrolling accepts tracking.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={acceptAll}
                className="interactive-element button-glow rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-2 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-6 py-2 font-semibold text-white transition-all hover:bg-[#252525]"
              >
                Customize
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-lg font-bold text-white mb-4">Cookie Preferences</h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded">
              <div>
                <h4 className="font-medium text-white">Strictly Necessary Cookies</h4>
                <p className="text-xs text-gray-400">Required for basic site functionality</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={cookieSettings.necessary}
                  disabled={true}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
                <span className="ml-2 text-xs text-gray-400">Always On</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded">
              <div>
                <h4 className="font-medium text-white">Performance & Analytics</h4>
                <p className="text-xs text-gray-400">Help us improve our website</p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookieSettings.performance}
                  onChange={(e) => setCookieSettings({ ...cookieSettings, performance: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded">
              <div>
                <h4 className="font-medium text-white">Advertising Cookies</h4>
                <p className="text-xs text-gray-400">Required for monetization</p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookieSettings.advertising}
                  onChange={(e) => setCookieSettings({ ...cookieSettings, advertising: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded">
              <div>
                <h4 className="font-medium text-white">Third-Party Cookies</h4>
                <p className="text-xs text-gray-400">Used by our partners</p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookieSettings.thirdParty}
                  onChange={(e) => setCookieSettings({ ...cookieSettings, thirdParty: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button onClick={handleOptOut} className="text-xs text-gray-400 hover:text-[#ff3e3e]">
              Opt out of all non-essential cookies (will suspend account)
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomize(false)}
                className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-4 py-2 text-sm text-white transition-all hover:bg-[#252525]"
              >
                Back
              </button>
              <button
                onClick={saveCustomSettings}
                className="interactive-element button-glow rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

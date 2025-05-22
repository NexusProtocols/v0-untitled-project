"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ScriptManagerPage() {
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Blue Glow Effect for Script Manager */}
            <div
              className="h-24 w-24 animate-pulse rounded-full bg-gradient-to-r from-[#3e9fff] to-[#006eff]"
              style={{
                boxShadow: "0 0 32px 8px #2699fb, 0 0 0 2px #3e9fff80 inset"
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-file-code text-4xl text-white"></i>
            </div>
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3e9fff] to-[#006eff]">
          Script Manager
        </h1>

        <div className="mb-8 rounded-lg border-l-4 border-[#3e9fff] bg-[#1a1a1a] p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-white">Coming Soon</h2>
          <p className="mb-6 text-lg text-gray-300">
            Soon you’ll be able to upload your own scripts, set up a custom key system, and let our API securely check key validity for users.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#3e9fff] to-[#006eff] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#3e9fff]/20"
            >
              <i className="fas fa-home mr-2"></i> Home
            </Link>
            <a
              href="https://discord.gg/ZWCqcuxAv3"
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-element button-shine inline-flex items-center rounded bg-[#1a1a1a] border border-[#3e9fff] px-6 py-3 font-semibold text-[#3e9fff] transition-all hover:bg-[#3e9fff]/10"
            >
              <i className="fab fa-discord mr-2"></i> Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

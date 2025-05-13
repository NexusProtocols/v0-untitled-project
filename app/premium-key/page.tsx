"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PremiumKeyPage() {
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
            <div className="h-24 w-24 animate-pulse rounded-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-crown text-4xl text-white"></i>
            </div>
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Premium Key
        </h1>

        <div className="mb-8 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-white">Coming Soon</h2>
          <p className="mb-6 text-lg text-gray-300">
            We're working hard to bring you exclusive premium features. Stay tuned for updates!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/key-generator"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-key mr-2"></i> Free Key Generator
            </Link>
            <a
              href="https://discord.gg/ZWCqcuxAv3"
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-element button-shine inline-flex items-center rounded bg-[#1a1a1a] border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
            >
              <i className="fab fa-discord mr-2"></i> Join Discord
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <h3 className="mb-4 text-xl font-bold text-[#ff3e3e]">Premium Benefits Coming Soon</h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-center text-gray-300">
              <i className="fas fa-check-circle mr-2 text-[#ff3e3e]"></i> Exclusive scripts
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-check-circle mr-2 text-[#ff3e3e]"></i> Priority support
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-check-circle mr-2 text-[#ff3e3e]"></i> Early access to new features
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-check-circle mr-2 text-[#ff3e3e]"></i> Ad-free experience
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-check-circle mr-2 text-[#ff3e3e]"></i> Custom profile badges
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

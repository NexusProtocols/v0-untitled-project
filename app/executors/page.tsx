"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

export default function ExecutorsPage() {
  const { user } = useAuth()
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
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          BEST EXECUTORS
        </h1>
        <p className="mb-12 text-lg text-gray-300">
          Select from our range of powerful and undetectable script execution tools
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Wave Executor - Paid */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-300 hover:border-[#ff3e3e]/30 hover:shadow-lg hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#ff3e3e]/20 px-3 py-1 text-xs font-medium text-[#ff3e3e]">PAID</span>
            </div>
            <div className="absolute top-0 right-0 z-10 transform rotate-45 translate-x-[30%] -translate-y-[10%]">
              <span className="block w-36 bg-[#ff3e3e] text-center text-xs font-bold py-1 text-black">FEATURED</span>
            </div>
            <div className="relative h-48 w-full">
              <Image
                src="https://cdn.sellsn.io/142d60b2-b958-45f8-bc4c-a7ed326d6a15.png"
                alt="Wave Executor"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-2xl font-bold text-[#ff3e3e]">Wave</h2>
              <p className="mb-4 text-gray-300">
                The most advanced executor with unparalleled performance and security features.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Ultra-fast execution
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Advanced anti-detection
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Built-in script hub
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Auto-update system
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Multi-game support
                </li>
              </ul>
              <div className="flex gap-2">
                <a
                  href="https://cdn.getwave.gg/userinterface/Wave-Setup.exe"
                  className="flex-1 rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-download mr-2"></i> DOWNLOAD
                </a>
                <a
                  href="https://getwave.gg/"
                  className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-center text-white transition-all hover:border-[#ff3e3e]/30"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-info-circle"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ByteBreaker - Free PC */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-300 hover:border-[#ff3e3e]/30 hover:shadow-lg hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#00ff9d]/20 px-3 py-1 text-xs font-medium text-[#00ff9d]">FREE</span>
            </div>
            <div className="relative h-48 w-full">
              <Image
                src="https://bytebreaker.cc/assets/images/share.jpg?v=f9214227"
                alt="ByteBreaker Executor"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-2xl font-bold text-[#ff3e3e]">bytebreaker.cc</h2>
              <p className="mb-4 text-gray-300">Free PC Web Executor with 90% UNC detection rate.</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Fast script execution
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Basic anti-detection
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Built-in script hub
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Low resource usage
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Stable performance
                </li>
              </ul>
              <div className="flex gap-2">
                <a
                  href="http://a.directfiledl.com/getfile?id=72232183&s=9429BB72"
                  className="flex-1 rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-download mr-2"></i> DOWNLOAD
                </a>
                <a
                  href="https://bytebreaker.cc/"
                  className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-center text-white transition-all hover:border-[#ff3e3e]/30"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-info-circle"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Codex Mobile */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-300 hover:border-[#ff3e3e]/30 hover:shadow-lg hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#5865F2]/20 px-3 py-1 text-xs font-medium text-[#5865F2]">MOBILE</span>
            </div>
            <div className="relative h-48 w-full">
              <Image
                src="https://cdn.sellsn.io/987b657b-ea89-49e9-965f-f0273558b9cc.png"
                alt="Codex Mobile Executor"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-2xl font-bold text-[#ff3e3e]">Codex MOBILE</h2>
              <p className="mb-4 text-gray-300">Optimized executor for mobile gaming platforms with key system.</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Android/iOS support
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Touch-optimized UI
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Built-in script hub
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 100% UNC
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Low battery usage
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <a
                    href="https://download2444.mediafire.com/lu8x9jgv5yfgm1zt-S_tivaOS_6rPUTjemOlx5UPzk1BkIfzUKQ_W3ptJ_mMjWzmWsk_QJqnu9Wl4w5jcUyTgEavU_s_sNlk28ryuq-UN6fgl1iElJYPZoD3-9hg1BXeG7mZBozJ43SKJ5LtNp77bZ8fw-uHvPdZdSWiDnQ0Cec/rwycygi6rvci9to/Codex+v2.668.660.apk"
                    className="flex-1 rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-android mr-2"></i> Android
                  </a>
                  <a
                    href="https://Codex.lol"
                    className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-center text-white transition-all hover:border-[#ff3e3e]/30"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-info-circle"></i>
                  </a>
                </div>
                <a
                  href="https://roxploits.gitbook.io/iosdirectinstall"
                  className="rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-2 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-apple mr-2"></i> iOS
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* System Requirements Section */}
        <div className="mt-16">
          <h2 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            SYSTEM REQUIREMENTS
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 transition-all hover:shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-[#ff3e3e]">Windows</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Windows 10/11 (64-bit)
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 4GB RAM minimum
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 500MB free storage
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> .NET Framework 4.8
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> DirectX 11
                </li>
              </ul>
            </div>

            <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 transition-all hover:shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-[#ff3e3e]">MacOS</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> macOS 10.15 or later
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 8GB RAM recommended
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Intel/Apple Silicon
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 1GB free storage
                </li>
              </ul>
            </div>

            <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6 transition-all hover:shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-[#ff3e3e]">Mobile</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Android 9+ / iOS 14+
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 3GB RAM minimum
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> 200MB free space
                </li>
                <li className="flex items-center text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Root/JB not required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

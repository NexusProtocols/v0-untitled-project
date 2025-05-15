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
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            PREMIUM EXECUTORS
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Select from our range of powerful and undetectable script execution tools, carefully vetted for performance
            and security
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Wave Executor - Paid */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-500 hover:border-[#ff3e3e]/50 hover:shadow-xl hover:shadow-[#ff3e3e]/10 hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#ff3e3e]/20 px-3 py-1 text-xs font-medium text-[#ff3e3e]">PAID</span>
            </div>
            <div className="absolute top-0 right-0 z-10 transform rotate-45 translate-x-[30%] -translate-y-[10%]">
              <span className="block w-36 bg-[#ff3e3e] text-center text-xs font-bold py-1 text-black">FEATURED</span>
            </div>
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src="https://cdn.sellsn.io/142d60b2-b958-45f8-bc4c-a7ed326d6a15.png"
                alt="Wave Executor"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Wave</h2>
                <p className="text-sm text-gray-200 drop-shadow-md">The most advanced executor available</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-400">
                    <i className="fas fa-shield-alt mr-1"></i> 100% Undetected
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-400">
                    <i className="fas fa-bolt mr-1"></i> Ultra Fast
                  </span>
                </div>
              </div>

              <p className="mb-4 text-gray-300">
                The most advanced executor with unparalleled performance and security features. Wave offers the best
                script execution experience with regular updates and premium support.
              </p>

              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Execution Speed</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] h-full rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Script Compatibility</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] h-full rounded-full"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Anti-Detection</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] h-full rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Ultra-fast execution engine
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Advanced anti-detection system
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Built-in script hub with 1000+ scripts
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Auto-update system with instant patches
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#ff3e3e]"></i> Multi-game support with custom APIs
                </li>
              </ul>

              <div className="flex gap-2">
                <a
                  href="https://cdn.getwave.gg/userinterface/Wave-Setup.exe"
                  className="flex-1 rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-download mr-2"></i> DOWNLOAD
                </a>
                <a
                  href="https://getwave.gg/"
                  className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-center text-white transition-all hover:border-[#ff3e3e]/30"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-info-circle"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ByteBreaker - Free PC */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-500 hover:border-[#00ff9d]/50 hover:shadow-xl hover:shadow-[#00ff9d]/10 hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#00ff9d]/20 px-3 py-1 text-xs font-medium text-[#00ff9d]">FREE</span>
            </div>
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src="https://bytebreaker.cc/assets/images/share.jpg?v=f9214227"
                alt="ByteBreaker Executor"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">ByteBreaker</h2>
                <p className="text-sm text-gray-200 drop-shadow-md">Free PC Web Executor</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-400">
                    <i className="fas fa-shield-alt mr-1"></i> 90% Undetected
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-400">
                    <i className="fas fa-bolt mr-1"></i> Fast
                  </span>
                </div>
              </div>

              <p className="mb-4 text-gray-300">
                A powerful free executor with excellent script compatibility and a clean, user-friendly interface.
                ByteBreaker offers great performance without any cost.
              </p>

              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Execution Speed</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] h-full rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Script Compatibility</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] h-full rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Anti-Detection</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] h-full rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#00ff9d]"></i> Fast script execution
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#00ff9d]"></i> Basic anti-detection
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#00ff9d]"></i> Built-in script hub
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#00ff9d]"></i> Low resource usage
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#00ff9d]"></i> Stable performance
                </li>
              </ul>

              <div className="flex gap-2">
                <a
                  href="http://a.directfiledl.com/getfile?id=72232183&s=9429BB72"
                  className="flex-1 rounded bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] px-4 py-3 text-center font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-download mr-2"></i> DOWNLOAD
                </a>
                <a
                  href="https://bytebreaker.cc/"
                  className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-center text-white transition-all hover:border-[#00ff9d]/30"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-info-circle"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Codex Mobile */}
          <div className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-all duration-500 hover:border-[#5865F2]/50 hover:shadow-xl hover:shadow-[#5865F2]/10 hover:-translate-y-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded bg-[#5865F2]/20 px-3 py-1 text-xs font-medium text-[#5865F2]">MOBILE</span>
            </div>
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src="https://cdn.sellsn.io/987b657b-ea89-49e9-965f-f0273558b9cc.png"
                alt="Codex Mobile Executor"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Codex</h2>
                <p className="text-sm text-gray-200 drop-shadow-md">Premium Mobile Executor</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-400">
                    <i className="fas fa-shield-alt mr-1"></i> 100% Undetected
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-400">
                    <i className="fas fa-bolt mr-1"></i> Mobile Optimized
                  </span>
                </div>
              </div>

              <p className="mb-4 text-gray-300">
                The ultimate mobile executor for Android and iOS devices. Codex delivers desktop-level performance with
                a touch-optimized interface designed specifically for mobile gaming.
              </p>

              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Execution Speed</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] h-full rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Script Compatibility</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] h-full rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Anti-Detection</span>
                  <div className="w-32 bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] h-full rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#5865F2]"></i> Android/iOS support
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#5865F2]"></i> Touch-optimized UI
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#5865F2]"></i> Built-in script hub
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#5865F2]"></i> 100% undetectable
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check mr-2 text-[#5865F2]"></i> Low battery usage
                </li>
              </ul>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <a
                    href="https://download2444.mediafire.com/lu8x9jgv5yfgm1zt-S_tivaOS_6rPUTjemOlx5UPzk1BkIfzUKQ_W3ptJ_mMjWzmWsk_QJqnu9Wl4w5jcUyTgEavU_s_sNlk28ryuq-UN6fgl1iElJYPZoD3-9hg1BXeG7mZBozJ43SKJ5LtNp77bZ8fw-uHvPdZdSWiDnQ0Cec/rwycygi6rvci9to/Codex+v2.668.660.apk"
                    className="flex-1 rounded bg-gradient-to-r from-[#5865F2] to-[#4752C4] px-4 py-3 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#5865F2]/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-android mr-2"></i> Android
                  </a>
                  <a
                    href="https://Codex.lol"
                    className="rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-center text-white transition-all hover:border-[#5865F2]/30"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-info-circle"></i>
                  </a>
                </div>
                <a
                  href="https://roxploits.gitbook.io/iosdirectinstall"
                  className="rounded bg-gradient-to-r from-[#5865F2] to-[#4752C4] px-4 py-3 text-center font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#5865F2]/20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-apple mr-2"></i> iOS
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Comparison Section */}
        <div className="mt-16 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-8">
          <h2 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            FEATURES COMPARISON
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-left text-gray-400">Feature</th>
                  <th className="pb-4 text-center text-[#ff3e3e]">Wave</th>
                  <th className="pb-4 text-center text-[#00ff9d]">ByteBreaker</th>
                  <th className="pb-4 text-center text-[#5865F2]">Codex</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-left text-gray-300">Platform</td>
                  <td className="py-3 text-center text-white">Windows</td>
                  <td className="py-3 text-center text-white">Windows</td>
                  <td className="py-3 text-center text-white">Android/iOS</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-left text-gray-300">Execution Speed</td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star-half-alt text-[#00ff9d]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star-half-alt text-[#5865F2]"></i>
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-left text-gray-300">Script Compatibility</td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-left text-gray-300">Anti-Detection</td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star-half-alt text-[#00ff9d]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-left text-gray-300">UI Experience</td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                    <i className="fas fa-star text-[#ff3e3e]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="fas fa-star text-[#00ff9d]"></i>
                    <i className="far fa-star text-[#00ff9d]"></i>
                  </td>
                  <td className="py-3 text-center text-white">
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star text-[#5865F2]"></i>
                    <i className="fas fa-star-half-alt text-[#5865F2]"></i>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-left text-gray-300">Price</td>
                  <td className="py-3 text-center text-white">$19.99</td>
                  <td className="py-3 text-center text-white">Free</td>
                  <td className="py-3 text-center text-white">$9.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

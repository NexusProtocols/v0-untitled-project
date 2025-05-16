"use client"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Welcome to NEXUS
        </h1>

        <p className="mb-10 text-xl text-gray-300">
          The ultimate platform for script sharing with a cyberpunk aesthetic
        </p>

        {user ? (
          <div className="mb-12 rounded-lg border border-[#00ff9d]/20 bg-[#050505] p-6 text-left">
            <h2 className="mb-4 text-2xl font-bold text-[#00ff9d]">Welcome back, {user.username}!</h2>
            <p className="mb-4 text-gray-300">You are now logged in. You can access all features of NEXUS.</p>
            <Link
              href="/scripts"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-7 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/30 button-3d button-glow text-lg relative overflow-hidden group"
            >
              <i className="fas fa-code mr-2 group-hover:animate-bounce"></i>
              <span>Browse Scripts</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine bg-[length:200%_100%]"></span>
            </Link>
          </div>
        ) : (
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-7 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/30 button-3d button-glow relative overflow-hidden"
            >
              <i className="fas fa-user-plus mr-2"></i>
              <span>Create Account</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine bg-[length:200%_100%]"></span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded border-2 border-[#ff3e3e] bg-transparent px-7 py-4 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10 button-3d relative overflow-hidden"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              <span>Login</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine bg-[length:200%_100%]"></span>
            </Link>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-8 transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg hover:shadow-[#ff3e3e]/20 card-hover float-animation">
            <i className="fas fa-code mb-4 text-5xl text-[#ff3e3e] pulse-effect"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Premium Scripts</h3>
            <p className="text-gray-400">Access high-quality scripts with our cyberpunk platform.</p>
            <div className="mt-4 w-1/3 h-1 bg-gradient-to-r from-[#ff3e3e] to-transparent rounded"></div>
          </div>

          <div
            className="rounded-lg border border-white/5 bg-[#0a0a0a] p-8 transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg hover:shadow-[#ff3e3e]/20 card-hover float-animation"
            style={{ animationDelay: "0.2s" }}
          >
            <i className="fas fa-shield-alt mb-4 text-5xl text-[#ff3e3e] pulse-effect"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Secure Execution</h3>
            <p className="text-gray-400">Run scripts safely with our trusted execution environment.</p>
            <div className="mt-4 w-1/3 h-1 bg-gradient-to-r from-[#ff3e3e] to-transparent rounded"></div>
          </div>

          <div
            className="rounded-lg border border-white/5 bg-[#0a0a0a] p-8 transition-all hover:border-[#ff3e3e]/30 hover:shadow-lg hover:shadow-[#ff3e3e]/20 card-hover float-animation"
            style={{ animationDelay: "0.4s" }}
          >
            <i className="fas fa-users mb-4 text-5xl text-[#ff3e3e] pulse-effect"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Community</h3>
            <p className="text-gray-400">Join our growing community of developers and enthusiasts.</p>
            <div className="mt-4 w-1/3 h-1 bg-gradient-to-r from-[#ff3e3e] to-transparent rounded"></div>
          </div>
        </div>
      </div>

      {/* Gateway Section */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
              Gateway System
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create custom gateways with multiple steps to monetize your content. Users complete steps to unlock
              rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="interactive-element rounded-lg border border-white/10 bg-[#1a1a1a] p-6 transition-all hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/5">
              <div className="mb-4 text-center">
                <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-4">
                  <i className="fas fa-door-open text-3xl text-[#ff3e3e]"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Create Gateways</h3>
              <p className="text-gray-400 text-center mb-4">
                Design custom gateways with multiple steps, images, and content types.
              </p>
              <div className="text-center">
                <Link
                  href="/create-gateway"
                  className="interactive-element inline-block rounded border border-[#ff3e3e] px-4 py-2 text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
                >
                  Create Gateway
                </Link>
              </div>
            </div>

            <div className="interactive-element rounded-lg border border-white/10 bg-[#1a1a1a] p-6 transition-all hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/5">
              <div className="mb-4 text-center">
                <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-4">
                  <i className="fas fa-money-bill-wave text-3xl text-[#ff3e3e]"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Monetize Content</h3>
              <p className="text-gray-400 text-center mb-4">
                Earn revenue through ads, offerwalls, and premium subscriptions.
              </p>
              <div className="text-center">
                <Link
                  href="/manage-gateways"
                  className="interactive-element inline-block rounded border border-[#ff3e3e] px-4 py-2 text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
                >
                  Manage Gateways
                </Link>
              </div>
            </div>

            <div className="interactive-element rounded-lg border border-white/10 bg-[#1a1a1a] p-6 transition-all hover:border-[#ff3e3e]/50 hover:shadow-lg hover:shadow-[#ff3e3e]/5">
              <div className="mb-4 text-center">
                <div className="inline-block rounded-full bg-[#ff3e3e]/20 p-4">
                  <i className="fas fa-chart-line text-3xl text-[#ff3e3e]"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Track Performance</h3>
              <p className="text-gray-400 text-center mb-4">
                Monitor visits, completions, and conversion rates for your gateways.
              </p>
              <div className="text-center">
                <Link
                  href="/manage-gateways"
                  className="interactive-element inline-block rounded border border-[#ff3e3e] px-4 py-2 text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
                >
                  View Stats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

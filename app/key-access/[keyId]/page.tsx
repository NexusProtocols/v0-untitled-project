"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KeyGateway } from "@/components/key-gateway"
import { OperaGxOfferwall } from "@/components/opera-gx-offerwall"
import Link from "next/link"

export default function KeyAccessPage({ params }: { params: { keyId: string } }) {
  const router = useRouter()
  const [key, setKey] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showGateway, setShowGateway] = useState(false)
  const [showOfferwall, setShowOfferwall] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    const fetchKey = () => {
      try {
        // In a real implementation, this would be a fetch request to an API
        const keys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")
        const foundKey = keys.find((k: any) => k.id === params.keyId)

        if (foundKey) {
          setKey(foundKey)
        } else {
          setError("Key not found")
        }
      } catch (error) {
        console.error("Error fetching key:", error)
        setError("An error occurred while fetching the key")
      } finally {
        setIsLoading(false)
      }
    }

    fetchKey()
  }, [params.keyId])

  const handleStartGateway = () => {
    setShowGateway(true)
  }

  const handleGatewayComplete = () => {
    setShowGateway(false)
    setAccessGranted(true)
  }

  const handleOfferwallComplete = () => {
    setShowOfferwall(false)
    setAccessGranted(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !key) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Key Not Found</h2>
            <p className="mb-6 text-gray-400">{error || "The requested key could not be found."}</p>
            <Link
              href="/key-generator"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Keys
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Key Access
        </h1>

        {!showGateway && !showOfferwall && !accessGranted && (
          <div className="mb-6 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="relative h-40 w-full overflow-hidden rounded">
                  <img
                    src={key.imageUrl || "/placeholder.svg"}
                    alt={key.title}
                    className="h-full w-full object-cover"
                  />
                  {key.isPremium && (
                    <div className="absolute top-2 right-2 rounded bg-[#ff3e3e] px-2 py-1 text-xs font-bold text-white">
                      PREMIUM
                    </div>
                  )}
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="mb-2 text-xl font-bold text-white">{key.title}</h2>
                <p className="mb-4 text-gray-400">{key.description}</p>
                <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-400">
                  <div>
                    <i className="fas fa-user mr-1"></i> {key.author}
                  </div>
                  <div>
                    <i className="fas fa-calendar mr-1"></i> {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                  {key.game && (
                    <div>
                      <i className="fas fa-gamepad mr-1"></i> {key.game.name}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleStartGateway}
                  className="interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                >
                  <i className="fas fa-key mr-2"></i> Get Key
                </button>
              </div>
            </div>
          </div>
        )}

        {showGateway && (
          <KeyGateway
            keyId={key.id}
            adLevel={key.adLevel || 1}
            adultAds={key.adultAds || false}
            onComplete={handleGatewayComplete}
            isPremium={key.isPremium}
          />
        )}

        {showOfferwall && (
          <OperaGxOfferwall onComplete={handleOfferwallComplete} onSkip={() => setAccessGranted(true)} />
        )}

        {accessGranted && (
          <div className="rounded-lg border-l-4 border-green-500 bg-[#1a1a1a] p-6">
            <div className="mb-4 text-center">
              <div className="inline-block rounded-full bg-green-500/20 p-4">
                <i className="fas fa-check-circle text-4xl text-green-500"></i>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Access Granted!</h3>
              <p className="mt-2 text-gray-400">
                You now have access to the key. Copy it below or click the button to use it.
              </p>
            </div>

            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-white break-all">{key.keyCode}</div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(key.keyCode)
                    alert("Key copied to clipboard!")
                  }}
                  className="interactive-element ml-4 flex-shrink-0 rounded bg-[#ff3e3e] px-3 py-1 text-sm font-medium text-white hover:bg-[#ff0000]"
                >
                  <i className="fas fa-copy mr-1"></i> Copy
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/key-generator"
                className="interactive-element button-shine inline-flex items-center justify-center rounded border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Keys
              </Link>
              {key.game && (
                <a
                  href={`https://www.roblox.com/games/${key.game.gameId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-element button-glow button-3d inline-flex items-center justify-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                >
                  <i className="fas fa-gamepad mr-2"></i> Play Game
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

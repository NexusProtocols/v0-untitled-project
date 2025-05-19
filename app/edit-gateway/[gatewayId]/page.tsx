"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type StageConfig = {
  id: number
  adLevel: number
  taskCount: number
}

const MAX_STAGES = 5

export default function EditGatewayPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [gatewayTitle, setGatewayTitle] = useState("")
  const [gatewayDescription, setGatewayDescription] = useState("")
  const [gatewayImage, setGatewayImage] = useState("")
  const [rewardType, setRewardType] = useState<"url" | "paste">("url")
  const [rewardUrl, setRewardUrl] = useState("")
  const [rewardPaste, setRewardPaste] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading2, setIsLoading2] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(true)
  const [showOperaGxOffer, setShowOperaGxOffer] = useState(true)
  const [blockVpnUsers, setBlockVpnUsers] = useState(true)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true)
  const [rateLimitCount, setRateLimitCount] = useState(1)
  const [rateLimitPeriod, setRateLimitPeriod] = useState<"hour" | "day" | "week" | "month">("day")
  const [adLevel, setAdLevel] = useState(3)
  const [gateway, setGateway] = useState<any | null>(null)
  const [gatewayStats, setGatewayStats] = useState<any | null>(null)

  // Multi-stage (stages) state
  const [stages, setStages] = useState<StageConfig[]>([
    { id: 1, adLevel: 3, taskCount: 2 }
  ])

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/edit-gateway/" + params.gatewayId)
      return
    }

    const fetchGateway = async () => {
      try {
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const foundGateway = gateways.find((g: any) => g.id === params.gatewayId)
        if (foundGateway) {
          setGateway(foundGateway)
          setGatewayTitle(foundGateway.title)
          setGatewayDescription(foundGateway.description)
          setGatewayImage(foundGateway.imageUrl)

          if (foundGateway.reward) {
            setRewardType(foundGateway.reward.type || "url")
            setRewardUrl(foundGateway.reward.url || "")
            setRewardPaste(foundGateway.reward.content || "")
          }

          if (foundGateway.stages && Array.isArray(foundGateway.stages) && foundGateway.stages.length > 0) {
            setStages(foundGateway.stages.map((stage: any, i: number) => ({
              id: i + 1,
              adLevel: stage.adLevel ?? 3,
              taskCount: stage.taskCount ?? 2,
            })))
          }

          if (foundGateway.settings) {
            setShowSubscriptionOptions(foundGateway.settings.showSubscriptionOptions !== false)
            setShowOperaGxOffer(foundGateway.settings.showOperaGxOffer !== false)
            setAdLevel(foundGateway.settings.adLevel || 3)
            setBlockVpnUsers(foundGateway.settings.blockVpnUsers !== false)
            if (foundGateway.settings.rateLimit) {
              setRateLimitEnabled(foundGateway.settings.rateLimit.enabled !== false)
              setRateLimitCount(foundGateway.settings.rateLimit.count || 1)
              setRateLimitPeriod(foundGateway.settings.rateLimit.period || "day")
            }
          }

          // Fetch gateway stats (simulate API)
          try {
            const response = await fetch(`/api/gateway/track?gatewayId=${params.gatewayId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success) setGatewayStats(data.data)
            }
          } catch (error) {
            console.error("Error fetching gateway stats:", error)
          }
        } else {
          setMessage({ type: "error", text: "Gateway not found" })
          setTimeout(() => { router.push("/manage-gateways") }, 2000)
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setMessage({ type: "error", text: "An error occurred while fetching the gateway" })
      } finally {
        setIsLoading2(false)
      }
    }

    if (!isLoading && user) fetchGateway()
  }, [user, isLoading, params.gatewayId, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 10MB" })
      return
    }
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) setGatewayImage(event.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Multi-stage logic
  const addStage = () => {
    if (stages.length < MAX_STAGES)
      setStages([...stages, { id: stages.length + 1, adLevel: 3, taskCount: 2 }])
  }
  const removeStage = (id: number) => {
    if (stages.length > 1)
      setStages(stages.filter((s) => s.id !== id).map((s, i) => ({ ...s, id: i + 1 })))
  }
  const updateStageAdLevel = (id: number, adLevel: number) =>
    setStages(stages.map((s) => (s.id === id ? { ...s, adLevel } : s)))
  const updateStageTaskCount = (id: number, taskCount: number) =>
    setStages(stages.map((s) => (s.id === id ? { ...s, taskCount } : s)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    if (!gatewayTitle) { setMessage({ type: "error", text: "Gateway title is required" }); return }
    if (!gatewayDescription) { setMessage({ type: "error", text: "Gateway description is required" }); return }
    if (!gatewayImage) { setMessage({ type: "error", text: "Gateway image is required" }); return }
    if (stages.length === 0) { setMessage({ type: "error", text: "At least one stage is required" }); return }
    if (rewardType === "url" && !rewardUrl) { setMessage({ type: "error", text: "Reward URL is required" }); return }
    if (rewardType === "paste" && !rewardPaste) { setMessage({ type: "error", text: "Reward content is required" }); return }
    try {
      setIsSubmitting(true)
      const updatedGateway = {
        ...gateway,
        title: gatewayTitle,
        description: gatewayDescription,
        imageUrl: gatewayImage,
        updatedAt: new Date().toISOString(),
        stages: stages,
        reward: {
          type: rewardType,
          url: rewardType === "url" ? rewardUrl : undefined,
          content: rewardType === "paste" ? rewardPaste : undefined,
        },
        settings: {
          showSubscriptionOptions,
          showOperaGxOffer,
          adLevel,
          blockVpnUsers,
          rateLimit: {
            enabled: rateLimitEnabled,
            count: rateLimitCount,
            period: rateLimitPeriod,
          },
        },
      }
      const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      const updatedGateways = gateways.map((g: any) => (g.id === gateway.id ? updatedGateway : g))
      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))
      setMessage({ type: "success", text: "Gateway updated successfully! Redirecting..." })
      setTimeout(() => router.push("/manage-gateways"), 2000)
    } catch (error) {
      console.error("Error updating gateway:", error)
      setMessage({ type: "error", text: "An error occurred while updating the gateway" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoading2) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Edit Gateway
          </h1>
          <Link
            href="/manage-gateways"
            className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-4 py-2 font-medium text-white transition-all hover:bg-[#0a0a0a] hover:scale-105 transform duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Gateways
          </Link>
        </div>

        {message.text && (
          <div
            className={`mb-6 rounded p-4 ${
              message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {gatewayStats && (
          <div className="mb-6 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded bg-[#050505] p-4 text-center">
                <div className="text-3xl font-bold text-[#ff3e3e]">{gatewayStats.visits || 0}</div>
                <div className="text-sm text-gray-400">Total Visits</div>
              </div>
              <div className="rounded bg-[#050505] p-4 text-center">
                <div className="text-3xl font-bold text-[#ff3e3e]">{gatewayStats.completions || 0}</div>
                <div className="text-sm text-gray-400">Completions</div>
              </div>
              <div className="rounded bg-[#050505] p-4 text-center">
                <div className="text-3xl font-bold text-[#ff3e3e]">
                  {gatewayStats.conversionRate ? gatewayStats.conversionRate.toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </div>
              <div className="rounded bg-[#050505] p-4 text-center">
                <div className="text-3xl font-bold text-[#ff3e3e]">${gatewayStats.revenue || "0.00"}</div>
                <div className="text-sm text-gray-400">Estimated Profit</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
          {/* Gateway Info */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Information</h2>
            <div className="mb-4">
              <label htmlFor="gatewayTitle" className="mb-2 block font-medium text-[#ff3e3e]">
                Gateway Title
              </label>
              <input
                type="text"
                id="gatewayTitle"
                value={gatewayTitle}
                onChange={(e) => setGatewayTitle(e.target.value)}
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                placeholder="Enter a title for your gateway"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="gatewayDescription" className="mb-2 block font-medium text-[#ff3e3e]">
                Gateway Description
              </label>
              <textarea
                id="gatewayDescription"
                value={gatewayDescription}
                onChange={(e) => setGatewayDescription(e.target.value)}
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                rows={3}
                placeholder="Describe what users will get from this gateway"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="gatewayImage" className="mb-2 block font-medium text-[#ff3e3e]">
                Gateway Image
              </label>
              <div className="mb-2">
                <input type="file" id="gatewayImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <label
                  htmlFor="gatewayImage"
                  className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md hover:scale-[1.01] transform duration-200"
                >
                  <div className="text-center">
                    <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                    <p className="text-sm text-gray-400">Click to upload gateway image (max 10MB)</p>
                  </div>
                </label>
              </div>
              {gatewayImage && (
                <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                  <div className="relative h-40 w-full overflow-hidden rounded">
                    <img
                      src={gatewayImage || "/placeholder.svg"}
                      alt="Gateway preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setGatewayImage("")}
                      className="interactive-element rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30 hover:scale-105 transform duration-200"
                    >
                      <i className="fas fa-times mr-1"></i> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Stage Gateway Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Multi-Stage Gateway</h2>
            <p className="mb-4 text-sm text-gray-400">
              Configure each stage of your gateway with different task counts and ad levels
            </p>
            <div className="space-y-4 mb-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="rounded-lg border border-white/10 bg-[#000000] p-4 hover:border-[#ff3e3e]/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Stage {stage.id}</h3>
                    <button
                      type="button"
                      onClick={() => removeStage(stage.id)}
                      disabled={stages.length <= 1}
                      className={`ml-auto px-3 py-1 rounded font-semibold text-xs transition-all ${
                        stages.length <= 1
                          ? "opacity-40 cursor-not-allowed"
                          : "bg-red-900/30 text-red-300 hover:bg-red-400/20 hover:text-white"
                      }`}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block font-medium text-[#ff3e3e]">Ad Level</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateStageAdLevel(stage.id, level)}
                            className={`relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-all duration-300 ${
                              stage.adLevel === level
                                ? "bg-gradient-to-r from-[#101010] to-[#232323] text-white border-2 border-[#ff3e3e] shadow-lg shadow-[#ff3e3e]/20"
                                : "bg-[#0a0a0a] text-gray-400 border border-white/10"
                            }`}
                          >
                            <span className="relative z-10">Level {level}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-[#ff3e3e]">Task Count</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => updateStageTaskCount(stage.id, count)}
                            className={`relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-all duration-300 ${
                              stage.taskCount === count
                                ? "bg-gradient-to-r from-[#101010] to-[#232323] text-white border-2 border-[#ff3e3e] shadow-lg shadow-[#ff3e3e]/20"
                                : "bg-[#0a0a0a] text-gray-400 border border-white/10"
                            }`}
                          >
                            <span className="relative z-10">
                              {count} {count === 1 ? "Task" : "Tasks"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={addStage}
                disabled={stages.length >= MAX_STAGES}
                className="px-7 py-3 rounded-xl mt-2 text-lg font-bold bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-white shadow-xl transition-all hover:scale-105 disabled:opacity-40"
              >
                <i className="fas fa-plus mr-2"></i> Add Stage
              </button>
              <div className="mt-2 text-sm text-gray-400">
                {stages.length >= MAX_STAGES ? "Maximum of 5 stages reached." : ""}
              </div>
            </div>
          </div>

          {/* --- Reward Section --- */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Reward</h2>
            <div className="mb-4">
              <label className="mb-2 block font-medium text-[#ff3e3e]">Reward Type</label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setRewardType("url")}
                  className={`interactive-element px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105 transform duration-200 ${
                    rewardType === "url" ? "bg-[#ff3e3e] text-white" : "bg-[#050505] text-white border border-white/10"
                  }`}
                >
                  <i className="fas fa-external-link-alt"></i>
                  <div>
                    <div className="font-semibold">URL Redirect</div>
                    <div className="text-xs opacity-80">Send users to another website</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRewardType("paste")}
                  className={`interactive-element px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105 transform duration-200 ${
                    rewardType === "paste"
                      ? "bg-[#ff3e3e] text-white"
                      : "bg-[#050505] text-white border border-white/10"
                  }`}
                >
                  <i className="fas fa-copy"></i>
                  <div>
                    <div className="font-semibold">Text Content</div>
                    <div className="text-xs opacity-80">Display downloadable content</div>
                  </div>
                </button>
              </div>
            </div>
            {rewardType === "url" ? (
              <div className="mb-4">
                <label htmlFor="rewardUrl" className="mb-2 block font-medium text-[#ff3e3e]">
                  Reward URL
                </label>
                <input
                  type="url"
                  id="rewardUrl"
                  value={rewardUrl}
                  onChange={(e) => setRewardUrl(e.target.value)}
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                  placeholder="https://example.com/reward"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Users will be redirected to this URL after completing all steps
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="rewardPaste" className="mb-2 block font-medium text-[#ff3e3e]">
                  Reward Content
                </label>
                <textarea
                  id="rewardPaste"
                  value={rewardPaste}
                  onChange={(e) => setRewardPaste(e.target.value)}
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                  rows={5}
                  placeholder="Enter the content users will receive after completing all steps"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This content will be displayed to users after completing all steps
                </p>
              </div>
            )}
          </div>

          {/* --- Settings (unchanged from original) --- */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Settings</h2>
            <div className="mb-4">
              <label htmlFor="adLevel" className="mb-2 block font-medium text-[#ff3e3e]">
                Ad Level (1-5)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="adLevel"
                  min="1"
                  max="5"
                  value={adLevel}
                  onChange={(e) => setAdLevel(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-white font-bold min-w-[30px] text-center">{adLevel}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {adLevel === 1 && "Level 1: 5 native ads around the page"}
                {adLevel === 2 && "Level 2: 10 native ads + direct link ads with popup"}
                {adLevel === 3 && "Level 3: Level 2 + additional popups and redirects"}
                {adLevel === 4 && "Level 4: Level 3 + Opera GX offerwall"}
                {adLevel === 5 && "Level 5: Maximum monetization (adult ads allowed)"}
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSubscriptionOptions}
                      onChange={(e) => setShowSubscriptionOptions(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                    />
                    <span className="text-white">Show subscription options to skip ads</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOperaGxOffer}
                      onChange={(e) => setShowOperaGxOffer(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                    />
                    <span className="text-white">Show Opera GX offer</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blockVpnUsers}
                      onChange={(e) => setBlockVpnUsers(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                    />
                    <span className="text-white">Block VPN Users</span>
                  </label>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-[#0a0a0a]">
                <h3 className="text-lg font-medium text-white mb-4">Rate Limit Settings</h3>
                <div className="flex items-center gap-2 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rateLimitEnabled}
                      onChange={(e) => setRateLimitEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                    />
                    <span className="text-white">Rate Limit Per User</span>
                  </label>
                </div>
                {rateLimitEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rateLimitCount" className="mb-2 block text-sm font-medium text-[#ff3e3e]">
                        Max Completions
                      </label>
                      <input
                        type="number"
                        id="rateLimitCount"
                        min="1"
                        max="60"
                        value={rateLimitCount}
                        onChange={(e) =>
                          setRateLimitCount(Math.max(1, Math.min(60, Number.parseInt(e.target.value) || 1)))
                        }
                        className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="rateLimitPeriod" className="mb-2 block text-sm font-medium text-[#ff3e3e]">
                        Time Period
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(["hour", "day", "week", "month"] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setRateLimitPeriod(period)}
                            className={`relative overflow-hidden rounded-lg px-3 py-1 font-medium transition-all duration-300 ${
                              rateLimitPeriod === period
                                ? "bg-gradient-to-r from-[#1a1a1a] to-[#000000] text-white border-2 border-[#ff3e3e] shadow-lg shadow-[#ff3e3e]/20"
                                : "bg-[#0a0a0a] text-gray-400 border border-white/10"
                            }`}
                          >
                            <span className="relative z-10 capitalize">{period}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        Users can complete your gateways {rateLimitCount} time{rateLimitCount !== 1 ? "s" : ""} per{" "}
                        {rateLimitPeriod}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 hover:scale-105 transform duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Updating Gateway...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i> Update Gateway
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

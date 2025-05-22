"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type StepType = "redirect" | "article" | "operagx" | "youtube" | "direct"

export default function CreateGatewayPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gatewayTitle, setGatewayTitle] = useState("")
  const [gatewayDescription, setGatewayDescription] = useState("")
  const [gatewayImage, setGatewayImage] = useState("")
  const [rewardType, setRewardType] = useState<"url" | "paste">("url")
  const [rewardUrl, setRewardUrl] = useState("")
  const [rewardPaste, setRewardPaste] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(true)
  const [showOperaGxOffer, setShowOperaGxOffer] = useState(true)
  const [blockVpnUsers, setBlockVpnUsers] = useState(true)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true)
  const [rateLimitCount, setRateLimitCount] = useState(5)
  const [rateLimitPeriod, setRateLimitPeriod] = useState<"hour" | "day" | "week" | "month">("day")

  // Multi-stage gateway (start with stage 1 only)
  const [stages, setStages] = useState([{ id: 1, level: 3, taskCount: 2 }])
  const MAX_STAGES = 5

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/create-gateway")
    }
  }, [user, isLoading, router])

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

  const updateStageLevel = (stageId: number, level: number) => {
    setStages(stages.map((stage) => (stage.id === stageId ? { ...stage, level } : stage)))
  }

  const updateStageTaskCount = (stageId: number, taskCount: number) => {
    setStages(stages.map((stage) => (stage.id === stageId ? { ...stage, taskCount } : stage)))
  }

  const addStage = () => {
    if (stages.length < MAX_STAGES) {
      setStages([...stages, { id: stages.length + 1, level: 3, taskCount: 2 }])
    }
  }

  // Generate steps for a stage
  const generateStepsForStage = (stage: { level: number; taskCount: number }) => {
    const steps = []
    const { level, taskCount } = stage
    const stepTypes: StepType[] = []
    stepTypes.push("redirect")
    if (level >= 2) stepTypes.push("operagx")
    if (level >= 3) stepTypes.push("article")
    if (level >= 4) stepTypes.push("youtube")
    if (level >= 5) stepTypes.push("direct")
    while (stepTypes.length < taskCount) stepTypes.push("redirect")
    const finalStepTypes = stepTypes.slice(0, taskCount)
    for (let i = 0; i < finalStepTypes.length; i++) {
      const type = finalStepTypes[i]
      steps.push({
        id: `${type}-${i}-${Date.now()}`,
        type,
        title: getStepTitle(type, i),
        description: getStepDescription(type),
        imageUrl: "",
        waitTime: getStepWaitTime(type),
        content: getStepContent(type),
        skipAllowed: false,
      })
    }
    return steps
  }

  // Helpers for step generation
  const getStepTitle = (type: StepType, index: number) => {
    switch (type) {
      case "redirect":
        return `Visit Website ${index + 1}`
      case "article":
        return "Read Article"
      case "operagx":
        return "Download Opera GX"
      case "youtube":
        return "Watch Video"
      case "direct":
        return "Visit Sponsor"
      default:
        return "Complete Task"
    }
  }
  const getStepDescription = (type: StepType) => {
    switch (type) {
      case "redirect":
        return "Visit this website to continue"
      case "article":
        return "Read this article to continue"
      case "operagx":
        return "Download Opera GX browser to continue"
      case "youtube":
        return "Watch this video to continue"
      case "direct":
        return "Visit our sponsor to continue"
      default:
        return "Complete this task to continue"
    }
  }
  const getStepWaitTime = (type: StepType) => {
    switch (type) {
      case "redirect":
        return 10
      case "article":
        return 15
      case "operagx":
        return 10
      case "youtube":
        return 20
      case "direct":
        return 10
      default:
        return 10
    }
  }
  const getStepContent = (type: StepType) => {
    switch (type) {
      case "redirect":
        return { url: "https://example.com", platform: "other", buttonText: "Visit Link" }
      case "article":
        return { url: "https://example.com/article" }
      case "youtube":
        return { videoId: "dQw4w9WgXcQ" }
      case "operagx":
      case "direct":
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    if (!gatewayTitle) {
      setMessage({ type: "error", text: "Gateway title is required" })
      return
    }
    if (!gatewayDescription) {
      setMessage({ type: "error", text: "Gateway description is required" })
      return
    }
    if (!gatewayImage) {
      setMessage({ type: "error", text: "Gateway image is required" })
      return
    }
    if (rewardType === "url" && !rewardUrl) {
      setMessage({ type: "error", text: "Reward URL is required" })
      return
    }
    if (rewardType === "paste" && !rewardPaste) {
      setMessage({ type: "error", text: "Reward content is required" })
      return
    }
    try {
      setIsSubmitting(true)
      const gatewayId = `gateway-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const gatewayObject = {
        id: gatewayId,
        title: gatewayTitle,
        description: gatewayDescription,
        imageUrl: gatewayImage,
        creatorId: user?.id,
        creatorName: user?.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        stages: stages.map((stage) => ({
          ...stage,
          steps: generateStepsForStage(stage),
        })),
        reward: {
          type: rewardType,
          url: rewardType === "url" ? rewardUrl : undefined,
          content: rewardType === "paste" ? rewardPaste : undefined,
        },
        settings: {
          showSubscriptionOptions,
          showOperaGxOffer,
          blockVpnUsers,
          rateLimit: {
            enabled: rateLimitEnabled,
            count: rateLimitCount,
            period: rateLimitPeriod,
          },
        },
        stats: {
          visits: 0,
          completions: 0,
          conversionRate: 0,
          revenue: 0,
        },
      }
      const existingGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      existingGateways.push(gatewayObject)
      localStorage.setItem("nexus_gateways", JSON.stringify(existingGateways))
      setMessage({ type: "success", text: "Gateway created successfully! Redirecting..." })
      setTimeout(() => {
        router.push("/manage-gateways")
      }, 2000)
    } catch (error) {
      console.error("Error creating gateway:", error)
      setMessage({ type: "error", text: "An error occurred while creating the gateway" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Create Gateway
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

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 shadow-lg shadow-[#ff3e3e]/10"
        >
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
                className="input-focus-effect w-full rounded border border-white/10 bg-[#000000] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
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
                className="input-focus-effect w-full rounded border border-white/10 bg-[#000000] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
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
                  className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#000000] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md hover:scale-[1.01] transform duration-200"
                >
                  <div className="text-center">
                    <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                    <p className="text-sm text-gray-400">Click to upload gateway image (max 10MB)</p>
                  </div>
                </label>
              </div>
              {gatewayImage && (
                <div className="mt-4 rounded border border-white/10 bg-[#000000] p-2">
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

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Reward</h2>
            <div className="mb-4">
              <label className="mb-2 block font-medium text-[#ff3e3e]">Reward Type</label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setRewardType("url")}
                  className={`interactive-element px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105 transform duration-200 ${
                    rewardType === "url" ? "bg-[#ff3e3e] text-white" : "bg-[#000000] text-white border border-white/10"
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
                      : "bg-[#000000] text-white border border-white/10"
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
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#000000] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
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
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#000000] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:scale-[1.01] transform duration-200"
                  rows={5}
                  placeholder="Enter the content users will receive after completing all steps"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This content will be displayed to users after completing all steps
                </p>
              </div>
            )}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block font-medium text-[#ff3e3e]">Ad Level</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateStageLevel(stage.id, level)}
                            className={`relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-all duration-300 ${
                              stage.level === level
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

          {/* Gateway Settings */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Settings</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSubscriptionOptions}
                      onChange={(e) => setShowSubscriptionOptions(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#000000] text-[#ff3e3e]"
                    />
                    <span className="text-white">Show subscription options to skip ads</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOperaGxOffer}
                      onChange={(e) => setShowOperaGxOffer(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#000000] text-[#ff3e3e]"
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
                      className="h-4 w-4 rounded border-white/10 bg-[#000000] text-[#ff3e3e]"
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
                      className="h-4 w-4 rounded border-white/10 bg-[#000000] text-[#ff3e3e]"
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
                        className="input-focus-effect w-full rounded border border-white/10 bg-[#000000] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
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
                                ? "bg-gradient-to-r from-[#101010] to-[#232323] text-white border-2 border-[#ff3e3e] shadow-lg shadow-[#ff3e3e]/20"
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
                <span>Creating Gateway...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i> Create Gateway
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

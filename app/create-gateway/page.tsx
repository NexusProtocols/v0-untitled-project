"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

interface GatewayStep {
  id: string
  title: string
  description: string
  imageUrl: string
  type: "offerwall" | "article" | "video" | "download" | "custom" | "link"
  waitTime: number
  content: {
    url?: string
    text?: string
    videoId?: string
    downloadUrl?: string
    customHtml?: string
    platform?: string
    buttonText?: string
  }
  skipAllowed: boolean
}

export default function CreateGatewayPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gatewayTitle, setGatewayTitle] = useState("")
  const [gatewayDescription, setGatewayDescription] = useState("")
  const [gatewayImage, setGatewayImage] = useState("")
  const [rewardType, setRewardType] = useState<"url" | "paste">("url")
  const [rewardUrl, setRewardUrl] = useState("")
  const [rewardPaste, setRewardPaste] = useState("")
  const [steps, setSteps] = useState<GatewayStep[]>([])
  const [currentStep, setCurrentStep] = useState<GatewayStep | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(true)
  const [showOperaGxOffer, setShowOperaGxOffer] = useState(true)
  const [isRewardUrlRedirect, setIsRewardUrlRedirect] = useState(true)
  const [adLevel, setAdLevel] = useState(3)
  const [adultAds, setAdultAds] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/create-gateway")
    }
  }, [user, isLoading, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setGatewayImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleStepImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentStep) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setCurrentStep({
          ...currentStep,
          imageUrl: event.target.result as string,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const addNewStep = () => {
    const newStep: GatewayStep = {
      id: `step-${Date.now()}`,
      title: "",
      description: "",
      imageUrl: "",
      type: "link",
      waitTime: 10,
      content: {},
      skipAllowed: false, // Default to non-skippable
    }
    setCurrentStep(newStep)
    setEditingStepIndex(null)
  }

  const editStep = (index: number) => {
    setCurrentStep({ ...steps[index] })
    setEditingStepIndex(index)
  }

  const saveStep = () => {
    if (!currentStep) return

    if (!currentStep.title) {
      setMessage({ type: "error", text: "Step title is required" })
      return
    }

    if (!currentStep.description) {
      setMessage({ type: "error", text: "Step description is required" })
      return
    }

    // For link type, ensure the URL is properly formatted
    if (currentStep.type === "link" && currentStep.content.url) {
      // If it's a Discord invite, format it properly
      if (currentStep.content.platform === "discord" && !currentStep.content.url.startsWith("https://")) {
        // Check if it's just the invite code
        if (!currentStep.content.url.includes("discord.gg/")) {
          currentStep.content.url = `https://discord.gg/${currentStep.content.url}`
        } else if (!currentStep.content.url.startsWith("https://")) {
          currentStep.content.url = `https://${currentStep.content.url}`
        }
      }
      // For other URLs, ensure they have https://
      else if (!currentStep.content.url.startsWith("http://") && !currentStep.content.url.startsWith("https://")) {
        currentStep.content.url = `https://${currentStep.content.url}`
      }
    }

    if (editingStepIndex !== null) {
      // Update existing step
      const updatedSteps = [...steps]
      updatedSteps[editingStepIndex] = currentStep
      setSteps(updatedSteps)
    } else {
      // Add new step
      setSteps([...steps, currentStep])
    }

    setCurrentStep(null)
    setEditingStepIndex(null)
    setMessage({ type: "", text: "" })
  }

  const deleteStep = (index: number) => {
    if (confirm("Are you sure you want to delete this step?")) {
      const updatedSteps = [...steps]
      updatedSteps.splice(index, 1)
      setSteps(updatedSteps)
    }
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === steps.length - 1)) {
      return
    }

    const updatedSteps = [...steps]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[targetIndex]
    updatedSteps[targetIndex] = temp
    setSteps(updatedSteps)
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

    if (steps.length === 0) {
      setMessage({ type: "error", text: "At least one step is required" })
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

      // Create a gateway object
      const gateway = {
        id: `gateway-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: gatewayTitle,
        description: gatewayDescription,
        imageUrl: gatewayImage,
        creatorId: user?.id,
        creatorName: user?.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        steps: steps,
        reward: {
          type: rewardType,
          url: rewardType === "url" ? rewardUrl : undefined,
          content: rewardType === "paste" ? rewardPaste : undefined,
        },
        settings: {
          showSubscriptionOptions,
          showOperaGxOffer,
          adLevel,
          adultAds,
        },
        stats: {
          visits: 0,
          completions: 0,
          conversionRate: 0,
          revenue: 0,
        },
      }

      // Get existing gateways from localStorage or initialize empty array
      const existingGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")

      // Add new gateway
      existingGateways.push(gateway)

      // Save back to localStorage
      localStorage.setItem("nexus_gateways", JSON.stringify(existingGateways))

      // Show success message
      setMessage({ type: "success", text: "Gateway created successfully! Redirecting..." })

      // Redirect to manage gateways page after a delay
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

  if (isLoading) {
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
            Create Gateway
          </h1>
          <Link
            href="/manage-gateways"
            className="interactive-element rounded border border-white/10 bg-[#1a1a1a] px-4 py-2 font-medium text-white transition-all hover:bg-[#0a0a0a]"
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

        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
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
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
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
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
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
                  className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md"
                >
                  <div className="text-center">
                    <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                    <p className="text-sm text-gray-400">Click to upload gateway image (max 2MB)</p>
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
                      className="interactive-element rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30"
                    >
                      <i className="fas fa-times mr-1"></i> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Steps</h2>

            {steps.length > 0 ? (
              <div className="mb-4 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="rounded border border-white/10 bg-[#050505] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff3e3e] text-white">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-white">{step.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveStep(index, "up")}
                            className="interactive-element rounded bg-[#1a1a1a] p-1 text-gray-400 transition-all hover:text-white"
                          >
                            <i className="fas fa-arrow-up"></i>
                          </button>
                        )}
                        {index < steps.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveStep(index, "down")}
                            className="interactive-element rounded bg-[#1a1a1a] p-1 text-gray-400 transition-all hover:text-white"
                          >
                            <i className="fas fa-arrow-down"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => editStep(index)}
                          className="interactive-element rounded bg-[#1a1a1a] p-1 text-gray-400 transition-all hover:text-white"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStep(index)}
                          className="interactive-element rounded bg-[#1a1a1a] p-1 text-gray-400 transition-all hover:text-red-400"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">{step.description}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-[#1a1a1a] px-2 py-1 text-gray-300">
                        Type: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                      </span>
                      <span className="rounded bg-[#1a1a1a] px-2 py-1 text-gray-300">Wait Time: {step.waitTime}s</span>
                      {step.skipAllowed ? (
                        <span className="rounded bg-green-900/30 px-2 py-1 text-green-300">Skippable</span>
                      ) : (
                        <span className="rounded bg-red-900/30 px-2 py-1 text-red-300">Not Skippable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 rounded border border-dashed border-white/20 bg-[#050505] p-6 text-center">
                <p className="text-gray-400">No steps added yet. Add your first step below.</p>
              </div>
            )}

            {!currentStep ? (
              <button
                type="button"
                onClick={addNewStep}
                className="interactive-element w-full rounded border border-dashed border-white/20 bg-[#050505] py-3 text-center text-gray-400 transition-all hover:border-[#ff3e3e]/50 hover:text-white"
              >
                <i className="fas fa-plus mr-2"></i> Add Step
              </button>
            ) : (
              <div className="rounded border border-white/10 bg-[#0a0a0a] p-4">
                <h3 className="mb-4 text-lg font-medium text-white">
                  {editingStepIndex !== null ? "Edit Step" : "Add New Step"}
                </h3>

                <div className="mb-4">
                  <label htmlFor="stepTitle" className="mb-2 block font-medium text-[#ff3e3e]">
                    Step Title
                  </label>
                  <input
                    type="text"
                    id="stepTitle"
                    value={currentStep.title}
                    onChange={(e) => setCurrentStep({ ...currentStep, title: e.target.value })}
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    placeholder="Enter step title"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="stepDescription" className="mb-2 block font-medium text-[#ff3e3e]">
                    Step Description
                  </label>
                  <textarea
                    id="stepDescription"
                    value={currentStep.description}
                    onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                    className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    rows={2}
                    placeholder="Describe what users need to do in this step"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="stepImage" className="mb-2 block font-medium text-[#ff3e3e]">
                    Step Image
                  </label>
                  <div className="mb-2">
                    <input
                      type="file"
                      id="stepImage"
                      accept="image/*"
                      onChange={handleStepImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="stepImage"
                      className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md"
                    >
                      <div className="text-center">
                        <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                        <p className="text-sm text-gray-400">Click to upload step image (max 2MB)</p>
                      </div>
                    </label>
                  </div>

                  {currentStep.imageUrl && (
                    <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                      <div className="relative h-32 w-full overflow-hidden rounded">
                        <img
                          src={currentStep.imageUrl || "/placeholder.svg"}
                          alt="Step preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep({ ...currentStep, imageUrl: "" })}
                          className="interactive-element rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30"
                        >
                          <i className="fas fa-times mr-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stepType" className="mb-2 block font-medium text-[#ff3e3e]">
                      Step Type
                    </label>
                    <select
                      id="stepType"
                      value={currentStep.type}
                      onChange={(e) =>
                        setCurrentStep({
                          ...currentStep,
                          type: e.target.value as "offerwall" | "article" | "video" | "download" | "custom" | "link",
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    >
                      <option value="link">Social Link</option>
                      <option value="offerwall">Offerwall</option>
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="download">Download</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="waitTime" className="mb-2 block font-medium text-[#ff3e3e]">
                      Wait Time (seconds)
                    </label>
                    <input
                      type="number"
                      id="waitTime"
                      value={currentStep.waitTime}
                      onChange={(e) =>
                        setCurrentStep({ ...currentStep, waitTime: Math.max(0, Number.parseInt(e.target.value) || 0) })
                      }
                      min="0"
                      max="60"
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    />
                  </div>
                </div>

                {/* Content based on step type */}
                {currentStep.type === "link" && (
                  <div className="mb-4">
                    <label className="mb-2 block font-medium text-[#ff3e3e]">Social Platform</label>
                    <div className="mb-4 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep({
                            ...currentStep,
                            content: {
                              ...currentStep.content,
                              platform: "discord",
                              buttonText: "Join Discord",
                            },
                          })
                        }
                        className={`px-3 py-2 rounded flex items-center gap-2 ${
                          currentStep.content.platform === "discord"
                            ? "bg-[#5865F2] text-white"
                            : "bg-[#050505] text-white border border-white/10"
                        }`}
                      >
                        <i className="fab fa-discord"></i> Discord
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep({
                            ...currentStep,
                            content: {
                              ...currentStep.content,
                              platform: "youtube",
                              buttonText: "Subscribe on YouTube",
                            },
                          })
                        }
                        className={`px-3 py-2 rounded flex items-center gap-2 ${
                          currentStep.content.platform === "youtube"
                            ? "bg-[#FF0000] text-white"
                            : "bg-[#050505] text-white border border-white/10"
                        }`}
                      >
                        <i className="fab fa-youtube"></i> YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep({
                            ...currentStep,
                            content: {
                              ...currentStep.content,
                              platform: "twitter",
                              buttonText: "Follow on Twitter",
                            },
                          })
                        }
                        className={`px-3 py-2 rounded flex items-center gap-2 ${
                          currentStep.content.platform === "twitter"
                            ? "bg-[#1DA1F2] text-white"
                            : "bg-[#050505] text-white border border-white/10"
                        }`}
                      >
                        <i className="fab fa-twitter"></i> Twitter
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep({
                            ...currentStep,
                            content: {
                              ...currentStep.content,
                              platform: "other",
                              buttonText: "Visit Link",
                            },
                          })
                        }
                        className={`px-3 py-2 rounded flex items-center gap-2 ${
                          currentStep.content.platform === "other" || !currentStep.content.platform
                            ? "bg-[#ff3e3e] text-white"
                            : "bg-[#050505] text-white border border-white/10"
                        }`}
                      >
                        <i className="fas fa-link"></i> Other
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="linkUrl" className="mb-2 block font-medium text-[#ff3e3e]">
                          Link URL or Invite Code
                        </label>
                        <input
                          type="text"
                          id="linkUrl"
                          value={currentStep.content.url || ""}
                          onChange={(e) =>
                            setCurrentStep({
                              ...currentStep,
                              content: { ...currentStep.content, url: e.target.value },
                            })
                          }
                          className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                          placeholder={
                            currentStep.content.platform === "discord"
                              ? "ZWCqcuxAv3 or discord.gg/ZWCqcuxAv3"
                              : "https://example.com"
                          }
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          {currentStep.content.platform === "discord"
                            ? "You can enter just the invite code or the full URL"
                            : "Enter the full URL with https://"}
                        </p>
                      </div>

                      <div>
                        <label htmlFor="buttonText" className="mb-2 block font-medium text-[#ff3e3e]">
                          Button Text
                        </label>
                        <input
                          type="text"
                          id="buttonText"
                          value={currentStep.content.buttonText || ""}
                          onChange={(e) =>
                            setCurrentStep({
                              ...currentStep,
                              content: { ...currentStep.content, buttonText: e.target.value },
                            })
                          }
                          className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                          placeholder="Visit Link"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.type === "offerwall" && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-400">
                      Offerwall will display a list of offers for users to complete. No additional configuration needed.
                    </p>
                  </div>
                )}

                {currentStep.type === "article" && (
                  <div className="mb-4">
                    <label htmlFor="articleUrl" className="mb-2 block font-medium text-[#ff3e3e]">
                      Article URL
                    </label>
                    <input
                      type="url"
                      id="articleUrl"
                      value={currentStep.content.url || ""}
                      onChange={(e) =>
                        setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, url: e.target.value },
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="https://example.com/article"
                    />
                  </div>
                )}

                {currentStep.type === "video" && (
                  <div className="mb-4">
                    <label htmlFor="videoId" className="mb-2 block font-medium text-[#ff3e3e]">
                      YouTube Video ID
                    </label>
                    <input
                      type="text"
                      id="videoId"
                      value={currentStep.content.videoId || ""}
                      onChange={(e) =>
                        setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, videoId: e.target.value },
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="dQw4w9WgXcQ"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Enter the YouTube video ID (e.g., dQw4w9WgXcQ from https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </p>
                  </div>
                )}

                {currentStep.type === "download" && (
                  <div className="mb-4">
                    <label htmlFor="downloadUrl" className="mb-2 block font-medium text-[#ff3e3e]">
                      Download URL
                    </label>
                    <input
                      type="url"
                      id="downloadUrl"
                      value={currentStep.content.downloadUrl || ""}
                      onChange={(e) =>
                        setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, downloadUrl: e.target.value },
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      placeholder="https://example.com/download"
                    />
                  </div>
                )}

                {currentStep.type === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customHtml" className="mb-2 block font-medium text-[#ff3e3e]">
                      Custom HTML Content
                    </label>
                    <textarea
                      id="customHtml"
                      value={currentStep.content.customHtml || ""}
                      onChange={(e) =>
                        setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, customHtml: e.target.value },
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      rows={4}
                      placeholder="<div>Your custom HTML content here</div>"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Enter custom HTML content. Be careful with scripts as they may be sanitized.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentStep.skipAllowed}
                      onChange={(e) => setCurrentStep({ ...currentStep, skipAllowed: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                    />
                    <span className="text-white">Allow users to skip this step</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveStep}
                    className="interactive-element flex-1 rounded bg-[#ff3e3e] px-4 py-2 font-medium text-white transition-all hover:bg-[#ff0000]"
                  >
                    {editingStepIndex !== null ? "Update Step" : "Add Step"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(null)
                      setEditingStepIndex(null)
                    }}
                    className="interactive-element rounded border border-white/10 bg-[#050505] px-4 py-2 font-medium text-white transition-all hover:bg-[#0a0a0a]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-white">Gateway Reward</h2>

            <div className="mb-4">
              <label className="mb-2 block font-medium text-[#ff3e3e]">Reward Type</label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setRewardType("url")}
                  className={`interactive-element px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
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
                  className={`interactive-element px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
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
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
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
                  className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                  rows={5}
                  placeholder="Enter the content users will receive after completing all steps"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This content will be displayed to users after completing all steps
                </p>
              </div>
            )}
          </div>

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

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adultAds}
                  onChange={(e) => setAdultAds(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
                />
                <span className="text-white">Allow adult ads (18+)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
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

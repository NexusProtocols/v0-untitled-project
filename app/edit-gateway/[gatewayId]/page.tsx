"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

interface GatewayStep {
  id: string
  title: string
  description: string
  imageUrl: string
  type: "social" | "youtube" | "article" | "download" | "custom"
  waitTime: number
  content: {
    url?: string
    text?: string
    videoId?: string
    downloadUrl?: string
    customHtml?: string
    socialType?: "discord" | "twitter" | "instagram" | "tiktok" | "youtube" | "twitch" | "other"
    socialValue?: string
  }
  skipAllowed: boolean
  bgColor: string
  textColor: string
}

export default function EditGatewayPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
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
  const [bgColor, setBgColor] = useState("#1a1a1a")
  const [textColor, setTextColor] = useState("#ffffff")
  const [buttonBgColor, setButtonBgColor] = useState("#ff3e3e")
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff")
  const [isLoadingGateway, setIsLoadingGateway] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/edit-gateway/" + params.gatewayId)
    }
  }, [user, isLoading, router, params.gatewayId])

  useEffect(() => {
    const fetchGateway = () => {
      try {
        // Get gateway from localStorage
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const foundGateway = gateways.find((g: any) => g.id === params.gatewayId)

        if (foundGateway) {
          // Check if user is the creator
          if (foundGateway.creatorName !== user?.username) {
            setError("You don't have permission to edit this gateway")
            return
          }

          // Set gateway data
          setGatewayTitle(foundGateway.title)
          setGatewayDescription(foundGateway.description)
          setGatewayImage(foundGateway.imageUrl)
          setRewardType(foundGateway.reward?.type || "url")
          setRewardUrl(foundGateway.reward?.url || "")
          setRewardPaste(foundGateway.reward?.content || "")
          setSteps(foundGateway.steps || [])
          setShowSubscriptionOptions(foundGateway.settings?.showSubscriptionOptions ?? true)
          setShowOperaGxOffer(foundGateway.settings?.showOperaGxOffer ?? true)
          setBgColor(foundGateway.settings?.bgColor || "#1a1a1a")
          setTextColor(foundGateway.settings?.textColor || "#ffffff")
          setButtonBgColor(foundGateway.settings?.buttonBgColor || "#ff3e3e")
          setButtonTextColor(foundGateway.settings?.buttonTextColor || "#ffffff")
        } else {
          setError("Gateway not found")
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("An error occurred while fetching the gateway")
      } finally {
        setIsLoadingGateway(false)
      }
    }

    if (user) {
      fetchGateway()
    }
  }, [params.gatewayId, user])

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
      type: "social",
      waitTime: 5,
      content: {
        socialType: "discord",
        socialValue: "",
      },
      skipAllowed: false,
      bgColor: "#1a1a1a",
      textColor: "#ffffff",
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

    // Validate social link
    if (currentStep.type === "social" && !currentStep.content.socialValue) {
      setMessage({ type: "error", text: "Social link value is required" })
      return
    }

    // Format social URL
    if (currentStep.type === "social" && currentStep.content.socialValue) {
      const value = currentStep.content.socialValue.trim()
      let fullUrl = ""

      switch (currentStep.content.socialType) {
        case "discord":
          fullUrl = value.startsWith("https://") ? value : `https://discord.gg/${value}`
          break
        case "twitter":
          fullUrl = value.startsWith("https://") ? value : `https://twitter.com/${value}`
          break
        case "instagram":
          fullUrl = value.startsWith("https://") ? value : `https://instagram.com/${value}`
          break
        case "tiktok":
          fullUrl = value.startsWith("https://") ? value : `https://tiktok.com/@${value}`
          break
        case "youtube":
          fullUrl = value.startsWith("https://") ? value : `https://youtube.com/${value}`
          break
        case "twitch":
          fullUrl = value.startsWith("https://") ? value : `https://twitch.tv/${value}`
          break
        default:
          fullUrl = value.startsWith("https://") ? value : `https://${value}`
      }

      currentStep.content.url = fullUrl
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

      // Get all gateways from localStorage
      const allGateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")

      // Find the gateway to update
      const updatedGateways = allGateways.map((gateway: any) => {
        if (gateway.id === params.gatewayId) {
          return {
            ...gateway,
            title: gatewayTitle,
            description: gatewayDescription,
            imageUrl: gatewayImage,
            updatedAt: new Date().toISOString(),
            steps: steps,
            reward: {
              type: rewardType,
              url: rewardType === "url" ? rewardUrl : undefined,
              content: rewardType === "paste" ? rewardPaste : undefined,
            },
            settings: {
              showSubscriptionOptions,
              showOperaGxOffer,
              bgColor,
              textColor,
              buttonBgColor,
              buttonTextColor,
            },
          }
        }
        return gateway
      })

      // Save back to localStorage
      localStorage.setItem("nexus_gateways", JSON.stringify(updatedGateways))

      // Show success message
      setMessage({ type: "success", text: "Gateway updated successfully! Redirecting..." })

      // Redirect to manage gateways page after a delay
      setTimeout(() => {
        router.push("/manage-gateways")
      }, 2000)
    } catch (error) {
      console.error("Error updating gateway:", error)
      setMessage({ type: "error", text: "An error occurred while updating the gateway" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "discord":
        return "fab fa-discord"
      case "twitter":
        return "fab fa-twitter"
      case "instagram":
        return "fab fa-instagram"
      case "tiktok":
        return "fab fa-tiktok"
      case "youtube":
        return "fab fa-youtube"
      case "twitch":
        return "fab fa-twitch"
      default:
        return "fas fa-link"
    }
  }

  if (isLoading || isLoadingGateway) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Error</h2>
            <p className="mb-6 text-gray-400">{error}</p>
            <Link
              href="/manage-gateways"
              className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Gateways
            </Link>
          </div>
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

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bgColor" className="mb-2 block font-medium text-[#ff3e3e]">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="bgColor"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="textColor" className="mb-2 block font-medium text-[#ff3e3e]">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="buttonBgColor" className="mb-2 block font-medium text-[#ff3e3e]">
                  Button Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="buttonBgColor"
                    value={buttonBgColor}
                    onChange={(e) => setButtonBgColor(e.target.value)}
                    className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                  />
                  <input
                    type="text"
                    value={buttonBgColor}
                    onChange={(e) => setButtonBgColor(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="buttonTextColor" className="mb-2 block font-medium text-[#ff3e3e]">
                  Button Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="buttonTextColor"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                  />
                  <input
                    type="text"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded border border-white/10 bg-[#050505]">
              <h3 className="mb-2 text-lg font-medium text-white">Preview</h3>
              <div
                className="p-4 rounded"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                <h4 className="text-xl font-bold" style={{ color: textColor }}>
                  {gatewayTitle || "Gateway Title"}
                </h4>
                <p className="mt-2" style={{ color: textColor }}>
                  {gatewayDescription || "Gateway description will appear here."}
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded font-medium"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  Continue
                </button>
              </div>
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
                      {step.type === "social" && step.content.socialType && (
                        <span className="rounded bg-[#1a1a1a] px-2 py-1 text-gray-300">
                          <i className={`${getSocialIcon(step.content.socialType)} mr-1`}></i>
                          {step.content.socialType.charAt(0).toUpperCase() + step.content.socialType.slice(1)}
                        </span>
                      )}
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
                    Step Image (Optional)
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
                          type: e.target.value as "social" | "youtube" | "article" | "download" | "custom",
                        })
                      }
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    >
                      <option value="social">Social Link</option>
                      <option value="youtube">YouTube Video</option>
                      <option value="article">Article</option>
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
                        setCurrentStep({ ...currentStep, waitTime: Math.max(1, Number.parseInt(e.target.value) || 1) })
                      }
                      min="1"
                      max="60"
                      className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                    />
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stepBgColor" className="mb-2 block font-medium text-[#ff3e3e]">
                      Step Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="stepBgColor"
                        value={currentStep.bgColor}
                        onChange={(e) => setCurrentStep({ ...currentStep, bgColor: e.target.value })}
                        className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                      />
                      <input
                        type="text"
                        value={currentStep.bgColor}
                        onChange={(e) => setCurrentStep({ ...currentStep, bgColor: e.target.value })}
                        className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e]/50 focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="stepTextColor" className="mb-2 block font-medium text-[#ff3e3e]">
                      Step Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="stepTextColor"
                        value={currentStep.textColor}
                        onChange={(e) => setCurrentStep({ ...currentStep, textColor: e.target.value })}
                        className="h-10 w-10 rounded border border-white/10 bg-[#050505]"
                      />
                      <input
                        type="text"
                        value={currentStep.textColor}
                        onChange={(e) => setCurrentStep({ ...currentStep, textColor: e.target.value })}
                        className="input-focus-effect flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all hover:border-[#ff3e3e\

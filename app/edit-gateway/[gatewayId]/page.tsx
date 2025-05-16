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
  const [steps, setSteps] = useState<GatewayStep[]>([])
  const [currentStep, setCurrentStep] = useState<GatewayStep | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading2, setIsLoading2] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(true)
  const [showOperaGxOffer, setShowOperaGxOffer] = useState(true)
  const [isRewardUrlRedirect, setIsRewardUrlRedirect] = useState(true)
  const [adLevel, setAdLevel] = useState(3)
  const [adultAds, setAdultAds] = useState(false)
  const [gateway, setGateway] = useState<any | null>(null)
  const [gatewayStats, setGatewayStats] = useState<any | null>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/edit-gateway/" + params.gatewayId)
      return
    }

    const fetchGateway = async () => {
      try {
        // Get gateway from localStorage
        const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
        const foundGateway = gateways.find((g: any) => g.id === params.gatewayId)

        if (foundGateway) {
          setGateway(foundGateway)
          
          // Populate form with gateway data
          setGatewayTitle(foundGateway.title)
          setGatewayDescription(foundGateway.description)
          setGatewayImage(foundGateway.imageUrl)
          setSteps(foundGateway.steps || [])
          
          // Set reward info
          if (foundGateway.reward) {
            setRewardType(foundGateway.reward.type || "url")
            setRewardUrl(foundGateway.reward.url || "")
            setRewardPaste(foundGateway.reward.content || "")
          }
          
          // Set settings
          if (foundGateway.settings) {
            setShowSubscriptionOptions(foundGateway.settings.showSubscriptionOptions !== false)
            setShowOperaGxOffer(foundGateway.settings.showOperaGxOffer !== false)
            setAdLevel(foundGateway.settings.adLevel || 3)
            setAdultAds(foundGateway.settings.adultAds || false)
          }
          
          // Fetch gateway stats (in a real app, this would come from API)
          try {
            const response = await fetch(`/api/gateway/track?gatewayId=${params.gatewayId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success) {
                setGatewayStats(data.data)
              }
            }
          } catch (error) {
            console.error("Error fetching gateway stats:", error)
          }
        } else {
          setMessage({ type: "error", text: "Gateway not found" })
          setTimeout(() => {
            router.push("/manage-gateways")
          }, 2000)
        }
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setMessage({ type: "error", text: "An error occurred while fetching the gateway" })
      } finally {
        setIsLoading2(false)
      }
    }

    if (!isLoading && user) {
      fetchGateway()
    }
  }, [user, isLoading, params.gatewayId, router])

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

      // Update the gateway object
      const updatedGateway = {
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
          adLevel,
          adultAds,
        },
      }

      // Get existing gateways from localStorage
      const gateways = JSON.parse(localStorage.getItem("nexus_gateways") || "[]")
      
      // Update the gateway in the array
      const updatedGateways = gateways.map((g: any) => 
        g.id === gateway.id ? updatedGateway : g
      )

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
                  {gatewayStats.conversionRate ? (gatewayStats.conversionRate * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </div>
              <div className="rounded bg-[#050505] p-4 text-center">
                <div className="text-3xl font-bold text-[#ff3e3e]">${gatewayStats.revenue || "0.00"}</div>
                <div className="text-sm text-gray-400">Estimated Revenue</div>
              </div>
            </div>
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
                className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"\

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// Define the admin token constant
const ADMIN_TOKEN_KEY = "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy"

export default function UploadKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [keyTitle, setKeyTitle] = useState("")
  const [keyDescription, setKeyDescription] = useState("")
  const [keyCode, setKeyCode] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // List of admin usernames
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

  useEffect(() => {
    const checkAdminAccess = () => {
      if (isLoading) return

      // Check if user is admin by username
      if (user) {
        const isUserAdmin = adminUsernames.includes(user.username)
        setUserIsAdmin(isUserAdmin)
        setAdminCheckComplete(true)
        return
      }

      // If not logged in, check for admin token in localStorage
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (adminToken) {
        setUserIsAdmin(true)
        setAdminCheckComplete(true)
        return
      }

      // Not an admin
      setUserIsAdmin(false)
      setAdminCheckComplete(true)
    }

    checkAdminAccess()
  }, [user, isLoading])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!keyTitle || !keyDescription || !keyCode) {
      setMessage({ type: "error", text: "Key title, description, and code are required" })
      return
    }

    if (!imageUrl) {
      setMessage({ type: "error", text: "Please upload an image for the key" })
      return
    }

    try {
      setIsUploading(true)

      // Get author name
      const authorName = user ? user.username : "NEXUS Admin"

      // Create script object for Supabase
      const scriptData = {
        title: keyTitle,
        description: keyDescription,
        code: keyCode,
        author: authorName,
        author_id: user?.id || null,
        is_premium: isPremium,
        is_nexus_team: true,
        is_verified: true,
        key_system: true,
        game_id: "universal",
        game_name: "Universal Key",
        game_image: imageUrl,
        categories_json: JSON.stringify(["Keys", "Premium"]),
      }

      // Save to Supabase using the scripts API
      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...scriptData,
          game: {
            gameId: "universal",
            name: "Universal Key",
            imageUrl: imageUrl,
          },
          categories: ["Keys", "Premium"],
          isPremium: isPremium,
          isNexusTeam: true,
          keySystem: true,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload key")
      }

      setMessage({ type: "success", text: "Key uploaded successfully!" })

      // Reset form
      setKeyTitle("")
      setKeyDescription("")
      setKeyCode("")
      setImageUrl("")
      setIsPremium(false)

      // Reset file input
      const fileInput = document.getElementById("keyImage") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      // Redirect after delay
      setTimeout(() => {
        router.push("/key-generator")
      }, 2000)
    } catch (error) {
      console.error("Error uploading key:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred while uploading the key",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading || !adminCheckComplete) {
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

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
            Upload Key
          </h1>

          <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-[#ff3e3e]">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Admin Access Required</h2>
            <p className="mb-6 text-gray-400">Only administrators can upload keys to the NEXUS platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/key-generator"
                className="interactive-element button-glow button-3d inline-flex items-center rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Keys
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem(ADMIN_TOKEN_KEY, "true")
                  window.location.reload()
                }}
                className="interactive-element button-shine inline-flex items-center rounded bg-[#1a1a1a] border border-[#ff3e3e] px-6 py-3 font-semibold text-[#ff3e3e] transition-all hover:bg-[#ff3e3e]/10"
              >
                <i className="fas fa-user-shield mr-2"></i> Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Upload Key
        </h1>

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
            <label htmlFor="keyTitle" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Title
            </label>
            <input
              type="text"
              id="keyTitle"
              value={keyTitle}
              onChange={(e) => setKeyTitle(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              placeholder="Enter a title for your key"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="keyImage" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Image
            </label>
            <div className="mb-2">
              <input type="file" id="keyImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <label
                htmlFor="keyImage"
                className="interactive-element flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#ff3e3e]/50 hover:shadow-md"
              >
                <div className="text-center">
                  <i className="fas fa-upload mb-2 text-2xl text-[#ff3e3e]"></i>
                  <p className="text-sm text-gray-400">Click to upload key image (max 2MB)</p>
                </div>
              </label>
            </div>

            {imageUrl && (
              <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                <div className="relative h-40 w-full overflow-hidden rounded">
                  <img src={imageUrl || "/placeholder.svg"} alt="Key preview" className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="interactive-element rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30"
                  >
                    <i className="fas fa-times mr-1"></i> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="keyDescription" className="mb-2 block font-medium text-[#ff3e3e]">
              Description
            </label>
            <textarea
              id="keyDescription"
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={3}
              placeholder="Describe what this key is for"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{keyDescription.length}/500 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="keyCode" className="mb-2 block font-medium text-[#ff3e3e]">
              Key Code
            </label>
            <textarea
              id="keyCode"
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value)}
              className="input-focus-effect font-mono w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              rows={5}
              placeholder="Enter the key code or link"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={() => setIsPremium(!isPremium)}
                className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#ff3e3e]"
              />
              <span className="text-white">Premium Key</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="interactive-element button-glow button-3d w-full rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i> Upload Key
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

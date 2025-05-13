"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { FaDiscord, FaCheck, FaTimes } from "react-icons/fa"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DiscordAccountSection() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLinking, setIsLinking] = useState(false)

  // Check if Discord was just linked
  const discordLinked = searchParams.get("discord_linked") === "true"
  const error = searchParams.get("error")

  useEffect(() => {
    if (discordLinked) {
      setShowSuccessMessage(true)

      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }

    if (error) {
      setShowErrorMessage(true)

      if (error === "already_linked") {
        setErrorMessage("This Discord account is already linked to another user.")
      } else {
        setErrorMessage("An error occurred while linking your Discord account.")
      }

      // Hide error message after 5 seconds
      const timer = setTimeout(() => {
        setShowErrorMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [discordLinked, error])

  const isDiscordLinked = user?.discord_id !== undefined

  // Function to handle Discord login/linking
  const handleDiscordAuth = () => {
    // Check if user is banned
    if (user) {
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
      if (userData.isBanned) {
        setShowErrorMessage(true)
        setErrorMessage("Your account has been banned. You cannot link Discord.")

        // Hide error message after 5 seconds
        setTimeout(() => {
          setShowErrorMessage(false)
        }, 5000)

        return
      }
    }

    setIsLinking(true)
    // Use the same URL as login but with a link parameter
    window.location.href = "/api/discord/login?link=true"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaDiscord className="h-5 w-5 text-[#5865F2]" />
          Discord Account
        </CardTitle>
        <CardDescription>Link your Discord account to automatically join our server and get verified</CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccessMessage && (
          <Alert className="mb-6 bg-green-500/10 text-green-500">
            <AlertDescription>Your Discord account has been successfully linked!</AlertDescription>
          </Alert>
        )}

        {showErrorMessage && (
          <Alert className="mb-6 bg-red-500/10 text-red-500">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isDiscordLinked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <FaCheck />
              <span>Discord account linked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Username:</span>
              <span>{user.discord_username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Discord ID:</span>
              <span className="font-mono text-sm">{user.discord_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Server Status:</span>
              <span className="text-green-500">Joined</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <FaTimes />
              <span>No Discord account linked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Link your Discord account to automatically join our server and get access to exclusive features.
            </p>
            <Button
              onClick={handleDiscordAuth}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              disabled={isLinking}
            >
              <FaDiscord className="mr-2 h-4 w-4" />
              {isLinking ? "Linking..." : "Link Discord Account"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

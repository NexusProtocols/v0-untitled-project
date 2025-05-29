"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { scriptCategories } from "@/lib/categories"

export default function UploadScriptsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [uploadToken, setUploadToken] = useState("")
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptDescription, setScriptDescription] = useState("")
  const [scriptCode, setScriptCode] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [gameId, setGameId] = useState("")
  const [gameName, setGameName] = useState("")
  const [gameImage, setGameImage] = useState("")
  const [isPremium, setIsPremium] = useState(false)
  const [keySystem, setKeySystem] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userScripts, setUserScripts] = useState<any[]>([])
  const [isLoadingScripts, setIsLoadingScripts] = useState(false)

  // Load user's upload token and scripts
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch this from your user profile API
      const storedToken = localStorage.getItem(`upload_token_${user.username}`)
      if (storedToken) {
        setUploadToken(storedToken)
      } else {
        // Generate a new token for demo purposes
        const newToken = crypto.randomUUID()
        localStorage.setItem(`upload_token_${user.username}`, newToken)
        setUploadToken(newToken)
      }

      loadUserScripts()
    }
  }, [user])

  const loadUserScripts = async () => {
    if (!user) return

    setIsLoadingScripts(true)
    try {
      // In a real app, you'd fetch from your API
      const response = await fetch(`/api/scripts?author=${user.username}`)
      if (response.ok) {
        const data = await response.json()
        setUserScripts(data.scripts || [])
      }
    } catch (error) {
      console.error("Error loading user scripts:", error)
    } finally {
      setIsLoadingScripts(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!uploadToken) {
      setMessage({ type: "error", text: "Upload token is required" })
      return
    }

    if (!scriptTitle || !scriptDescription || !scriptCode) {
      setMessage({ type: "error", text: "All fields are required" })
      return
    }

    setIsSubmitting(true)

    try {
      const scriptData = {
        title: scriptTitle,
        description: scriptDescription,
        code: scriptCode,
        categories: selectedCategories,
        game: gameId
          ? {
              gameId,
              name: gameName || `Game ${gameId}`,
              imageUrl: gameImage || "/placeholder.svg?height=160&width=320",
            }
          : null,
        isPremium,
        keySystem,
        uploadToken,
      }

      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-token": uploadToken,
        },
        body: JSON.stringify(scriptData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Script uploaded successfully!" })
        // Reset form
        setScriptTitle("")
        setScriptDescription("")
        setScriptCode("")
        setSelectedCategories([])
        setGameId("")
        setGameName("")
        setGameImage("")
        setIsPremium(false)
        setKeySystem(false)
        // Reload user scripts
        loadUserScripts()
      } else {
        setMessage({ type: "error", text: result.message || "Failed to upload script" })
      }
    } catch (error) {
      console.error("Error uploading script:", error)
      setMessage({ type: "error", text: "An error occurred while uploading the script" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const regenerateToken = () => {
    const newToken = crypto.randomUUID()
    localStorage.setItem(`upload_token_${user?.username}`, newToken)
    setUploadToken(newToken)
    setMessage({ type: "success", text: "Upload token regenerated successfully!" })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-5 py-16">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-400">You need to be logged in to upload scripts.</p>
            <Button onClick={() => router.push("/login")} className="bg-red-500 hover:bg-red-600">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            Upload Scripts
          </h1>
          <p className="text-gray-400">Share your scripts with the NEXUS community</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Script</TabsTrigger>
            <TabsTrigger value="my-scripts">My Scripts ({userScripts.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Script</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message.text && (
                    <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                      <AlertDescription className={message.type === "error" ? "text-red-400" : "text-green-400"}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Script Title</Label>
                    <Input
                      id="title"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      placeholder="Enter script title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={scriptDescription}
                      onChange={(e) => setScriptDescription(e.target.value)}
                      placeholder="Describe what your script does"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Script Code</Label>
                    <Textarea
                      id="code"
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      placeholder="-- Enter your Lua script code here"
                      rows={10}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {scriptCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <Label htmlFor={category.id} className="text-sm">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="gameId">Game ID (Optional)</Label>
                      <Input
                        id="gameId"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="Roblox game ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gameName">Game Name (Optional)</Label>
                      <Input
                        id="gameName"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        placeholder="Game name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gameImage">Game Image URL (Optional)</Label>
                      <Input
                        id="gameImage"
                        value={gameImage}
                        onChange={(e) => setGameImage(e.target.value)}
                        placeholder="Image URL"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
                      <Label htmlFor="premium">Premium Script</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="keySystem" checked={keySystem} onCheckedChange={setKeySystem} />
                      <Label htmlFor="keySystem">Key System Required</Label>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-red-500 hover:bg-red-600">
                    {isSubmitting ? "Uploading..." : "Upload Script"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-scripts">
            <Card>
              <CardHeader>
                <CardTitle>My Scripts</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingScripts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
                  </div>
                ) : userScripts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">You haven't uploaded any scripts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userScripts.map((script) => (
                      <div key={script.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{script.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{script.description}</p>
                            <div className="flex gap-2 mt-2">
                              {script.isPremium && <Badge variant="secondary">Premium</Badge>}
                              {script.keySystem && <Badge variant="outline">Key System</Badge>}
                              {script.isVerified && <Badge className="bg-green-500">Verified</Badge>}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">{script.views || 0} views</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Upload Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your Upload Token</Label>
                  <div className="flex gap-2">
                    <Input value={uploadToken} readOnly className="font-mono" />
                    <Button onClick={regenerateToken} variant="outline">
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Keep this token secure. You can use it to upload scripts via API.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>API Usage</Label>
                  <div className="rounded border p-4 bg-gray-900">
                    <p className="text-sm text-gray-300 mb-2">Upload via API:</p>
                    <code className="text-xs text-green-400">
                      POST /api/scripts
                      <br />
                      Headers: x-upload-token: {uploadToken}
                      <br />
                      Body: {JSON.stringify({ title: "...", description: "...", code: "..." }, null, 2)}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

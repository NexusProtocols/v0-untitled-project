"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Copy, Trash2, Eye, EyeOff, Key } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface ApiKey {
  id: string
  key_name: string
  permissions: any
  is_active: boolean
  last_used_at: string | null
  created_at: string
  expires_at: string | null
  api_key?: string // Only present when first created
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [expiresInDays, setExpiresInDays] = useState("never")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [newApiKey, setNewApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    checkAuth()
    fetchKeys()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      window.location.href = "/login"
      return
    }

    setUser(session.user)
  }

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/user/keys")
      const data = await response.json()

      if (data.success) {
        setKeys(data.keys)
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch API keys" })
    } finally {
      setLoading(false)
    }
  }

  const createKey = async () => {
    if (!newKeyName.trim()) {
      setMessage({ type: "error", text: "Key name is required" })
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/user/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyName: newKeyName,
          expiresInDays: expiresInDays === "never" ? null : Number.parseInt(expiresInDays),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewApiKey(data.key.api_key)
        setShowApiKey(true)
        setMessage({ type: "success", text: "API key created successfully" })
        setNewKeyName("")
        setExpiresInDays("never")
        setShowCreateDialog(false)
        fetchKeys()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create API key" })
    } finally {
      setCreating(false)
    }
  }

  const deleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/user/keys/${keyId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "API key deleted successfully" })
        fetchKeys()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete API key" })
    }
  }

  const toggleKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/user/keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: `API key ${!isActive ? "activated" : "deactivated"} successfully` })
        fetchKeys()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update API key" })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
              API Keys
            </h1>
            <p className="mt-2 text-gray-400">Manage your API keys for programmatic access to your scripts</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., My Script Manager"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expires">Expires In (Days)</Label>
                  <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Never expires" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never expires</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createKey} disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create API Key"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {message.text && (
          <Alert
            className={`mb-6 ${
              message.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-500/50"
                : "bg-green-900/30 text-green-200 border-green-500/50"
            }`}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {newApiKey && showApiKey && (
          <Alert className="mb-6 bg-blue-900/30 text-blue-200 border-blue-500/50">
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Your new API key has been created:</p>
                <div className="flex items-center gap-2">
                  <Textarea
                    value={newApiKey}
                    readOnly
                    className="font-mono text-sm bg-black/20 border-blue-500/30"
                    rows={2}
                  />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(newApiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-blue-300">⚠️ Save this key now - you won't be able to see it again!</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowApiKey(false)
                    setNewApiKey("")
                  }}
                >
                  I've saved it
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {keys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No API Keys</h3>
                <p className="text-gray-400 mb-4">
                  Create your first API key to start managing scripts programmatically
                </p>
              </CardContent>
            </Card>
          ) : (
            keys.map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {key.key_name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => toggleKeyStatus(key.id, key.is_active)}>
                        {key.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteKey(key.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p>{new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Used</p>
                      <p>{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : "Never"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Permissions</p>
                      <div className="flex gap-1 mt-1">
                        {key.permissions?.scripts?.read && (
                          <Badge variant="outline" className="text-xs">
                            Read
                          </Badge>
                        )}
                        {key.permissions?.scripts?.write && (
                          <Badge variant="outline" className="text-xs">
                            Write
                          </Badge>
                        )}
                        {key.permissions?.scripts?.delete && (
                          <Badge variant="outline" className="text-xs">
                            Delete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Usage Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Get all scripts:</h4>
              <code className="block bg-black/20 p-3 rounded text-sm">
                curl -H "Authorization: Bearer YOUR_API_KEY" https://nexuslive.vercel.app/api/scripts
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Create a script:</h4>
              <code className="block bg-black/20 p-3 rounded text-sm">
                {`curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Script","description":"Description","code":"print(\\"Hello\\")"}' \\
  https://nexuslive.vercel.app/api/scripts`}
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Update a script:</h4>
              <code className="block bg-black/20 p-3 rounded text-sm">
                {`curl -X PUT -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Updated Title"}' \\
  https://nexuslive.vercel.app/api/scripts/SCRIPT_ID`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

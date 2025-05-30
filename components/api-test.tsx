"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"

export default function ApiTest() {
  const [gatewayResult, setGatewayResult] = useState<string>("")
  const [sessionResult, setSessionResult] = useState<string>("")
  const [loading, setLoading] = useState<string>("")

  const testGateway = async () => {
    setLoading("gateway")
    try {
      const result = await apiClient.get("/gateway")
      setGatewayResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setGatewayResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading("")
    }
  }

  const testSession = async () => {
    setLoading("session")
    try {
      const result = await apiClient.post("/session", {
        userId: "test-user",
        sessionData: { browser: "Chrome", ip: "127.0.0.1" },
      })
      setSessionResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setSessionResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading("")
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">API Testing Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gateway API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testGateway} disabled={loading === "gateway"} className="w-full">
              {loading === "gateway" ? "Testing..." : "Test Gateway"}
            </Button>
            {gatewayResult && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">{gatewayResult}</pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSession} disabled={loading === "session"} className="w-full">
              {loading === "session" ? "Testing..." : "Test Session"}
            </Button>
            {sessionResult && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">{sessionResult}</pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

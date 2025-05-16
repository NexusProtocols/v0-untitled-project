"use client"

import { useState } from "react"

export default function RobloxClientExamplePage() {
  const [key, setKey] = useState("")
  const [copied, setCopied] = useState(false)

  const luaScript = `-- Roblox Script with License Key Validation
-- Place this in a Script in ServerScriptService

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- Configuration
local LICENSE_KEY = "${key || "YOUR_LICENSE_KEY_HERE"}" -- Replace with your license key
local API_URL = "https://your-nexus-api.com/api/validate-key" -- Replace with your actual API URL

-- Function to validate the license key
local function ValidateLicense()
    -- Generate a hardware ID based on the server
    local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
    
    -- Make the API request
    local success, response = pcall(function()
        return HttpService:JSONDecode(HttpService:PostAsync(
            API_URL,
            HttpService:JSONEncode({
                key = LICENSE_KEY,
                hwid = hwid
            }),
            Enum.HttpContentType.ApplicationJson
        ))
    end)
    
    if not success then
        warn("License validation failed:", response)
        return false
    end
    
    if response.success then
        print("License validated successfully!")
        return true
    else
        warn("License invalid:", response.error)
        return false
    end
end

-- Check license when the server starts
if not ValidateLicense() then
    warn("Invalid license! Script features will be disabled.")
    return -- Stop execution if license is invalid
end

-- Your actual script code below (only runs if license is valid)
print("Script running with valid license!")

-- Example feature: Give players a welcome message
Players.PlayerAdded:Connect(function(player)
    player:SetAttribute("Licensed", true)
    wait(2)
    player.PlayerGui:SetAttribute("Premium", true)
    
    -- Create a welcome message
    local message = Instance.new("Message")
    message.Text = "Welcome to the licensed server!"
    message.Parent = workspace
    wait(5)
    message:Destroy()
end)

-- More premium features would go here
`

  const handleCopyScript = () => {
    navigator.clipboard
      .writeText(luaScript)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      })
      .catch((error) => {
        console.error("Error copying script:", error)
        alert("Failed to copy script. Please select and copy manually.")
      })
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Roblox Client Example
        </h1>

        <div className="mb-6 rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-bold text-white">How to Use Your License Key</h2>
          <p className="mb-4 text-gray-300">
            Follow these steps to implement license key validation in your Roblox game:
          </p>

          <ol className="list-decimal pl-5 text-gray-300 space-y-3 mb-6">
            <li>
              <span className="font-medium text-white">Enter your license key</span> in the input field below
            </li>
            <li>
              <span className="font-medium text-white">Copy the generated script</span> which includes your key
            </li>
            <li>
              <span className="font-medium text-white">Paste the script</span> into a Script object in your game's
              ServerScriptService
            </li>
            <li>
              <span className="font-medium text-white">Customize the script</span> to add your own premium features
            </li>
          </ol>

          <div className="mb-6">
            <label htmlFor="licenseKey" className="mb-2 block font-medium text-[#ff3e3e]">
              Your License Key
            </label>
            <input
              type="text"
              id="licenseKey"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="input-focus-effect w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all hover:border-[#ff3e3e]/50 hover:shadow-md focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e]"
              placeholder="Enter your license key (e.g., NEXUS-XXXX-XXXX-XXXX)"
            />
          </div>

          <div className="relative">
            <pre className="font-mono text-sm overflow-x-auto rounded bg-[#050505] p-4 text-gray-300">{luaScript}</pre>
            <button
              onClick={handleCopyScript}
              className="interactive-element absolute top-2 right-2 rounded bg-[#1a1a1a] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#2a2a2a]"
            >
              {copied ? (
                <>
                  <i className="fas fa-check mr-1"></i> Copied!
                </>
              ) : (
                <>
                  <i className="fas fa-copy mr-1"></i> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Additional Information</h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-medium text-[#ff3e3e]">HWID Locking</h3>
              <p className="text-gray-300">
                The script uses Roblox's{" "}
                <code className="bg-[#050505] px-1 rounded">RbxAnalyticsService:GetClientId()</code> to generate a
                hardware ID. This locks the license to the specific server instance, preventing unauthorized sharing.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-[#ff3e3e]">Error Handling</h3>
              <p className="text-gray-300">
                The validation function includes proper error handling to prevent script errors if the API is
                unavailable. It will gracefully degrade and disable premium features.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-[#ff3e3e]">Security Considerations</h3>
              <p className="text-gray-300">
                Remember that any client-side scripts can be viewed by users. Keep sensitive logic on the server side
                and only use the license key to unlock features, not to store secrets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

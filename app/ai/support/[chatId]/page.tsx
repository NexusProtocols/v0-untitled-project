"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  status?: "sending" | "complete" | "error"
}

type ChatSession = {
  id: string
  messages: Message[]
  createdAt: number
  messageCount: number
}

const MAX_MESSAGES_PER_DAY = 3
const MAX_MESSAGE_LENGTH = 100 // words
const MAX_RESPONSE_TOKENS = 5000

// More varied AI responses
const AI_RESPONSES = {
  script: [
    "I can help with script-related questions! Our platform supports Lua scripts for Roblox games. Make sure your scripts follow our guidelines and don't contain malicious code. If you're having trouble with a specific script, please provide more details about the issue you're experiencing.",
    "For script issues, I'd need to know more about what you're trying to accomplish. Nexus supports various Lua scripts, but they must comply with our content guidelines. Could you share more details about the script you're working with?",
    "Scripts on our platform need to follow certain guidelines to ensure they're safe and effective. If you're having trouble with a specific script, I can help troubleshoot. What exactly are you trying to do with your script?",
  ],
  account: [
    "For account-related issues, make sure you're using the correct credentials. If you've forgotten your password, you can reset it from the login page. If you're having trouble linking your Discord account, ensure you're granting the necessary permissions during the authorization process.",
    "Account problems can be frustrating! If you're having login issues, try clearing your browser cache or using a different browser. For password resets, use the 'Forgot Password' link on the login page. Discord linking requires proper permissions to be granted.",
    "If you're experiencing account issues, first check that you're entering the correct username and password. For Discord linking problems, make sure you're logged into Discord in the same browser and have granted all the required permissions.",
  ],
  discord: [
    "Discord integration allows you to upload scripts for popular games and access premium features. To link your Discord account, go to your profile settings and click on 'Link Discord Account'. Follow the authorization process to complete the linking.",
    "Our Discord integration provides access to exclusive scripts and features. To connect your accounts, navigate to your profile page, find the Discord section, and click the link button. You'll need to authorize Nexus in the Discord popup that appears.",
    "Linking your Discord account unlocks additional benefits like higher ad levels and access to premium scripts. The process is simple - just go to your profile, click on the Discord connection option, and follow the prompts to authorize the integration.",
  ],
  game: [
    "We support scripts for various Roblox games. Some popular games require Discord authentication before you can upload scripts for them. This helps us maintain quality and prevent abuse. Check the game details when uploading to see if Discord authentication is required.",
    "Our platform offers scripts for a wide range of Roblox games. For certain popular titles, we require Discord verification to ensure script quality and prevent misuse. You can see these requirements on the game's detail page.",
    "Nexus provides scripts for most popular Roblox games. The requirements vary by game - some need Discord verification, others might have additional security checks. This helps us maintain a high-quality script library for our users.",
  ],
  error: [
    "I'm sorry to hear you're experiencing issues. For technical problems, please provide specific error messages or screenshots if possible. Common issues can be resolved by clearing your browser cache, using a different browser, or checking your internet connection.",
    "Technical issues can be frustrating. To help you better, could you share any error messages you're seeing? Often, problems can be resolved by refreshing the page, clearing cache, or trying a different browser.",
    "If you're encountering errors, the most helpful information would be any error codes or messages you're seeing. Many technical problems can be fixed by simple troubleshooting steps like clearing cookies or updating your browser.",
  ],
  premium: [
    "Premium features include access to exclusive scripts, priority support, and no daily limits on AI chat. To upgrade to premium, visit your account settings and select 'Upgrade to Premium'. We accept various payment methods including credit cards and PayPal.",
    "Our premium subscription offers several benefits: unlimited AI support, exclusive script access, priority customer service, and ad-free browsing. You can upgrade through your account dashboard using credit card, PayPal, or crypto payments.",
    "Premium members enjoy many advantages, including access to our exclusive script library, unlimited AI chat support, priority in the support queue, and a completely ad-free experience. Subscription options include monthly or annual plans with significant savings for longer commitments.",
  ],
  thank: [
    "You're welcome! I'm glad I could help. If you have any other questions, feel free to ask. Have a great day!",
    "Happy to help! If you need anything else, don't hesitate to reach out. Enjoy using Nexus!",
    "My pleasure! I'm here whenever you need assistance with Nexus. Is there anything else I can help with today?",
  ],
  hello: [
    "Hello there! Welcome to Nexus AI support. How can I assist you today with scripts, account issues, or any other questions about our platform?",
    "Hi! I'm the Nexus AI assistant powered by Grok. I'm here to help with any questions about our platform, scripts, or account management. What can I help you with?",
    "Welcome to Nexus support! I'm your AI assistant, ready to help with any questions about scripts, account management, or platform features. How can I assist you today?",
  ],
  default: [
    "Thank you for your question. As the Nexus AI assistant, I'm here to help with questions about scripts, account management, Discord integration, and other platform features. If your question is about something specific, please provide more details so I can give you a more helpful response.",
    "I appreciate your question. I'm designed to assist with all aspects of the Nexus platform, including script troubleshooting, account management, and technical support. Could you provide more specific details about what you need help with?",
    "Thanks for reaching out. I can help with most questions about Nexus, including script issues, account management, and platform features. For me to provide the most helpful response, could you share more details about your specific situation or question?",
  ],
}

export default function AiSupportChat() {
  const { chatId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [messageCount, setMessageCount] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [usedResponses, setUsedResponses] = useState<Record<string, number[]>>({})

  // Load chat history
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Check if chat exists
    const storedChats = JSON.parse(localStorage.getItem(`nexus_ai_chats_${user.username}`) || "[]")
    const existingChat = storedChats.find((chat: ChatSession) => chat.id === chatId)

    if (existingChat) {
      setMessages(existingChat.messages)
      setMessageCount(existingChat.messageCount)
    } else {
      // Create new chat
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello! I'm the Nexus AI assistant powered by Grok. How can I help you today?",
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])

      // Save new chat
      const newChat: ChatSession = {
        id: chatId as string,
        messages: [welcomeMessage],
        createdAt: Date.now(),
        messageCount: 0,
      }

      localStorage.setItem(`nexus_ai_chats_${user.username}`, JSON.stringify([...storedChats, newChat]))
    }

    // Check daily message limit
    checkDailyMessageLimit()
  }, [user, chatId, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, generatedText])

  // Update word count
  useEffect(() => {
    const words = input.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
  }, [input])

  const checkDailyMessageLimit = () => {
    if (!user) return

    const today = new Date().toDateString()
    const storedChats = JSON.parse(localStorage.getItem(`nexus_ai_chats_${user.username}`) || "[]")

    // Count messages sent today across all chats
    let todayMessageCount = 0

    storedChats.forEach((chat: ChatSession) => {
      const todayMessages = chat.messages.filter(
        (msg: Message) => msg.role === "user" && new Date(msg.timestamp).toDateString() === today,
      )
      todayMessageCount += todayMessages.length
    })

    setDailyLimit(todayMessageCount >= MAX_MESSAGES_PER_DAY)
  }

  // Function to get a random response that hasn't been used recently
  const getRandomResponse = (category: string): string => {
    const responses = AI_RESPONSES[category as keyof typeof AI_RESPONSES] || AI_RESPONSES.default

    // Initialize used indices for this category if not exists
    if (!usedResponses[category]) {
      setUsedResponses((prev) => ({ ...prev, [category]: [] }))
    }

    // Get unused indices
    const usedIndices = usedResponses[category] || []
    const availableIndices = Array.from({ length: responses.length }, (_, i) => i).filter(
      (i) => !usedIndices.includes(i),
    )

    // If all responses have been used, reset
    if (availableIndices.length === 0) {
      setUsedResponses((prev) => ({ ...prev, [category]: [] }))
      const randomIndex = Math.floor(Math.random() * responses.length)
      return responses[randomIndex]
    }

    // Get random unused response
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]

    // Mark as used
    setUsedResponses((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), randomIndex],
    }))

    return responses[randomIndex]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isGenerating || dailyLimit) return

    // Check word count
    if (wordCount > MAX_MESSAGE_LENGTH) {
      alert(`Your message exceeds the ${MAX_MESSAGE_LENGTH} word limit. Please shorten your message.`)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)
    setGeneratedText("")

    // Simulate AI response with streaming
    simulateAiResponse(input.trim(), userMessage)

    // Update message count and check limit
    const newCount = messageCount + 1
    setMessageCount(newCount)

    // Save to localStorage
    saveChat([...messages, userMessage], newCount)

    // Check if we've hit the daily limit
    checkDailyMessageLimit()
  }

  const simulateAiResponse = async (userInput: string, userMessage: Message) => {
    try {
      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a response based on the user input
      let responseCategory = "default"
      const lowerInput = userInput.toLowerCase()

      if (lowerInput.includes("script") || lowerInput.includes("code") || lowerInput.includes("lua")) {
        responseCategory = "script"
      } else if (lowerInput.includes("account") || lowerInput.includes("login") || lowerInput.includes("password")) {
        responseCategory = "account"
      } else if (lowerInput.includes("discord")) {
        responseCategory = "discord"
      } else if (lowerInput.includes("game") || lowerInput.includes("roblox")) {
        responseCategory = "game"
      } else if (lowerInput.includes("error") || lowerInput.includes("bug") || lowerInput.includes("issue")) {
        responseCategory = "error"
      } else if (lowerInput.includes("premium") || lowerInput.includes("subscription") || lowerInput.includes("pay")) {
        responseCategory = "premium"
      } else if (lowerInput.includes("thank") || lowerInput.includes("thanks") || lowerInput.includes("appreciate")) {
        responseCategory = "thank"
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        responseCategory = "hello"
      }

      const response = getRandomResponse(responseCategory)

      // Simulate streaming response
      for (let i = 0; i < response.length; i++) {
        setGeneratedText((prev) => prev + response[i])
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      // Add the complete message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setGeneratedText("")
      setIsGenerating(false)

      // Save to localStorage
      saveChat([...messages, { ...userMessage, status: "complete" }, assistantMessage], messageCount)
    } catch (error) {
      console.error("Error generating response:", error)
      setIsGenerating(false)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while generating a response. Please try again later.",
        timestamp: Date.now(),
        status: "error",
      }

      setMessages((prev) => [...prev, errorMessage])
      setGeneratedText("")

      // Save to localStorage
      saveChat([...messages, { ...userMessage, status: "error" }, errorMessage], messageCount)
    }
  }

  const saveChat = (updatedMessages: Message[], count: number) => {
    if (!user) return

    const storedChats = JSON.parse(localStorage.getItem(`nexus_ai_chats_${user.username}`) || "[]")
    const chatIndex = storedChats.findIndex((chat: ChatSession) => chat.id === chatId)

    if (chatIndex !== -1) {
      storedChats[chatIndex].messages = updatedMessages
      storedChats[chatIndex].messageCount = count
    } else {
      storedChats.push({
        id: chatId,
        messages: updatedMessages,
        createdAt: Date.now(),
        messageCount: count,
      })
    }

    localStorage.setItem(`nexus_ai_chats_${user.username}`, JSON.stringify(storedChats))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto flex flex-col h-[calc(100vh-200px)] px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/support" className="inline-flex items-center text-red-400 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i> Back to Support
        </Link>
        <div className="text-sm text-gray-400">
          {messageCount}/{MAX_MESSAGES_PER_DAY} messages today
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user" ? "bg-red-500/20 text-white" : "bg-[#252525] text-gray-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="mt-1 text-right text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-[#252525] p-4 text-gray-200">
                <div className="whitespace-pre-wrap">
                  {generatedText}
                  <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-red-500"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              dailyLimit ? "You've reached your daily message limit" : "Type your message here... (100 words max)"
            }
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3 pr-24 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 hover:border-red-400"
            rows={3}
            disabled={isGenerating || dailyLimit}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-xs ${wordCount > MAX_MESSAGE_LENGTH ? "text-red-500" : "text-gray-400"}`}>
              {wordCount}/{MAX_MESSAGE_LENGTH}
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating || dailyLimit || wordCount > MAX_MESSAGE_LENGTH}
              className="rounded-full bg-gradient-to-r from-red-500 to-red-700 p-2 text-white transition-all hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
            >
              {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </div>
        </div>

        {dailyLimit && (
          <p className="mt-2 text-center text-sm text-red-400">
            You've reached your daily limit of {MAX_MESSAGES_PER_DAY} messages. Please try again tomorrow.
          </p>
        )}
      </form>
    </div>
  )
}

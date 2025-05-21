"use client"

import type { Gateway } from "@/types/gateway"
import Link from "next/link"

interface GatewayHeaderProps {
  gateway: Gateway
  currentStage: number
}

export default function GatewayHeader({ gateway, currentStage }: GatewayHeaderProps) {
  const totalStages = gateway.stages.length
  const progressPercentage = (currentStage / totalStages) * 100

  return (
    <header className="bg-[#1a1a1a] border-b border-[#333] shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            {gateway.imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                <img
                  src={gateway.imageUrl || "/placeholder.svg"}
                  alt={gateway.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{gateway.title}</h1>
              <p className="text-sm text-gray-400">Created by {gateway.creatorName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              Stage {currentStage} of {totalStages}
            </div>
            <Link href="/" className="text-sm text-[#ff3e3e] hover:text-white transition-colors">
              <i className="fas fa-home mr-1"></i> Home
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full bg-[#111] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </header>
  )
}

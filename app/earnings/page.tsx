"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function EarningsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)
  const [earningsHistory, setEarningsHistory] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentDetails, setPaymentDetails] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/earnings")
      return
    }

    if (user) {
      fetchEarningsData()
    }
  }, [user, isLoading, router])

  const fetchEarningsData = async () => {
    setIsLoadingData(true)
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate some earnings data
      setTimeout(() => {
        // Generate random earnings data
        const total = Number.parseFloat((Math.random() * 1000).toFixed(2))
        const monthly = Number.parseFloat((Math.random() * 200).toFixed(2))
        const pending = Number.parseFloat((Math.random() * 50).toFixed(2))

        // Generate earnings history
        const history = Array.from({ length: 10 })
          .map((_, index) => {
            const date = new Date()
            date.setDate(date.getDate() - index * 3)
            return {
              id: `earning-${Date.now()}-${index}`,
              date: date.toISOString(),
              amount: Number.parseFloat((Math.random() * 20).toFixed(2)),
              source: Math.random() > 0.5 ? "Gateway" : "Script",
              status: Math.random() > 0.2 ? "Paid" : "Pending",
            }
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setTotalEarnings(total)
        setMonthlyEarnings(monthly)
        setPendingEarnings(pending)
        setEarningsHistory(history)
        setIsLoadingData(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching earnings data:", error)
      setIsLoadingData(false)
    }
  }

  const handlePaymentMethodUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentMethod || !paymentDetails) {
      setMessage({ type: "error", text: "Please fill in all fields" })
      return
    }

    // In a real implementation, this would be an API call
    setMessage({ type: "success", text: "Payment method updated successfully" })
  }

  if (isLoading || isLoadingData) {
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
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Creator Earnings
        </h1>

        {/* Banner Ad - Top */}
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
          <div className="flex justify-center">
            <div
              dangerouslySetInnerHTML={{
                __html: `<script type="text/javascript">
                atOptions = {
                  'key' : 'fd9b1c1a9'
                };
                document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.effectivecpmgateway.com/fd9b1c1a9.js"></scr' + 'ipt>');
              </script>`,
              }}
            ></div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold">Total Earnings</h2>
              <p className="text-2xl font-bold">${totalEarnings}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold">Monthly Earnings</h2>
              <p className="text-2xl font-bold">${monthlyEarnings}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold">Pending Earnings</h2>
              <p className="text-2xl font-bold">${pendingEarnings}</p>
            </div>
          </div>
        </div>

        {/* Earnings History */}
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
          <h2 className="text-xl font-bold mb-4">Earnings History</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Source</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {earningsHistory.map((earning) => (
                <tr key={earning.id}>
                  <td>{new Date(earning.date).toLocaleDateString()}</td>
                  <td>${earning.amount}</td>
                  <td>{earning.source}</td>
                  <td>{earning.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Method Update Form */}
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-2">
          <h2 className="text-xl font-bold mb-4">Update Payment Method</h2>
          <form onSubmit={handlePaymentMethodUpdate}>
            <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-white">
                Payment Method
              </label>
              <input
                type="text"
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentDetails" className="block text-sm font-medium text-white">
                Payment Details
              </label>
              <input
                type="text"
                id="paymentDetails"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Payment Method
            </button>
          </form>
          {message.text && (
            <div className={`mt-4 rounded-md bg-${message.type === "error" ? "red" : "green"}-100 p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === "error" ? (
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L10 10.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L10 10.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{message.text}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

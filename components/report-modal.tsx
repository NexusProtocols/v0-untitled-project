"use client"

import type React from "react"

import { useState } from "react"
import { sendReportToDiscord } from "@/app/actions/send-report"

type ReportModalProps = {
  isOpen: boolean
  onClose: () => void
  scriptId: string
  scriptTitle: string
  reportedBy: string
}

const reportReasons = [
  "Malicious code",
  "Doesn't work",
  "Inappropriate content",
  "Stolen script",
  "Misleading description",
  "Other",
]

export function ReportModal({ isOpen, onClose, scriptId, scriptTitle, reportedBy }: ReportModalProps) {
  const [reportReason, setReportReason] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reportReason) {
      setMessage({ type: "error", text: "Please select a reason for reporting" })
      return
    }

    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await sendReportToDiscord({
        scriptId,
        scriptTitle,
        reportReason,
        additionalInfo,
        reportedBy,
      })

      if (result.success) {
        setMessage({ type: "success", text: "Report submitted successfully. Thank you for helping keep NEXUS safe." })

        // Reset form and close after delay
        setTimeout(() => {
          setReportReason("")
          setAdditionalInfo("")
          onClose()
        }, 2000)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to submit report. Please try again." })
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Report Script</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 rounded p-3 ${
              message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-400">
              You are reporting: <span className="font-medium text-white">{scriptTitle}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium text-red-400">Reason for reporting</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            >
              <option value="">Select a reason</option>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-medium text-red-400">Additional information</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={4}
              placeholder="Please provide any additional details about the issue..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/10 bg-[#050505] px-4 py-2 font-medium text-white transition-all hover:bg-[#1a1a1a]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

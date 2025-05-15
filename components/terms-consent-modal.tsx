"use client"

import { useState, useEffect, useRef } from "react"

interface TermsConsentModalProps {
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
}

export default function TermsConsentModal({ isOpen, onAccept, onClose }: TermsConsentModalProps) {
  const [canAccept, setCanAccept] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Detect if user has scrolled to bottom
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const handleScroll = () => {
      if (!contentRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20 // 20px threshold

      if (isAtBottom && !canAccept) {
        setCanAccept(true)
      }
    }

    const contentElement = contentRef.current
    contentElement.addEventListener("scroll", handleScroll)

    return () => {
      contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [isOpen, canAccept])

  // Reset scroll position and acceptance state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCanAccept(false)
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div ref={modalRef} className="w-full max-w-2xl rounded-lg border border-[#ff3e3e]/30 bg-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-xl font-bold text-white">Terms of Service</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div ref={contentRef} className="max-h-[60vh] overflow-y-auto p-6 text-gray-300">
          <h3 className="mb-4 text-lg font-bold text-white">Nexus Platform - Terms of Service</h3>
          <p className="mb-4 text-sm text-gray-400">Last Updated: 5/14/2025</p>

          <div className="space-y-4">
            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">1. Introduction and Acceptance of Terms</h4>
              <p>
                This Terms of Service ("Agreement") is a legally binding contract between you ("User") and Nexus
                ("Platform"). By accessing Nexus, you agree to all terms below. If you don't agree, you must stop using
                Nexus immediately.
              </p>
              <p className="mt-2">
                We may change these terms anytime without notice. Your continued use means you accept any changes. It's
                your responsibility to check for updates regularly. In some countries, we may require you to click "I
                Agree" before using Nexus.
              </p>
            </section>

            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">2. Definitions and Interpretation</h4>
              <p>
                When we say "Gateway" we mean the system where users must view ads before accessing content. "Ad Tier"
                refers to the different levels of ads you can choose. Higher tiers show more ads but pay more money.
              </p>
              <p className="mt-2">
                The word "including" always means "including but not limited to." Section headings are just for
                organization and don't affect how we interpret the rules.
              </p>
            </section>

            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">3. Account Registration and Management</h4>
              <p>
                <strong>3.1 Creating Your Account</strong>
                <br />
                You must be at least 18 years old to use Nexus. When you create an account, you must provide accurate
                information. You can't use fake names or pretend to be someone else.
              </p>
              <p className="mt-2">
                <strong>3.2 Keeping Your Account Safe</strong>
                <br />
                You are responsible for keeping your password secret. If someone else uses your account, you must tell
                us right away. We may ask you to prove your identity if we suspect problems.
              </p>
              <p className="mt-2">
                <strong>3.3 Account Termination</strong>
                <br />
                We can close your account at any time for any reason. If we close your account, you lose access to all
                your earnings and content. We don't have to explain why we closed your account.
              </p>
            </section>

            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">4. User Responsibilities and Conduct</h4>
              <p>
                <strong>4.1 Following the Rules</strong>
                <br />
                You must use Nexus properly. This means:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>No cheating the ad system</li>
                <li>No uploading harmful files</li>
                <li>No pretending to be someone else</li>
                <li>No trying to break our security</li>
              </ul>
              <p className="mt-2">
                <strong>4.2 Your Username</strong>
                <br />
                We can change your username if we want to. We might do this if your name is offensive or misleading. You
                don't get to complain if we change it.
              </p>
            </section>

            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">5. Content Submission and Ownership</h4>
              <p>
                <strong>5.1 What You Can Upload</strong>
                <br />
                You can upload scripts and other content, but you must own it or have permission. When you upload
                something, you're giving us permission to use it however we want.
              </p>
              <p className="mt-2">
                <strong>5.2 What You Can't Upload</strong>
                <br />
                Never upload:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Illegal content</li>
                <li>Viruses or malware</li>
                <li>Stolen material</li>
                <li>Anything that could harm others</li>
              </ul>
            </section>

            {/* Additional sections would continue here */}

            <section>
              <h4 className="mb-2 font-bold text-[#ff3e3e]">20. Full Legal Acknowledgment</h4>
              <p>By using Nexus, you confirm:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>You read all these terms</li>
                <li>You understand them</li>
                <li>You give up certain legal rights</li>
                <li>You'll follow all the rules</li>
              </ul>
              <p className="mt-2">
                This is our complete agreement. Nothing else matters unless we put it in writing. If you don't agree,
                don't use Nexus.
              </p>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 p-4">
          {!canAccept && (
            <div className="text-sm text-yellow-400">
              <i className="fas fa-exclamation-circle mr-2"></i> Please scroll to the bottom to accept
            </div>
          )}
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="rounded border border-white/10 bg-[#0a0a0a] px-4 py-2 text-white transition-all hover:bg-[#252525]"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!canAccept}
              className={`rounded px-4 py-2 font-semibold text-white transition-all ${
                canAccept
                  ? "bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] hover:shadow-lg hover:shadow-[#ff3e3e]/20"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

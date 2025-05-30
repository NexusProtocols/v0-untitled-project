"use client"

import { useState, useEffect } from "react"

export default function PrivacyPolicyPage() {
  const [scrolled, setScrolled] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem("nexus-privacy-accepted") === "true"
    setAccepted(hasAccepted)
  }, [])

  const handleAccept = () => {
    localStorage.setItem("nexus-privacy-accepted", "true")
    setAccepted(true)
  }

  if (accepted) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="p-4 text-green-400 rounded-lg border border-green-500/20 bg-green-500/10">
            You've already accepted our Privacy Policy.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Privacy Policy
        </h1>

        <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 mb-8">
          <p className="text-gray-300 mb-4">
            <strong>Last Updated:</strong> 5/14/2025
            <br />
            <strong>Effective Immediately Upon First Access</strong>
          </p>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">Table of Contents</h2>
            <ol className="list-decimal list-inside mb-6 text-gray-300">
              <li className="mb-1">Introduction and Scope</li>
              <li className="mb-1">Definitions and Interpretation</li>
              <li className="mb-1">Information Collection Practices</li>
              <li className="mb-1">Purpose of Data Processing</li>
              <li className="mb-1">Legal Bases for Processing</li>
              <li className="mb-1">Data Sharing and Third-Party Disclosures</li>
              <li className="mb-1">International Data Transfers</li>
              <li className="mb-1">Data Security Measures</li>
              <li className="mb-1">Data Retention Policies</li>
              <li className="mb-1">User Rights and Choices</li>
              <li className="mb-1">Children's Privacy</li>
              <li className="mb-1">Automated Decision Making</li>
              <li className="mb-1">Cookies and Tracking Technologies</li>
              <li className="mb-1">Third-Party Websites and Services</li>
              <li className="mb-1">Business Transfers</li>
              <li className="mb-1">Changes to This Policy</li>
              <li className="mb-1">Contact Information</li>
              <li className="mb-1">Dispute Resolution</li>
              <li className="mb-1">Governing Law</li>
              <li className="mb-1">Miscellaneous Provisions</li>
            </ol>

            <hr className="border-white/10 my-8" />

            <section id="introduction" className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction and Scope</h2>
              <p className="text-gray-300 mb-4">
                This Privacy Policy ("Policy") governs the collection, use, disclosure, and protection of personal data
                when you access or use Nexus ("Platform," "we," "us," or "our"). By using Nexus, you consent to the
                practices described herein.
              </p>

              <h3 className="text-xl font-bold text-white mb-2">1.1 Full Application</h3>
              <p className="text-gray-300 mb-4">This Policy applies to:</p>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>All website visitors, registered users, and content contributors</li>
                <li>All subdomains, mobile applications, and related services</li>
                <li>All data processing activities globally</li>
              </ul>

              <h3 className="text-xl font-bold text-white mb-2">1.2 No Opt-Out</h3>
              <p className="text-gray-300">
                Continued use of Nexus constitutes unconditional acceptance. The only alternative is immediate
                termination of all Platform access.
              </p>
            </section>

            <hr className="border-white/10 my-8" />

            <section id="definitions" className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">2. Definitions and Interpretation</h2>

              <h3 className="text-xl font-bold text-white mb-2">2.1 Key Terms</h3>
              <p className="text-gray-300 mb-2">
                <strong>Personal Data</strong>: Any information relating to an identifiable individual, including but
                not limited to:
              </p>
              <ul className="list-disc list-inside mb-4 text-gray-300 ml-4">
                <li>Device identifiers (HWID, MAC address)</li>
                <li>Network information (IP addresses)</li>
                <li>Behavioral data (clickstream, engagement metrics)</li>
              </ul>

              <p className="text-gray-300 mb-2">
                <strong>Processing</strong>: Any operation performed on Personal Data, including collection, storage,
                and sharing.
              </p>

              <h3 className="text-xl font-bold text-white mb-2">2.2 Interpretation</h3>
              <p className="text-gray-300">
                The terms "include" and "including" shall mean "including without limitation."
              </p>
            </section>

            {/* Additional sections would continue here - abbreviated for brevity */}

            <div className="text-center mt-12 text-gray-400">
              <p>For the complete Privacy Policy, please read the entire document.</p>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-[#1a1a1a] border border-[#ff3e3e]/30 rounded-xl p-6 sticky bottom-4 backdrop-blur">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-white">By using Nexus, you agree to our Privacy Policy.</h3>
              <p className="text-sm text-gray-400">We collect data to provide and improve our services.</p>
            </div>
            <button
              onClick={handleAccept}
              className="px-6 py-3 bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] rounded-md font-medium hover:from-[#ff5e5e] hover:to-[#ff2020] transition-all"
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

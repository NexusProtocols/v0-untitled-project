export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Terms of Service
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
              <li className="mb-1">Introduction and Acceptance of Terms</li>
              <li className="mb-1">Definitions and Interpretation</li>
              <li className="mb-1">Account Registration and Management</li>
              <li className="mb-1">User Responsibilities and Conduct</li>
              <li className="mb-1">Content Submission and Ownership</li>
              <li className="mb-1">Gateway System and Monetization</li>
              <li className="mb-1">Advertisement Policies</li>
              <li className="mb-1">Payment Processing and Earnings</li>
              <li className="mb-1">Tax Compliance and Reporting</li>
              <li className="mb-1">Affiliate Program Terms</li>
              <li className="mb-1">Prohibited Activities and Enforcement</li>
              <li className="mb-1">Termination and Suspension of Accounts</li>
              <li className="mb-1">Dispute Resolution and Arbitration</li>
              <li className="mb-1">Limitation of Liability and Warranty Disclaimers</li>
              <li className="mb-1">Intellectual Property Rights</li>
              <li className="mb-1">Privacy Policy and Data Collection</li>
              <li className="mb-1">Modifications to Terms</li>
              <li className="mb-1">Governing Law and Jurisdiction</li>
              <li className="mb-1">Miscellaneous Provisions</li>
              <li className="mb-1">Full Legal Acknowledgment and Consent</li>
            </ol>

            <hr className="border-white/10 my-8" />

            <section id="introduction" className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction and Acceptance of Terms</h2>
              <p className="text-gray-300 mb-4">
                This Terms of Service ("Agreement") is a legally binding contract between you ("User," "you," or "your")
                and Nexus ("Platform," "we," "us," or "our"). By accessing, registering, or using any services provided
                by Nexus, you explicitly agree to comply with all terms outlined herein.
              </p>

              <h3 className="text-xl font-bold text-white mb-2">1.1 Mandatory Acceptance</h3>
              <p className="text-gray-300 mb-4">
                In jurisdictions where automatic acceptance is not legally recognized, continued use of the Platform
                constitutes implied consent. Some countries require explicit agreement through affirmative action (e.g.,
                clicking "I Agree"). Where required, users must manually accept these Terms before proceeding. Users who
                do not agree must immediately cease all use of Nexus.
              </p>

              <h3 className="text-xl font-bold text-white mb-2">1.2 Updates and Modifications</h3>
              <p className="text-gray-300">
                Nexus reserves the right to modify these Terms at any time without prior notice. Continued use after
                changes constitutes acceptance of the revised Terms. Users are responsible for periodically reviewing
                this Agreement.
              </p>
            </section>

            {/* Additional sections would continue here - abbreviated for brevity */}

            <div className="text-center mt-12 text-gray-400">
              <p>For the complete Terms of Service, please read the entire document.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

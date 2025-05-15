export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Cookie Policy
        </h1>

        <div className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8 mb-8">
          <p className="text-gray-300 mb-4">
            <strong>Last Updated:</strong> 5/14/2025
            <br />
            <strong>Effective Immediately Upon First Access</strong>
          </p>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">Nexus Cookie & Tracking Technologies Policy</h2>

            <section id="necessary-cookies" className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">1. Strictly Necessary Cookies</h3>
              <p className="text-gray-300 mb-4">
                These cookies are essential for the website to function and cannot be switched off.
              </p>

              <h4 className="text-lg font-bold text-white mb-2">1.1 What We Use:</h4>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>Session authentication (keeps you logged in)</li>
                <li>Security & fraud prevention (HWID/IP tracking)</li>
                <li>Gateway ad verification (prevents fake clicks)</li>
              </ul>

              <p className="text-gray-300 italic">
                "Opt-out is not available - these are required for Nexus to operate."
              </p>
            </section>

            <section id="performance-cookies" className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">2. Performance & Analytics Cookies</h3>
              <p className="text-gray-300 mb-4">We collect data to improve our services and detect fraud.</p>

              <h4 className="text-lg font-bold text-white mb-2">2.1 Tracking Includes:</h4>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>User behavior (clicks, gateway interactions)</li>
                <li>Device information (browser, OS, screen resolution)</li>
                <li>Network data (IP address, approximate location)</li>
              </ul>

              <p className="text-gray-300 italic">
                "By using Nexus, you consent to this tracking. Limited opt-out available (Section 5)."
              </p>
            </section>

            <section id="advertising-cookies" className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">3. Advertising Cookies</h3>
              <p className="text-gray-300 mb-4">Critical for our monetization system.</p>

              <h4 className="text-lg font-bold text-white mb-2">3.1 What We Track:</h4>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>Ad engagement metrics (clicks, conversions)</li>
                <li>Cross-site tracking (to prevent duplicate earnings)</li>
                <li>Interest-based profiling (for targeted ads)</li>
              </ul>

              <p className="text-gray-300 italic">
                "Opting out will disable your ability to earn revenue from gateways."
              </p>
            </section>

            {/* Additional sections would continue here - abbreviated for brevity */}

            <div className="text-center mt-12 text-gray-400">
              <p>For the complete Cookie Policy, please read the entire document.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

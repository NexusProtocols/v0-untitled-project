import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const [scrolled, setScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(`nexus-${type}-accepted`, 'true');
    setAccepted(true);
  };

  if (accepted) {
    return <div className="p-4 text-green-400">You've already accepted these {type}.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Nexus - {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</title>
      </Head>

      {/* Header */}


      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-400">
            {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </h1>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">
              {type === 'terms' ? 'Last Updated: [Date]' : 'Effective: [Date]'}
            </h2>
            
            {type === 'terms' ? (
              <TermsContent />
            ) : (
              <PrivacyContent />
            )}
          </div>

          {/* Acceptance Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky bottom-4 backdrop-blur">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium">By using Nexus, you agree to our {type}.</h3>
                <p className="text-sm text-gray-400">
                  {type === 'terms' 
                    ? 'You must accept to continue using the platform.'
                    : 'We collect data to provide and improve our services.'}
                </p>
              </div>
              <button
                onClick={handleAccept}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-md font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6">
      <Section title="1. Acceptance of Terms">
        <p>By accessing Nexus, you agree to these legally binding Terms. Continued use constitutes acceptance.</p>
      </Section>

      <Section title="2. Canadian Jurisdiction">
        <p>These Terms are governed by the laws of Ontario and Canada. Disputes will be resolved through binding arbitration in Toronto.</p>
      </Section>

      <Section title="3. Account Termination">
        <p>Nexus may ban any account without notice or explanation. Banned users forfeit all earnings and content.</p>
      </Section>

      <Section title="4. Gateway Monetization">
        <p>Users earn when others interact with ads on their gateways. Fraudulent activity (bots, fake clicks) results in permanent bans.</p>
      </Section>

      <Section title="5. Tax Compliance">
        <p>Canadian users receiving payments will be issued T4A slips for amounts over $500/year as required by CRA.</p>
      </Section>

      <Section title="6. Dispute Resolution">
        <p>All claims must be resolved through individual arbitration. Class actions and lawsuits are prohibited.</p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6">
      <Section title="1. Data Collection">
        <p>We collect: HWIDs, IPs, device info, ad interactions, and gateway analytics. This is essential for fraud prevention.</p>
      </Section>

      <Section title="2. PIPEDA Compliance">
        <p>Under Canada's privacy law, you may request access to your data. Fraud prevention data cannot be deleted.</p>
      </Section>

      <Section title="3. Third-Party Sharing">
        <p>We share data with: Ad networks (PropellerAds), payment processors (PayPal), and fraud prevention services.</p>
      </Section>

      <Section title="4. International Transfers">
        <p>Data is processed in Canada, US, and Germany. We use SCCs for EU data transfers when required.</p>
      </Section>

      <Section title="5. User Rights">
        <p>Canadian users may contact privacy@nexus.example for data requests. Note: Most tracking cannot be disabled.</p>
      </Section>

      <Section title="6. Children's Privacy">
        <p>Nexus is strictly 18+. We may require age verification through government ID or payment methods.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-orange-500 pl-4">
      <h3 className="text-xl font-semibold mb-2 text-gray-200">{title}</h3>
      <div className="text-gray-300 space-y-2">
        {children}
      </div>
    </div>
  );
}

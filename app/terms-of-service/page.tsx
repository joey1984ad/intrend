import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Intrend ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Intrend is a digital marketing analytics platform that provides insights and analysis for advertising campaigns across various platforms including Meta (Facebook/Instagram), Google, and other social media platforms. Our service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Campaign performance analytics</li>
                <li>Creative asset analysis and optimization recommendations</li>
                <li>Cross-platform advertising insights</li>
                <li>Automated reporting and data visualization</li>
                <li>AI-powered creative analysis and suggestions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Meta Platform Integration</h2>
              <p className="text-gray-700 mb-4">
                Our Service integrates with Meta platforms (Facebook and Instagram) to provide advertising insights and analytics. By using our Service, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You have the necessary permissions to access Meta advertising accounts</li>
                <li>You comply with Meta's Terms of Service and Advertising Policies</li>
                <li>We may access your Meta advertising data solely for providing our analytics services</li>
                <li>We do not store sensitive personal information from Meta platforms</li>
                <li>You can revoke our access to your Meta accounts at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Usage and Privacy</h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and handling your data responsibly. Our data practices include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We only collect data necessary to provide our services</li>
                <li>We do not sell or share your personal data with third parties</li>
                <li>We implement appropriate security measures to protect your data</li>
                <li>We comply with applicable data protection laws including GDPR and CCPA</li>
                <li>You have the right to access, modify, or delete your personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Subscription and Billing</h2>
              <p className="text-gray-700 mb-4">
                Our Service operates on a subscription basis with the following terms:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Subscriptions are billed monthly or annually in advance</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>We may change pricing with 30 days notice</li>
                <li>You can cancel your subscription at any time</li>
                <li>Access to paid features will continue until the end of your billing period</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Intrend and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Intrend, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@intrend.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

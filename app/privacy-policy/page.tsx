import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Intrend',
  description: 'Privacy Policy for Intrend - AI-powered Facebook Ads analytics and management platform. Learn how we protect your data and comply with Meta requirements.',
  openGraph: {
    title: 'Privacy Policy - Intrend',
    description: 'Privacy Policy for Intrend - AI-powered Facebook Ads analytics and management platform. Learn how we protect your data and comply with Meta requirements.',
    url: 'https://itsintrend.com/privacy-policy',
    siteName: 'Intrend',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Intrend',
    description: 'Privacy Policy for Intrend - AI-powered Facebook Ads analytics and management platform. Learn how we protect your data and comply with Meta requirements.',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Intrend ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital marketing analytics platform. Please read this privacy policy carefully.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name and email address</li>
                <li>Company information</li>
                <li>Billing and payment information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Meta Platform Data</h3>
              <p className="text-gray-700 mb-4">
                With your explicit consent, we access data from your Meta advertising accounts, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Campaign performance metrics</li>
                <li>Ad creative assets and performance data</li>
                <li>Audience insights and demographics</li>
                <li>Account structure and settings</li>
                <li>Billing and spend information</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> We do not access or store personal information about your customers or end users from Meta platforms.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information about your use of our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Analytics data about feature usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage and trends</li>
                <li>Detect, investigate, and prevent security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Meta Platform Integration</h2>
              <p className="text-gray-700 mb-4">
                Our integration with Meta platforms is designed with privacy in mind:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Limited Data Access:</strong> We only access advertising performance data, not personal user data</li>
                <li><strong>Explicit Consent:</strong> We require your explicit permission before accessing any Meta data</li>
                <li><strong>Secure Transmission:</strong> All data is transmitted using industry-standard encryption</li>
                <li><strong>No Data Selling:</strong> We never sell or share your Meta data with third parties</li>
                <li><strong>Data Retention:</strong> We retain Meta data only as long as necessary to provide our services</li>
                <li><strong>Revocable Access:</strong> You can revoke our access to your Meta accounts at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our Service</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred</li>
                <li><strong>Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. Specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account information is retained while your account is active</li>
                <li>Meta platform data is retained for up to 2 years for analytics purposes</li>
                <li>Billing information is retained as required by law</li>
                <li>You can request deletion of your data at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@intrend.com<br />
                  <strong>Data Protection Officer:</strong> dpo@intrend.com<br />
                  <strong>Address:</strong> 6303 Owensmouth Ave, Los Angeles, CA<br />
                  <strong>Phone:</strong> (424) 208-2521
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Compliance with Meta Requirements</h2>
              <p className="text-gray-700 mb-4">
                This Privacy Policy is designed to comply with Meta's Platform Terms and Developer Policies, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Clear disclosure of data collection and use</li>
                <li>User consent for data access</li>
                <li>Data minimization principles</li>
                <li>Secure data handling practices</li>
                <li>User rights and data portability</li>
                <li>Regular privacy policy updates</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalPrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-12 max-w-3xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 29, 2026</p>

      <p className="mb-4">
        This Privacy Policy describes how Rinalds Uzkalns ("we", "us", or "our") collects, uses, and protects your information when you use Claude Cope ("the Service").
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>

      <h3 className="text-lg font-medium mt-4 mb-2">Information You Provide</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Username or display name you choose within the Service</li>
        <li>Any messages or content you submit through the Service</li>
        <li>Payment information (processed securely by our merchant of record, Polar.sh — we do not store your payment details)</li>
      </ul>

      <h3 className="text-lg font-medium mt-4 mb-2">Information Collected Automatically</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Browser type and version</li>
        <li>Device type and operating system</li>
        <li>IP address</li>
        <li>Pages visited and features used within the Service</li>
        <li>Referring URL</li>
        <li>Date and time of access</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <p className="mb-4">We use the information we collect to:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Provide, maintain, and improve the Service</li>
        <li>Process transactions and send related information</li>
        <li>Respond to your comments, questions, and support requests</li>
        <li>Monitor and analyze trends, usage, and activities</li>
        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Cookies and Tracking Technologies</h2>
      <p className="mb-4">
        Claude Cope does not set tracking cookies. Our product analytics provider (PostHog, see Section 4) is configured with memory-only persistence, which means no cookies and no <code>localStorage</code> entries are written for analytics purposes; all analytics state is held in tab memory and discarded when you close the tab.
      </p>
      <p className="mb-4">
        We do use a small number of strictly-necessary browser <code>localStorage</code> entries to remember your in-game state (username, score, theme preference) so that the Service can function across page reloads. These entries stay on your device and are not transmitted to third parties for tracking purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Sharing and Disclosure</h2>
      <p className="mb-4">We do not sell your personal information. We may share your information with:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Hosting and infrastructure:</strong> Cloudflare (Workers, Pages, D1, KV) for hosting and content delivery.</li>
        <li><strong>Payment processing:</strong> Polar.sh acts as our merchant of record for paid licenses. Polar collects and processes payment details directly; we receive only the resulting license metadata.</li>
        <li><strong>Product analytics:</strong> PostHog (PostHog Inc., hosted in the European Union at <code>eu.i.posthog.com</code>) processes anonymous product-usage events on our behalf. The events captured are limited to the actions you take inside the terminal (slash commands attempted or failed, in-game purchases, account events such as restore/upgrade/shill). Each event is associated with a randomly generated anonymous identifier (the "cope_id"), the username you have chosen within the Service, and the standard request metadata that PostHog collects automatically (browser, device type, IP address, timestamp). PostHog is configured with autocapture, page-view tracking, and session recording disabled. Acts as a processor under GDPR; the data processing agreement is published by PostHog at <a href="https://posthog.com/dpa" className="text-blue-600 hover:underline">posthog.com/dpa</a>.</li>
        <li><strong>AI Model Providers:</strong> We utilize third-party API providers (such as OpenRouter) to process the text prompts you submit to the Service in order to generate responses. Please do not submit confidential, sensitive, or personally identifiable information into the terminal.</li>
        <li><strong>Legal requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
        <li><strong>Protection of rights:</strong> When we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention</h2>
      <p className="mb-4">
        We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
      <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
        <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
        <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
        <li><strong>Objection:</strong> Object to processing of your personal data</li>
        <li><strong>Restriction:</strong> Request restriction of processing of your personal data</li>
      </ul>
      <p className="mb-4">
        To exercise any of these rights, please contact us at <a href="mailto:support@claudecope.com" className="text-blue-600 hover:underline">support@claudecope.com</a>. We will respond to your request within 30 days.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Data Security</h2>
      <p className="mb-4">
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Children's Privacy</h2>
      <p className="mb-4">
        The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. International Data Transfers</h2>
      <p className="mb-4">
        Your information may be transferred to and processed in countries other than the country in which you are resident. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure that your personal information remains protected.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@claudecope.com" className="text-blue-600 hover:underline">support@claudecope.com</a>.
      </p>

      <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>&copy; 2026 Rinalds Uzkalns. All rights reserved.</p>
        <p className="mt-2">
          <a href="/" className="text-blue-600 hover:underline">Back to Claude Cope</a>
          {" | "}
          <a href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}

export default LegalPrivacyPage;

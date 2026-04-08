function LegalTermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-12 max-w-3xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 8, 2026</p>

      <p className="mb-4">
        Welcome to Claude Cope ("the Service"), operated by Rinalds Uzkalns ("we", "us", or "our"). By accessing or using the Service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Description of Service</h2>
      <p className="mb-4">
        Claude Cope is a browser-based entertainment and parody application. The Service is provided for entertainment purposes only. Any resemblance to real software development practices is intentional but satirical in nature.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Acceptance of Terms</h2>
      <p className="mb-4">
        By creating an account or using any part of the Service, you confirm that you have read, understood, and agree to be bound by these Terms and our <a href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. User Accounts</h2>
      <p className="mb-4">
        You may be required to provide a username or other identifying information to use certain features of the Service. You are responsible for maintaining the confidentiality of your account information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Acceptable Use</h2>
      <p className="mb-4">You agree not to:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Use the Service for any unlawful purpose</li>
        <li>Attempt to interfere with or disrupt the Service</li>
        <li>Attempt to gain unauthorized access to the Service or its related systems</li>
        <li>Use the Service to harass, abuse, or harm others</li>
        <li>Reproduce, duplicate, or resell any part of the Service without express written permission</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Intellectual Property</h2>
      <p className="mb-4">
        All content, design, text, graphics, and other materials on the Service are owned by or licensed to us. You may not copy, modify, distribute, or create derivative works from any content on the Service without our prior written consent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Purchases and Payments</h2>
      <p className="mb-4">
        Certain features of the Service may be available for purchase. All purchases are processed through our merchant of record, Polar.sh. All sales are final unless otherwise required by applicable law. If you believe a charge was made in error, please contact us at <a href="mailto:support@claudecope.com" className="text-blue-600 hover:underline">support@claudecope.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Refund Policy</h2>
      <p className="mb-4">
        If you are unsatisfied with a purchase, you may request a refund within 14 days of the purchase date by contacting <a href="mailto:support@claudecope.com" className="text-blue-600 hover:underline">support@claudecope.com</a>, provided you have not consumed a significant portion of your allocated usage quota. Refund requests will be reviewed on a case-by-case basis in accordance with applicable consumer protection laws.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Disclaimer of Warranties</h2>
      <p className="mb-4">
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Limitation of Liability</h2>
      <p className="mb-4">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last updated" date at the top of this page. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Governing Law</h2>
      <p className="mb-4">
        These Terms shall be governed by and construed in accordance with the laws of Estonia, without regard to conflict of law principles.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Contact</h2>
      <p className="mb-4">
        If you have any questions about these Terms, please contact us at <a href="mailto:support@claudecope.com" className="text-blue-600 hover:underline">support@claudecope.com</a>.
      </p>

      <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>&copy; 2026 Rinalds Uzkalns. All rights reserved.</p>
        <p className="mt-2">
          <a href="/" className="text-blue-600 hover:underline">Back to Claude Cope</a>
          {" | "}
          <a href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default LegalTermsPage;

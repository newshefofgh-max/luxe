import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Accessory collects and uses your personal data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="section-tag mb-4">Legal</p>
        <h1 className="section-title mb-10">Privacy Policy</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Information We Collect
            </h2>
            <p>
              When you place an order we collect your name, phone number, delivery address, and
              optionally your email address. We use this solely to fulfil and communicate about your
              order.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Process and deliver your order.</li>
              <li>Send order status updates via WhatsApp.</li>
              <li>Prevent fraud and duplicate orders.</li>
              <li>Improve our products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Data Sharing
            </h2>
            <p>
              We share your delivery address and phone number with our logistics partner (Bosta) solely
              to deliver your order. We do not sell your personal data to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Data Retention
            </h2>
            <p>
              Order records are retained for up to <strong>3 years</strong> for accounting and legal
              compliance. You may request deletion of your account data at any time by contacting us on
              WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Cookies
            </h2>
            <p>
              We use browser local storage to persist your shopping cart between sessions. No tracking
              cookies or third-party advertising pixels are used.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Contact
            </h2>
            <p>
              For any privacy-related questions, reach us on WhatsApp. We aim to respond within one
              business day.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

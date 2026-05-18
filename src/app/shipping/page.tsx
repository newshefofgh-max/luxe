import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Accessory shipping times and fees across Egypt.',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-page pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="section-tag mb-4">Delivery</p>
        <h1 className="section-title mb-10">Shipping Policy</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Delivery Timeframe
            </h2>
            <p>
              Orders are dispatched within <strong>1–2 business days</strong> of being placed.
              Delivery takes <strong>2–5 business days</strong> to Cairo and Giza, and{' '}
              <strong>3–7 business days</strong> to all other governorates.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Shipping Fees
            </h2>
            <p className="mb-3">Shipping fees vary by governorate:</p>
            <ul className="space-y-1">
              <li><span className="font-semibold" style={{ color: 'var(--text)' }}>Cairo &amp; Giza</span> — 45 EGP</li>
              <li><span className="font-semibold" style={{ color: 'var(--text)' }}>Alexandria</span> — 55 EGP</li>
              <li><span className="font-semibold" style={{ color: 'var(--text)' }}>Other Governorates</span> — 65 EGP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Payment on Delivery
            </h2>
            <p>
              We offer <strong>Cash on Delivery</strong> across all Egyptian governorates. No
              pre-payment is required — pay when your order arrives at your door.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Order Tracking
            </h2>
            <p>
              Once your order ships you will receive a WhatsApp message with your tracking number.
              You can also track your order from your account page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

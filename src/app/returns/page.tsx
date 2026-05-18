import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description: 'Accessory returns and exchanges policy.',
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-page pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="section-tag mb-4">Policy</p>
        <h1 className="section-title mb-10">Returns &amp; Exchanges</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              14-Day Return Window
            </h2>
            <p>
              We accept returns and exchanges within <strong>14 days</strong> of delivery. Items must
              be unused, unworn, and in their original packaging with all tags attached.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              How to Return
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us on WhatsApp with your order number.</li>
              <li>We will confirm eligibility and arrange a pickup.</li>
              <li>Once received and inspected, a refund or exchange is processed within 3 business days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Non-Returnable Items
            </h2>
            <p>
              Earrings and pierced jewellery cannot be returned for hygiene reasons. Sale items are
              final sale unless they arrive damaged or defective.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
              Damaged or Incorrect Orders
            </h2>
            <p>
              If your order arrives damaged or incorrect, please send us a photo within{' '}
              <strong>48 hours</strong> of receipt and we will arrange a replacement or full refund at
              no cost to you.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

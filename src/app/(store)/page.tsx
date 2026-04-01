import { getTenantWithConfig } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function HomePage() {
  let tenant;

  try {
    tenant = await getTenantWithConfig();
  } catch {
    notFound();
  }

  const config = tenant.storeConfig;
  const contact = config?.contact_json as {
    phone?: string;
    whatsapp?: string;
    email?: string;
  } | null;
  const features = config?.features_json as {
    enableCOD?: boolean;
    enableWishlist?: boolean;
    enableCoupons?: boolean;
  } | null;

  return (
    <main className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, white)",
        }}
      >
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ color: "var(--color-primary)" }}
        >
          {tenant.name}
        </h1>

        {config?.store_tagline && (
          <p className="text-lg text-gray-600 max-w-xl">
            {config.store_tagline}
          </p>
        )}

        <a
          href="/products"
          className="mt-2 inline-block px-8 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Shop Now
        </a>
      </section>

      {/* ── Store info ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid gap-8 sm:grid-cols-3">
        {features?.enableCOD && (
          <div className="text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold text-gray-800">Cash on Delivery</h3>
            <p className="text-sm text-gray-500 mt-1">
              Pay when your order arrives
            </p>
          </div>
        )}

        <div className="text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-gray-800">Secure Checkout</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your payment is always safe
          </p>
        </div>

        {features?.enableCoupons && (
          <div className="text-center">
            <div className="text-3xl mb-3">🎟️</div>
            <h3 className="font-semibold text-gray-800">Discount Coupons</h3>
            <p className="text-sm text-gray-500 mt-1">
              Save more with promo codes
            </p>
          </div>
        )}
      </section>

      {/* ── Contact bar ─────────────────────────────────────── */}
      {contact?.phone && (
        <footer
          className="py-6 text-center text-sm text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          📞 {contact.phone}
          {contact.email && <span className="ml-6">✉️ {contact.email}</span>}
        </footer>
      )}
    </main>
  );
}

import type { NewsletterConfig } from "@/lib/page-builder/sections";

export function NewsletterSection({ config }: { config: NewsletterConfig }) {
  return (
    <section
      className="px-6 py-16"
      style={{
        backgroundColor:
          config.backgroundColor ??
          "color-mix(in srgb, var(--color-primary) 5%, white)",
      }}
    >
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h2>
        {config.subtitle && (
          <p className="text-gray-600 mb-6">{config.subtitle}</p>
        )}
        <form className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder={config.placeholder ?? "Your email address"}
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {config.buttonText ?? "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

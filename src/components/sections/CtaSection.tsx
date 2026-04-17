import Link from "next/link";
import type { CtaConfig } from "@/lib/page-builder/sections";

const ALIGN_CLASS = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function CtaSection({ config }: { config: CtaConfig }) {
  return (
    <section
      className="px-6 py-16"
      style={{
        backgroundColor: config.backgroundColor ?? "var(--color-primary)",
        color: config.textColor ?? "#FFFFFF",
      }}
    >
      <div
        className={`max-w-3xl mx-auto flex flex-col gap-4 ${ALIGN_CLASS[config.align]}`}
      >
        <h2 className="text-3xl font-bold">{config.title}</h2>
        {config.subtitle && (
          <p className="text-lg opacity-90">{config.subtitle}</p>
        )}
        <Link
          href={config.buttonLink}
          className="mt-2 inline-block w-fit px-8 py-3 rounded-full bg-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ color: config.backgroundColor ?? "var(--color-primary)" }}
        >
          {config.buttonText}
        </Link>
      </div>
    </section>
  );
}

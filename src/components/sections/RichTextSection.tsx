import type { RichTextConfig } from "@/lib/page-builder/sections";

const MAX_WIDTH_CLASS = {
  narrow: "max-w-2xl",
  medium: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-none",
};

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function RichTextSection({ config }: { config: RichTextConfig }) {
  return (
    <section className="px-6 py-12">
      <div
        className={`mx-auto ${MAX_WIDTH_CLASS[config.maxWidth ?? "medium"]} ${
          ALIGN_CLASS[config.align]
        } prose prose-gray`}
      >
        {config.content.split("\n\n").map((para, i) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-4">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

import type { SpacerConfig } from "@/lib/page-builder/sections";

const HEIGHT_CLASS = {
  small: "h-8",
  medium: "h-16",
  large: "h-32",
};

export function SpacerSection({ config }: { config: SpacerConfig }) {
  return <div className={HEIGHT_CLASS[config.height]} />;
}

export type ShippingConfig = {
  type: "flat_rate" | "free";
  flat_rate?: number;    // charge in ₹ when type is flat_rate
  free_above?: number;   // if subtotal >= this, shipping is free (optional)
};

/**
 * Returns the shipping cost in rupees.
 * isFreeShipping — set to true when a free_shipping promo is applied.
 */
export function calculateShipping(
  config: ShippingConfig | null | undefined,
  subtotal: number,
  isFreeShipping: boolean,
): number {
  if (isFreeShipping) return 0;

  if (!config || config.type === "free") return 0;

  // type === "flat_rate"
  const rate = config.flat_rate ?? 0;
  if (config.free_above != null && subtotal >= config.free_above) return 0;

  return rate;
}

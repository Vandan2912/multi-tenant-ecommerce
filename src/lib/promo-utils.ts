// ── Auto-generate a promo code (Pure utility, safe for client-side) ──────
export function generatePromoCode(prefix?: string): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    const random = Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    return prefix ? `${prefix.toUpperCase()}-${random}` : random;
}

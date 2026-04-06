import { db } from "./db";

export type PromoValidationResult =
    | { valid: true; promoCode: PromoCodeData; discount: number; message: string }
    | { valid: false; error: string; errorCode: PromoErrorCode };

export type PromoErrorCode =
    | "NOT_FOUND"
    | "INACTIVE"
    | "NOT_STARTED"
    | "EXPIRED"
    | "USAGE_EXCEEDED"
    | "USER_USAGE_EXCEEDED"
    | "MINIMUM_NOT_MET"
    | "NOT_APPLICABLE";

export type PromoCodeData = {
    id: string;
    code: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
    minimum_order_value: number | null;
    maximum_discount: number | null;
    applicable_products: string[];
    applicable_categories: string[];
    excluded_products: string[];
    stackable: boolean;
};

export type CartItemForPromo = {
    productId: string;
    categoryId: string | null;
    price: number;
    quantity: number;
};

// ── Validate and calculate discount ───────────────────────
export async function validatePromoCode(
    tenantId: string,
    code: string,
    cartItems: CartItemForPromo[],
    identifier: string,  // phone or email
    existingPromoId?: string, // if another promo already applied
): Promise<PromoValidationResult> {

    const normalized = code.trim().toUpperCase();

    // 1. Find the promo code
    const promo = await db.promoCode.findUnique({
        where: { tenant_id_code: { tenant_id: tenantId, code: normalized } },
    });

    if (!promo) return { valid: false, error: "Invalid promo code", errorCode: "NOT_FOUND" };

    // 2. Active check
    if (!promo.is_active) return { valid: false, error: "This promo code is no longer active", errorCode: "INACTIVE" };

    // 3. Date range check
    const now = new Date();
    if (promo.start_date && promo.start_date > now)
        return { valid: false, error: "This promo code is not active yet", errorCode: "NOT_STARTED" };

    if (promo.expiry_date && promo.expiry_date < now)
        return { valid: false, error: "This promo code has expired", errorCode: "EXPIRED" };

    // 4. Global usage limit
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit)
        return { valid: false, error: "This promo code has reached its usage limit", errorCode: "USAGE_EXCEEDED" };

    // 5. Per-user usage limit
    if (promo.usage_limit_per_user !== null && identifier) {
        const userUsage = await db.promoUsage.count({
            where: { promo_code_id: promo.id, identifier },
        });
        if (userUsage >= promo.usage_limit_per_user)
            return { valid: false, error: "You have already used this promo code", errorCode: "USER_USAGE_EXCEEDED" };
    }

    // 6. Stacking check
    if (!promo.stackable && existingPromoId && existingPromoId !== promo.id)
        return { valid: false, error: "This promo code cannot be combined with other offers", errorCode: "NOT_APPLICABLE" };

    // 7. Filter eligible cart items
    const eligibleItems = cartItems.filter((item) => {
        // Excluded products — never eligible
        if (promo.excluded_products.includes(item.productId)) return false;

        // If no restrictions — all eligible
        const hasProductRestriction = promo.applicable_products.length > 0;
        const hasCategoryRestriction = promo.applicable_categories.length > 0;

        if (!hasProductRestriction && !hasCategoryRestriction) return true;

        // Check product restriction
        if (hasProductRestriction && promo.applicable_products.includes(item.productId)) return true;

        // Check category restriction
        if (hasCategoryRestriction && item.categoryId && promo.applicable_categories.includes(item.categoryId)) return true;

        return false;
    });

    if (eligibleItems.length === 0 && (promo.applicable_products.length > 0 || promo.applicable_categories.length > 0))
        return { valid: false, error: "This promo code is not applicable to items in your cart", errorCode: "NOT_APPLICABLE" };

    // 8. Calculate eligible subtotal
    const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // 9. Minimum order value check (against cart total)
    if (promo.minimum_order_value !== null) {
        const minVal = Number(promo.minimum_order_value);
        if (cartTotal < minVal)
            return {
                valid: false,
                error: `Minimum order value of ₹${minVal.toLocaleString("en-IN")} required`,
                errorCode: "MINIMUM_NOT_MET",
            };
    }

    // 10. Calculate discount
    let discount = 0;

    if (promo.discount_type === "percentage") {
        discount = (eligibleSubtotal * Number(promo.discount_value)) / 100;
        if (promo.maximum_discount !== null) {
            discount = Math.min(discount, Number(promo.maximum_discount));
        }
    } else if (promo.discount_type === "fixed") {
        discount = Math.min(Number(promo.discount_value), eligibleSubtotal);
    } else if (promo.discount_type === "free_shipping") {
        discount = 0; // shipping handled separately at checkout
    }

    discount = Math.round(discount * 100) / 100; // round to 2 decimal places

    const promoData: PromoCodeData = {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: Number(promo.discount_value),
        minimum_order_value: promo.minimum_order_value ? Number(promo.minimum_order_value) : null,
        maximum_discount: promo.maximum_discount ? Number(promo.maximum_discount) : null,
        applicable_products: promo.applicable_products,
        applicable_categories: promo.applicable_categories,
        excluded_products: promo.excluded_products,
        stackable: promo.stackable,
    };

    const message =
        promo.discount_type === "free_shipping"
            ? "Free shipping applied!"
            : promo.discount_type === "percentage"
                ? `${promo.discount_value}% off applied${promo.maximum_discount ? ` (max ₹${Number(promo.maximum_discount).toLocaleString("en-IN")})` : ""}`
                : `₹${discount.toLocaleString("en-IN")} off applied`;

    return { valid: true, promoCode: promoData, discount, message };
}

// ── Record usage after order created ──────────────────────
export async function recordPromoUsage(
    promoCodeId: string,
    tenantId: string,
    identifier: string,
    orderId: string,
    discountGiven: number,
) {
    await Promise.all([
        db.promoUsage.create({
            data: {
                promo_code_id: promoCodeId,
                tenant_id: tenantId,
                identifier,
                order_id: orderId,
                discount_given: discountGiven,
            },
        }),
        db.promoCode.update({
            where: { id: promoCodeId },
            data: { used_count: { increment: 1 } },
        }),
    ]);
}

// ── Auto-generate a promo code ─────────────────────────────
export { generatePromoCode } from "./promo-utils";
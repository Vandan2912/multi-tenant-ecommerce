"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RazorpayButton } from "@/components/RazorpayButton";
import { PromoInput } from "@/components/PromoInput";

type Field = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "cod" | "online";
  couponCode: string;
};

const INITIAL: Field = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  paymentMethod: "cod",
  couponCode: "",
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [fields, setFields] = useState<Field>(INITIAL);
  const [errors, setErrors] = useState<Partial<Field>>({});
  const [loading, setLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [enableCOD, setEnableCOD] = useState(true);
  // todo: fetch from store to enable COD
  console.log(setEnableCOD);

  type PromoResult = {
    promoCodeId: string;
    code: string;
    discount: number;
    message: string;
    isFreeShipping: boolean;
    discountType: string;
  };

  const [appliedPromo, setAppliedPromo] = useState<PromoResult | null>(null);

  const promoDiscount = appliedPromo?.discount ?? 0;
  const isFreeShipping = appliedPromo?.isFreeShipping ?? false;
  const shipping = isFreeShipping ? 0 : 0; // your shipping logic
  const finalTotal = Math.max(0, total - promoDiscount + shipping);

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    if (color) setPrimaryColor(color);
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">🛒</p>
        <h2 className="text-xl font-semibold text-gray-700">
          Your cart is empty
        </h2>
        <Link
          href="/products"
          className="mt-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  function set(key: keyof Field, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Partial<Field> = {};
    if (!fields.name.trim()) e.name = "Required";
    if (!fields.phone.trim() || fields.phone.length < 10)
      e.phone = "Enter valid phone";
    if (!fields.line1.trim()) e.line1 = "Required";
    if (!fields.city.trim()) e.city = "Required";
    if (!fields.state.trim()) e.state = "Required";
    if (!fields.pincode.trim() || fields.pincode.length < 6)
      e.pincode = "Enter valid pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            variant: i.variant,
          })),
          customer: {
            name: fields.name,
            email: fields.email,
            phone: fields.phone,
          },
          address: {
            line1: fields.line1,
            line2: fields.line2,
            city: fields.city,
            state: fields.state,
            pincode: fields.pincode,
          },
          paymentMethod: fields.paymentMethod,
          promoCode: appliedPromo?.code ?? undefined,  // ← add this
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Something went wrong");
        return;
      }

      clearCart();
      router.push(`/order-confirmed?id=${data.orderId}&total=${data.total}`);
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (key: keyof Field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${errors[key]
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-200 focus:ring-blue-100"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ── Form ──────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-8">
          {/* Contact */}
          <section>
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Contact Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  placeholder="Full Name *"
                  value={fields.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <input
                  placeholder="Phone Number *"
                  type="tel"
                  value={fields.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass("phone")}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Email (optional)"
                  type="email"
                  value={fields.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass("email")}
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <input
                  placeholder="Address Line 1 *"
                  value={fields.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  className={inputClass("line1")}
                />
                {errors.line1 && (
                  <p className="text-red-400 text-xs mt-1">{errors.line1}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Address Line 2 (optional)"
                  value={fields.line2}
                  onChange={(e) => set("line2", e.target.value)}
                  className={inputClass("line2")}
                />
              </div>
              <div>
                <input
                  placeholder="City *"
                  value={fields.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputClass("city")}
                />
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <input
                  placeholder="State *"
                  value={fields.state}
                  onChange={(e) => set("state", e.target.value)}
                  className={inputClass("state")}
                />
                {errors.state && (
                  <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <input
                  placeholder="Pincode *"
                  maxLength={6}
                  value={fields.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  className={inputClass("pincode")}
                />
                {errors.pincode && (
                  <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {enableCOD && (
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${fields.paymentMethod === "cod"
                    ? "border-current"
                    : "border-gray-200"
                    }`}
                  style={{
                    color:
                      fields.paymentMethod === "cod" ? primaryColor : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={fields.paymentMethod === "cod"}
                    onChange={() => set("paymentMethod", "cod")}
                    className="hidden"
                  />
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-400">
                      Pay when you receive
                    </p>
                  </div>
                </label>
              )}
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${fields.paymentMethod === "online"
                  ? "border-current"
                  : "border-gray-200"
                  }`}
                style={{
                  color:
                    fields.paymentMethod === "online"
                      ? primaryColor
                      : undefined,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={fields.paymentMethod === "online"}
                  onChange={() => set("paymentMethod", "online")}
                  className="hidden"
                />
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    Pay Online
                  </p>
                  <p className="text-xs text-gray-400">
                    UPI, Cards, Net Banking
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Promo code */}
          <section>
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Promo Code
            </h2>
            <PromoInput
              cartItems={items.map((i) => ({
                productId: i.productId,
                categoryId: null,
                price: i.price,
                quantity: i.quantity,
              }))}
              identifier={fields.phone || fields.email}
              primaryColor={primaryColor}
              onApply={setAppliedPromo}
              applied={appliedPromo}
            />
          </section>
        </div>

        {/* ── Order summary ──────────────────────────────────── */}
        <div className="h-fit bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Order Summary</h2>

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">
                    {item.name}
                  </p>
                  <p className="text-gray-400">×{item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Promo ({appliedPromo?.code})</span>
                <span>-₹{promoDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {appliedPromo?.isFreeShipping && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            )}
            {!appliedPromo?.isFreeShipping && (
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800 text-base">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment action */}
          {fields.paymentMethod === "cod" ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? "Placing Order..." : "Place Order →"}
            </button>
          ) : (
            <RazorpayButton
              items={items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image,
                variant: i.variant,
              }))}
              total={total}
              customer={{
                name: fields.name,
                email: fields.email,
                phone: fields.phone,
              }}
              address={{
                line1: fields.line1,
                line2: fields.line2,
                city: fields.city,
                state: fields.state,
                pincode: fields.pincode,
              }}
              couponCode={fields.couponCode || undefined}
              primaryColor={primaryColor}
              onSuccess={(orderId) => {
                clearCart();
                router.push(`/order-confirmed?id=${orderId}&total=${total}`);
              }}
              onError={(msg) => alert(msg)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
};

type OrderAddress = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type Order = {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  items: OrderItem[];
  address: OrderAddress | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: "Your order has been placed and is awaiting confirmation.",
  confirmed: "Your order has been confirmed and is being prepared.",
  shipped: "Your order is on its way!",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "This order has been cancelled.",
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inputId, setInputId] = useState(searchParams.get("id") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563EB");

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary").trim();
    if (color) setPrimaryColor(color);
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) fetchOrder(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchOrder(id: string) {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(id.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Order not found");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputId.trim()) return;
    router.push(`/orders/track?id=${encodeURIComponent(inputId.trim())}`);
  }

  const isCancelled = order?.status === "cancelled";
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order?.status ?? "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
        <p className="text-gray-500 text-sm mt-1">Enter your Order ID to see the latest status</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Paste your Order ID here"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:border-transparent transition"
          style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={loading || !inputId.trim()}
          className="px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-4 text-center">
          {error}
        </div>
      )}

      {/* Order result */}
      {order && (
        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-gray-400 mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="font-bold text-lg" style={{ color: primaryColor }}>
                ₹{order.total.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400 capitalize mt-1">
                Payment: {order.payment_status}
              </p>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Order Status
            </p>

            {isCancelled ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                  ✕
                </div>
                <div>
                  <p className="font-semibold text-red-600">Cancelled</p>
                  <p className="text-xs text-gray-400">{STATUS_DESCRIPTIONS.cancelled}</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
                <div
                  className="absolute top-5 left-5 h-0.5 transition-all duration-500"
                  style={{
                    backgroundColor: primaryColor,
                    width: currentStep <= 0
                      ? "0%"
                      : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />

                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentStep;
                    const active = idx === currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 w-16">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10 bg-white"
                          style={{
                            borderColor: done ? primaryColor : "#E5E7EB",
                            color: done ? primaryColor : "#9CA3AF",
                            backgroundColor: active ? `${primaryColor}15` : "white",
                          }}
                        >
                          {done && !active ? "✓" : idx + 1}
                        </div>
                        <p
                          className="text-xs text-center font-medium leading-tight"
                          style={{ color: done ? primaryColor : "#9CA3AF" }}
                        >
                          {STATUS_LABELS[step]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isCancelled && (
              <p className="text-sm text-gray-500 mt-5 text-center">
                {STATUS_DESCRIPTIONS[order.status] ?? "Tracking your order…"}
              </p>
            )}
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Delivery Address
              </p>
              <div className="text-sm text-gray-700 space-y-0.5">
                {order.address.name && <p className="font-semibold">{order.address.name}</p>}
                {order.address.phone && <p className="text-gray-500">{order.address.phone}</p>}
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Items Ordered
            </p>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/products" className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}

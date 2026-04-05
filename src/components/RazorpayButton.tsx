"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
};

type Props = {
  items: Item[];
  total: number;
  customer: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  couponCode?: string;
  primaryColor: string;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  items,
  total,
  customer,
  address,
  couponCode,
  primaryColor,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePay() {
    setLoading(true);

    // 1. Create internal order first
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customer,
        address,
        paymentMethod: "online",
        couponCode,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      onError(orderData.error ?? "Failed to create order");
      return;
    }

    const internalOrderId = orderData.orderId;
    const finalTotal = orderData.total;

    // 2. Create Razorpay order
    const rzpRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(finalTotal * 100) }),
    });

    const rzpData = await rzpRes.json();

    if (!rzpRes.ok) {
      setLoading(false);
      onError(rzpData.error ?? "Payment setup failed");
      return;
    }

    // 3. Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setLoading(false);
      onError(
        "Failed to load payment gateway. Check your internet connection.",
      );
      return;
    }

    // 4. Open Razorpay checkout
    const rzp = new window.Razorpay({
      key: rzpData.keyId,
      amount: rzpData.amount,
      currency: rzpData.currency,
      order_id: rzpData.orderId,
      name: document.title,
      description: `Order #${internalOrderId.slice(-8).toUpperCase()}`,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      notes: {
        internal_order_id: internalOrderId,
      },
      theme: { color: primaryColor },
      handler: function () {
        // Payment captured — webhook updates DB async
        setLoading(false);
        onSuccess(internalOrderId);
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    });

    rzp.open();
    setLoading(false);
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ backgroundColor: primaryColor }}
    >
      {loading
        ? "Setting up payment..."
        : `Pay ₹${total.toLocaleString("en-IN")} Online`}
    </button>
  );
}

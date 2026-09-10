"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type PayNowButtonProps = {
  bookingId: string;
  totalAmount: number;
  vehicleBrand?: string;
  vehicleModel?: string;
  userName?: string;
  userEmail?: string;
};

export default function PayNowButton({
  bookingId,
  totalAmount,
  vehicleBrand = "Vehicle",
  vehicleModel = "Rental",
  userName,
  userEmail,
}: PayNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayNow = async () => {
    setLoading(true);
    setError("");

    try {
      /* 1. Create fresh Razorpay Order for this pending booking */
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData?.error || "Failed to create payment order.");
      }

      /* 2. Load Razorpay SDK Script */
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      /* 3. Open Razorpay Standard Checkout */
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Prime Rides",
        description: `Self-Drive Rental — ${vehicleBrand} ${vehicleModel}`,
        order_id: orderData.orderId,
        prefill: {
          name: userName || "Customer",
          email: userEmail || "customer@primerides.com",
          contact: "9999999999",
        },
        notes: {
          bookingId,
        },
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoading(true);

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData?.error || "Payment verification failed.");
            }

            router.push(`/dashboard?booking=${bookingId}&payment=success`);
            router.refresh();
          } catch (verifyErr) {
            console.error("Verification Error:", verifyErr);
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Something went wrong while verifying payment."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: "#0A1128",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Pay Now Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate payment. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handlePayNow}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-5 text-xs font-black text-white shadow-md shadow-blue-600/20 transition-all hover:brightness-110 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>Pay Now (₹{totalAmount.toLocaleString("en-IN")})</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-[11px] font-semibold text-rose-600 max-w-xs text-right">
          {error}
        </p>
      )}
    </div>
  );
}

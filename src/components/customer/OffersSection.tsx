"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PublicCouponItem = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minBookingValue?: number | null;
  maxDiscount?: number | null;
};

const fallbackOffers: PublicCouponItem[] = [
  {
    id: "fb-1",
    code: "WEEKEND15",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minBookingValue: null,
    maxDiscount: null,
  },
  {
    id: "fb-2",
    code: "FIRST500",
    discountType: "FIXED",
    discountValue: 500,
    minBookingValue: null,
    maxDiscount: null,
  },
  {
    id: "fb-3",
    code: "MONTHLY10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minBookingValue: null,
    maxDiscount: null,
  },
];

export default function OffersSection({
  coupons,
}: {
  coupons?: PublicCouponItem[];
}) {
  const displayCoupons = coupons && coupons.length > 0 ? coupons : fallbackOffers;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  const getCouponTitle = (offer: PublicCouponItem) => {
    const upperCode = offer.code.toUpperCase();
    if (upperCode.includes("WEEKEND")) return "Weekend Getaway";
    if (upperCode.includes("FIRST") || upperCode.includes("NEW")) return "First Booking";
    if (upperCode.includes("MONTH")) return "Monthly Rental";
    if (upperCode.includes("SUMMER")) return "Summer Special";
    if (upperCode.includes("FESTIVE")) return "Festive Offer";
    return `${offer.code} Offer`;
  };

  const getCouponDescription = (offer: PublicCouponItem) => {
    const isPercent = offer.discountType === "PERCENTAGE";
    const discountText = isPercent ? `${offer.discountValue}%` : `₹${offer.discountValue.toLocaleString("en-IN")}`;

    if (offer.minBookingValue) {
      return `Get ${discountText} off on your self-drive rental bookings above ₹${offer.minBookingValue.toLocaleString("en-IN")}.`;
    }
    return `Save ${discountText} instantly on your next Prime Rides self-drive car booking.`;
  };

  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Special Offers
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#0A1128]">
            Deals & Coupons
          </h2>

          <p className="mx-auto max-w-2xl text-sm text-slate-500 font-medium">
            Save more on your next ride with our latest rental offers and discount codes.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCoupons.map((offer) => {
            const isCopied = copiedCode === offer.code;
            const discountBadge =
              offer.discountType === "PERCENTAGE"
                ? `${offer.discountValue}% OFF`
                : `₹${offer.discountValue.toLocaleString("en-IN")} OFF`;

            return (
              <div
                key={offer.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Tag className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-[#0A1128] px-3.5 py-1 text-xs font-black uppercase text-white shadow-sm">
                      {discountBadge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-xl font-black text-slate-900 tracking-tight">
                    {getCouponTitle(offer)}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed font-medium text-slate-500">
                    {getCouponDescription(offer)}
                  </p>
                </div>

                {/* Coupon Code & Actions */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Coupon Code
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-black text-slate-900 tracking-widest">
                        {offer.code}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyCoupon(offer.code)}
                      className={`gap-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCopied
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <Link href="/cars" className="block">
                    <Button className="w-full h-11 rounded-xl bg-[#0A1128] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-colors">
                      Use This Offer
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
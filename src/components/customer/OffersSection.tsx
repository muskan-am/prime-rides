"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PublicCouponItem = {
  id: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minBookingValue?: number | null;
  maxDiscount?: number | null;
};

export default function OffersSection({
  coupons = [],
}: {
  coupons?: PublicCouponItem[];
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleCards, setVisibleCards] = useState<number>(4);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCards(4);
      } else if (width >= 640) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const maxIndex = Math.max(0, coupons.length - visibleCards);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < maxIndex) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const getCouponTitle = (offer: PublicCouponItem) => {
    if (offer.title?.trim()) {
      return offer.title.trim();
    }

    const isPercent = offer.discountType === "PERCENTAGE";
    const discountText = isPercent
      ? `${offer.discountValue}% OFF`
      : `₹${offer.discountValue.toLocaleString("en-IN")} OFF`;
    const upperCode = offer.code.toUpperCase();

    if (upperCode.includes("WEEKEND")) return "Weekend Getaway";
    if (upperCode.includes("FIRST") || upperCode.includes("NEW")) return "First Booking";
    if (upperCode.includes("MONTH")) return "Monthly Rental";
    if (upperCode.includes("SUMMER")) return "Summer Special";
    if (upperCode.includes("FESTIVE")) return "Festive Offer";
    return `${discountText} Offer`;
  };

  const getCouponDescription = (offer: PublicCouponItem) => {
    if (offer.description?.trim()) {
      return offer.description.trim();
    }

    const isPercent = offer.discountType === "PERCENTAGE";
    const discountText = isPercent
      ? `${offer.discountValue}%`
      : `₹${offer.discountValue.toLocaleString("en-IN")}`;

    if (offer.minBookingValue) {
      return `Get ${discountText} off on your self-drive rental bookings above ₹${offer.minBookingValue.toLocaleString("en-IN")}.`;
    }
    return `Save ${discountText} instantly on your next Prime Rides self-drive car booking.`;
  };

  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:px-8 bg-white overflow-hidden">
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

        {/* Offers Carousel or Empty State */}
        {coupons.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Tag className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-slate-800">No active offers available right now.</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon for upcoming promotional deals and discounts.</p>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {/* Carousel Container with Flanking Arrows */}
            <div className="flex items-center gap-2 sm:gap-4 relative">
              {/* Left Navigation Arrow */}
              {maxIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous offers"
                  className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0A1128] shadow-md transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}

              {/* Viewport & Sliding Track */}
              <div
                className="flex-1 overflow-hidden py-3"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div
                  className="flex gap-6 transition-transform duration-400 ease-out"
                  style={{
                    transform: `translateX(calc(-${currentIndex} * (100% + 24px) / ${visibleCards}))`,
                  }}
                >
                  {coupons.map((offer) => {
                    const isCopied = copiedCode === offer.code;
                    const discountBadge =
                      offer.discountType === "PERCENTAGE"
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue.toLocaleString("en-IN")} OFF`;

                    return (
                      <div
                        key={offer.id}
                        className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)] shrink-0 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200"
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

                          <Link href={`/cars?coupon=${encodeURIComponent(offer.code)}`} className="block">
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

              {/* Right Navigation Arrow */}
              {maxIndex > 0 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  aria-label="Next offers"
                  className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0A1128] shadow-md transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>

            {/* Pagination Dots */}
            {maxIndex > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to offer slide ${idx + 1}`}
                    className={`h-2.5 transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      currentIndex === idx
                        ? "w-7 bg-blue-600"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
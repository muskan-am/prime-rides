"use client";

import Link from "next/link";

export type CouponTickerItem = {
  id: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validUntil: string | Date;
};

type CouponTickerProps = {
  coupons?: CouponTickerItem[];
};

function formatDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function CouponTicker({ coupons = [] }: CouponTickerProps) {
  if (!coupons || coupons.length === 0) {
    return null; // Empty state: Do not render promotional bar at all
  }

  // Format offers list
  const formattedOffers = coupons.map((c) => {
    const isPercent = c.discountType === "PERCENTAGE";
    const titleText = isPercent
      ? `Get ${c.discountValue}% OFF`
      : `Save ₹${c.discountValue.toLocaleString("en-IN")}`;
    const icon = isPercent ? "🎉" : "🎁";
    const dateStr = formatDate(c.validUntil);

    return {
      id: c.id,
      code: c.code,
      icon,
      titleText,
      dateStr,
    };
  });

  // If there are few coupons, duplicate enough times to make a rich scrolling track
  const renderOffersTrack = (keyPrefix: string) => (
    <div className="inline-flex items-center shrink-0">
      {formattedOffers.map((offer, idx) => (
        <div key={`${keyPrefix}-${offer.id}-${idx}`} className="inline-flex items-center">
          <Link
            href={`/cars?coupon=${encodeURIComponent(offer.code)}`}
            className="group inline-flex items-center gap-2 px-4 py-1 text-xs sm:text-sm font-medium transition-colors hover:text-blue-300 cursor-pointer"
          >
            <span>{offer.icon}</span>
            <span className="font-bold text-slate-100 group-hover:text-white transition-colors">
              {offer.titleText}
            </span>
            <span className="text-slate-500 font-light">|</span>
            <span className="text-slate-300">Use Code</span>
            <span className="inline-block font-mono font-black uppercase text-blue-400 bg-blue-600/25 border border-blue-500/35 px-2 py-0.5 rounded text-[11px] sm:text-xs tracking-wider group-hover:border-blue-400 group-hover:bg-blue-600/40 transition-colors">
              {offer.code}
            </span>
            {offer.dateStr && (
              <>
                <span className="text-slate-500 font-light">|</span>
                <span className="text-slate-400 text-xs font-normal">
                  Valid till {offer.dateStr}
                </span>
              </>
            )}
          </Link>

          {/* Separator Accent */}
          <span className="px-5 text-blue-400/50 text-sm font-normal">✦</span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      role="region"
      aria-label="Promotional Offers and Coupons Ticker"
      className="relative z-40 w-full overflow-hidden bg-[#0A1128] border-b border-slate-800/80 text-white select-none h-10 sm:h-11 flex items-center shadow-inner"
    >
      {/* Subtle Side Fade Overlay for Smooth Visual Flow */}
      <div className="absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-[#0A1128] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-[#0A1128] to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {renderOffersTrack("t1")}
          {renderOffersTrack("t2")}
          {renderOffersTrack("t3")}
          {renderOffersTrack("t4")}
        </div>
      </div>
    </div>
  );
}

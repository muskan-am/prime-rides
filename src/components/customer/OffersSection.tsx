"use client";

import { Copy, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const offers = [
  {
    id: 1,
    title: "Weekend Getaway",
    description: "Get 15% off on your next self-drive weekend trip.",
    code: "WEEKEND15",
    discount: "15% OFF",
  },
  {
    id: 2,
    title: "First Booking",
    description: "New to Prime Rides? Get ₹500 off your first booking.",
    code: "FIRST500",
    discount: "₹500 OFF",
  },
  {
    id: 3,
    title: "Monthly Rental",
    description: "Save more when you choose a monthly rental plan.",
    code: "MONTHLY10",
    discount: "10% OFF",
  },
];

export default function OffersSection() {
  const copyCoupon = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Special Offers
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Deals & Coupons
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Save more on your next ride with our latest rental offers.
          </p>
        </div>

        {/* Offers */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Discount Badge */}
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <Tag className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  {offer.discount}
                </span>
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-semibold">
                {offer.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {offer.description}
              </p>

              {/* Coupon */}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-dashed p-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Coupon Code
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold">
                    {offer.code}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyCoupon(offer.code)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              {/* CTA */}
              <Button className="mt-5 w-full">
                Use This Offer
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
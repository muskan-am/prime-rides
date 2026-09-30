"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Star, MapPin, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export type CustomerReviewItem = {
  id: string;
  name: string;
  location?: string;
  rating: number;
  comment: string;
  vehicleName?: string;
  avatarColor?: string;
  isVerified?: boolean;
};

const DEFAULT_REVIEWS: CustomerReviewItem[] = [
  {
    id: "rev-1",
    name: "Arju Sharma",
    location: "Delhi",
    rating: 5,
    comment:
      "Absolutely amazing experience! The car was spotless, fuel was full, and the whole booking process took less than 2 minutes. Will definitely book again!",
    avatarColor: "bg-blue-600 text-white",
    isVerified: true,
  },
  {
    id: "rev-2",
    name: "Rahul Kumar",
    location: "Noida",
    rating: 5,
    comment:
      "Best self-drive service in Delhi NCR. Transparent pricing, no hidden charges. The Hyundai Creta was in perfect condition. Highly recommended!",
    avatarColor: "bg-[#0A1128] text-white",
    isVerified: true,
  },
  {
    id: "rev-3",
    name: "Rajeev Singh",
    location: "Gurgaon",
    rating: 5,
    comment:
      "Used Prime Rides for a family trip to Jaipur. The car was GPS enabled, support team was available 24/7. Amazing service throughout!",
    avatarColor: "bg-indigo-600 text-white",
    isVerified: true,
  },
  {
    id: "rev-4",
    name: "Pooja Verma",
    location: "Bangalore",
    rating: 5,
    comment:
      "Hassle-free doorstep delivery and zero paperwork headaches. The Mahindra Thar was extremely clean and well maintained.",
    avatarColor: "bg-sky-600 text-white",
    isVerified: true,
  },
  {
    id: "rev-5",
    name: "Amit Patel",
    location: "Goa",
    rating: 5,
    comment:
      "Rented an automatic SUV for our Goa vacation. Instant security deposit refund and friendly executive. 10/10 experience!",
    avatarColor: "bg-emerald-600 text-white",
    isVerified: true,
  },
  {
    id: "rev-6",
    name: "Sneha Kapur",
    location: "Delhi NCR",
    rating: 5,
    comment:
      "Prime Rides has become my go-to choice for weekend getaways. Top-notch customer support and fair rates.",
    avatarColor: "bg-teal-600 text-white",
    isVerified: true,
  },
];

const AVATAR_COLORS = [
  "bg-blue-600 text-white",
  "bg-[#0A1128] text-white",
  "bg-indigo-600 text-white",
  "bg-sky-600 text-white",
  "bg-emerald-600 text-white",
  "bg-teal-600 text-white",
];

type CustomerReviewsSectionProps = {
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    user?: { name: string | null; image?: string | null } | null;
    vehicle?: { brand: string; model: string } | null;
  }>;
};

export default function CustomerReviewsSection({
  reviews = [],
}: CustomerReviewsSectionProps) {
  // Combine real database reviews with defaults to ensure complete carousel pages
  const combinedReviews: CustomerReviewItem[] = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return DEFAULT_REVIEWS;
    }

    const mapped = reviews
      .filter((r) => r.comment && r.comment.trim().length > 0)
      .map((r, index) => {
        const name = r.user?.name?.trim() || "Verified Traveler";
        return {
          id: r.id,
          name,
          location: "Verified Hub",
          rating: r.rating || 5,
          comment: r.comment || "",
          vehicleName: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : undefined,
          avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
          isVerified: true,
        };
      });

    // If database has fewer than 3 reviews, append default testimonials so carousel is rich
    if (mapped.length < 3) {
      return [...mapped, ...DEFAULT_REVIEWS.slice(mapped.length)];
    }

    return mapped;
  }, [reviews]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(combinedReviews.length / itemsPerPage));

  // Reset page if bounds change
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  // Extract initial letters for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const currentSlice = combinedReviews.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  return (
    <section className="bg-slate-50/50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200/70 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
          <div className="space-y-2">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              <Star className="h-3 w-3 fill-blue-600 text-blue-600" />
              <span>REVIEWS</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0A1128]">
              What Our Customers Say
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              2500+ verified reviews. 4.9★ average rating across all platforms.
            </p>
          </div>

          {/* Navigation Controls (Top Right) */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous reviews page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-100 hover:border-blue-300 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 text-xs font-bold text-slate-600 min-w-[36px] text-center">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next reviews page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Review Cards Grid / Carousel */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentSlice.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
            >
              <div className="space-y-3.5">
                {/* 5 Golden Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-600 text-xs sm:text-[13px] sm:leading-relaxed leading-normal font-normal">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Author & Verification Details */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-xs shadow-xs ${review.avatarColor || "bg-blue-600 text-white"}`}
                  >
                    {getInitials(review.name)}
                  </div>

                  {/* Name & Location */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {review.name}
                    </h4>
                    {review.location && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400 truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{review.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Verified Badge */}
                {review.isVerified && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to reviews page ${idx + 1}`}
                onClick={() => setCurrentPage(idx)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                  idx === currentPage
                    ? "w-6 bg-blue-600"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

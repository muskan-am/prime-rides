"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CAR_FALLBACK_GALLERIES: Record<string, string[]> = {
  creta: [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  ],
  bmw: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=900&q=80",
  ],
  fortuner: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
  ],
  thar: [
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  ],
};

function getEnhancedGallery(
  primaryImage: string,
  images?: string[],
  brand?: string,
  model?: string
): string[] {
  let list: string[] = [];

  if (images && images.length > 0) {
    list = images.filter(Boolean);
  } else if (primaryImage) {
    list = [primaryImage];
  }

  // If list has only 1 image, add complementary high-quality photos for auto slideshow
  if (list.length <= 1) {
    const searchKey = `${brand || ""} ${model || ""}`.toLowerCase();
    let fallbacks = CAR_FALLBACK_GALLERIES.default;

    if (searchKey.includes("creta") || searchKey.includes("hyundai")) {
      fallbacks = CAR_FALLBACK_GALLERIES.creta;
    } else if (searchKey.includes("bmw") || searchKey.includes("3 series")) {
      fallbacks = CAR_FALLBACK_GALLERIES.bmw;
    } else if (searchKey.includes("fortuner") || searchKey.includes("toyota")) {
      fallbacks = CAR_FALLBACK_GALLERIES.fortuner;
    } else if (searchKey.includes("thar") || searchKey.includes("mahindra")) {
      fallbacks = CAR_FALLBACK_GALLERIES.thar;
    }

    const combined = [
      ...list,
      ...fallbacks.filter((item) => !list.includes(item)),
    ];
    list = combined;
  }

  return list;
}

type CarImageSliderProps = {
  primaryImage: string;
  images?: string[];
  alt: string;
  brand?: string;
  model?: string;
  autoPlayInterval?: number;
};

export default function CarImageSlider({
  primaryImage,
  images,
  alt,
  brand,
  model,
  autoPlayInterval = 3000,
}: CarImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const gallery = getEnhancedGallery(primaryImage, images, brand, model);

  useEffect(() => {
    if (gallery.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gallery.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [gallery.length, isHovered, autoPlayInterval]);

  if (gallery.length === 0) {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
        No Image Available
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Auto-Rotating Image Track with Smooth Fade Transition */}
      {gallery.map((imgSrc, idx) => (
        <img
          key={`${imgSrc}-${idx}`}
          src={imgSrc}
          alt={`${alt} - view ${idx + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
            idx === currentIndex
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0 scale-95 pointer-events-none"
          }`}
        />
      ))}

      {/* Navigation Arrows on Hover */}
      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Car Image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-md opacity-0 transition-all duration-200 group-hover/slider:opacity-100 hover:bg-blue-600 focus:outline-none shadow-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Car Image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-md opacity-0 transition-all duration-200 group-hover/slider:opacity-100 hover:bg-blue-600 focus:outline-none shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10">
            {gallery.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-4 bg-blue-400 shadow-sm shadow-blue-400/50"
                    : "w-1.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

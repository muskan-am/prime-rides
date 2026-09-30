"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarImageSliderProps = {
  primaryImage: string;
  images?: string[];
  alt: string;
  brand?: string;
  model?: string;
  autoPlay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
};

export default function CarImageSlider({
  primaryImage,
  images,
  alt,
  brand,
  model,
  autoPlay = true,
  interval = 3200,
  pauseOnHover = true,
}: CarImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Deduplicate and filter gallery images
  const rawList = [
    primaryImage,
    ...(images && Array.isArray(images) ? images : []),
  ].filter((img): img is string => typeof img === "string" && img.trim().length > 0);

  const gallery = Array.from(new Set(rawList));
  if (gallery.length === 0) {
    gallery.push("/car-hero.png");
  }

  // Automatic continuous image scrolling / slideshow
  useEffect(() => {
    if (gallery.length <= 1 || !autoPlay) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, interval);

    return () => clearInterval(timer);
  }, [gallery.length, autoPlay, pauseOnHover, isHovered, interval]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % gallery.length);
      } else {
        // swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
    touchStartX.current = null;
  };

  if (gallery.length === 0) {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
        No Image Available
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden group/slider bg-slate-900 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Smooth Image Crossfade Display */}
      {gallery.map((imgSrc, idx) => (
        <img
          key={`${imgSrc}-${idx}`}
          src={imgSrc}
          alt={`${alt || brand || model || "Car"} - photo ${idx + 1}`}
          loading={idx === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
            idx === currentIndex
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0 scale-105 pointer-events-none"
          }`}
        />
      ))}

      {/* Navigation Arrows on Card Hover */}
      {gallery.length > 1 && (
        <div className="opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-blue-600 hover:scale-110 active:scale-95 focus:outline-none shadow-md cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-blue-600 hover:scale-110 active:scale-95 focus:outline-none shadow-md cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

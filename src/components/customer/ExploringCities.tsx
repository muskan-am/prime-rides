"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ExploringCityItem = {
  id: string;
  name: string;
  subtitle?: string | null;
  image: string;
  locationQuery?: string | null;
};

type ExploringCitiesProps = {
  cities?: ExploringCityItem[];
};

const defaultCities: ExploringCityItem[] = [
  {
    id: "c1",
    name: "Chennai",
    subtitle: "Explore coastal heritage & temples",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Chennai",
  },
  {
    id: "c2",
    name: "Delhi",
    subtitle: "Drive through capital avenues & heritage",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Delhi",
  },
  {
    id: "c3",
    name: "Goa",
    subtitle: "Sun, sand & endless coastal drives",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Goa",
  },
  {
    id: "c4",
    name: "Hyderabad",
    subtitle: "Discover historic monuments & tech hubs",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Hyderabad",
  },
  {
    id: "c5",
    name: "Mumbai",
    subtitle: "Experience the bustling coastal metropolis",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Mumbai",
  },
  {
    id: "c6",
    name: "Vizag",
    subtitle: "Explore scenic coastal roads & beaches",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Vizag",
  },
  {
    id: "c7",
    name: "Pune",
    subtitle: "Gateway to the majestic Western Ghats",
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Pune",
  },
  {
    id: "c8",
    name: "Bangalore",
    subtitle: "Garden city & Silicon Valley getaway",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
    locationQuery: "Bangalore",
  },
];

export default function ExploringCities({ cities }: ExploringCitiesProps) {
  const displayCities = cities && cities.length > 0 ? cities : defaultCities;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-[#F8F9FA] py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl">

        {/* Section Header matching benchmark screenshot */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            DISCOVER
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            Cities to Explore in India
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium pt-1">
            Choose a city and find the best self-drive cars near you
          </p>
        </div>

        {/* Horizontal Slider Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 px-2 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayCities.map((city) => (
            <Link
              key={city.id}
              href={`/cars?location=${encodeURIComponent(
                city.locationQuery || city.name
              )}`}
              className="group relative h-[360px] sm:h-[390px] w-[240px] sm:w-[270px] shrink-0 overflow-hidden rounded-2xl bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image */}
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* City Title */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  {city.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Arrows matching benchmark screenshot */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => scroll("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/90 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/90 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

      </div>
    </section>
  );
}

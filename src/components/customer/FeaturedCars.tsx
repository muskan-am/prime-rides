"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, ArrowRight, Wind, Star } from "lucide-react";
import CarImageSlider from "@/components/customer/CarImageSlider";
import FavoriteButton from "@/components/customer/FavoriteButton";

export type FeaturedVehicleItem = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  type: string;
  vehicleType?: string | null;
  fuel: string;
  transmission: string;
  seats: number;
  hasAirConditioning?: boolean;
  price: number;
  deposit?: number;
  location?: string;
  image: string;
  images?: string[];
  badge: string;
  rating?: number | null;
  reviewCount?: number;
  modelYear?: number;
};

type FeaturedCarsProps = {
  vehicles?: FeaturedVehicleItem[];
};

const CATEGORIES = ["All", "SUV", "Sedan", "Hatchback", "Luxury"];

export default function FeaturedCars({ vehicles = [] }: FeaturedCarsProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredVehicles = useMemo(() => {
    if (selectedCategory === "All") return vehicles;
    const catLower = selectedCategory.toLowerCase();
    return vehicles.filter((v) => {
      const typeStr = (v.vehicleType || v.type || "").toLowerCase();
      const modelStr = (v.model || "").toLowerCase();
      const brandStr = (v.brand || "").toLowerCase();
      return (
        typeStr.includes(catLower) ||
        modelStr.includes(catLower) ||
        brandStr.includes(catLower)
      );
    });
  }, [vehicles, selectedCategory]);

  const MAX_DISPLAY_CARS = 6;
  const displayedCars = filteredVehicles.slice(0, MAX_DISPLAY_CARS);
  const hasMoreCars =
    filteredVehicles.length > MAX_DISPLAY_CARS || vehicles.length > MAX_DISPLAY_CARS;

  return (
    <section className="bg-slate-50/60 px-4 py-12 sm:py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
              <span>EXPLORE OUR FLEET</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0A1128]">
              Handpicked Premium Vehicles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Explore sanitized, insured self-drive cars ready for your journey across our hubs.
            </p>
          </div>

          <Link
            href="/cars"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0A1128] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg shrink-0"
          >
            <span>View Complete Fleet ({vehicles.length})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? vehicles.length
                : vehicles.filter((v) => {
                    const str = `${v.vehicleType || ""} ${v.type || ""} ${v.model || ""} ${v.brand || ""}`.toLowerCase();
                    return str.includes(cat.toLowerCase());
                  }).length;

            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? "bg-[#0A1128] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fleet Grid */}
        {displayedCars.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center">
            <p className="text-base font-bold text-slate-700">
              No vehicles available in {selectedCategory} category
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check our complete catalog with live availability and filters.
            </p>
            <Link
              href="/cars"
              className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              Browse Complete Catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCars.map((car) => (
                <article
                  key={car.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 flex flex-col justify-between"
                >
                  <div className="flex flex-col h-full">
                    {/* Compact Image Container - ONLY IMAGE & FAVORITE BUTTON */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                      <CarImageSlider
                        primaryImage={car.image}
                        images={car.images}
                        alt={`${car.brand} ${car.model}`}
                        brand={car.brand}
                        model={car.model}
                      />

                      {/* Favorite / Heart Button Floating Top-Right */}
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <FavoriteButton
                          vehicleId={car.id}
                          vehicleName={`${car.brand} ${car.model}`}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Compact Specs & Info Below Image */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        {/* Vehicle Name, Variant on Left and Rating/Review on Right */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                              {car.brand} {car.model}
                            </h3>
                            {car.variant && (
                              <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                                {car.variant}
                              </p>
                            )}
                          </div>

                          {/* Rating/Review Summary on Right */}
                          <div className="shrink-0 text-right">
                            {car.reviewCount !== undefined && car.reviewCount > 0 && car.rating ? (
                              <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>
                                  {car.rating.toFixed(1)} ({car.reviewCount})
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400">
                                No reviews yet
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4. Compact Specifications: Fuel, Transmission, Seats, AC */}
                        <div className="grid grid-cols-4 gap-1.5 text-center pt-1.5">
                          <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                            <Fuel className="mx-auto h-3.5 w-3.5 text-emerald-600 mb-0.5" />
                            <span className="text-[10px] font-bold block truncate">
                              {car.fuel}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                            <Gauge className="mx-auto h-3.5 w-3.5 text-blue-600 mb-0.5" />
                            <span className="text-[10px] font-bold block truncate">
                              {car.transmission}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                            <Users className="mx-auto h-3.5 w-3.5 text-indigo-600 mb-0.5" />
                            <span className="text-[10px] font-bold block truncate">
                              {car.seats} Seats
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                            <Wind className="mx-auto h-3.5 w-3.5 text-cyan-600 mb-0.5" />
                            <span className="text-[10px] font-bold block truncate">
                              {car.hasAirConditioning !== false ? "AC" : "Non-AC"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Daily Rental Price, 6. Security Deposit & 7. View Details CTA */}
                      <div className="pt-2.5 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg sm:text-xl font-black text-slate-900">
                                ₹{car.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                /day
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 block">
                              {car.deposit !== undefined && car.deposit > 0
                                ? `Deposit: ₹${car.deposit.toLocaleString("en-IN")}`
                                : "₹0 Security Deposit"}
                            </span>
                          </div>

                          <Link
                            href={`/cars/${car.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-black/10 transition-all hover:scale-105 active:scale-95"
                          >
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* View All Button */}
            {hasMoreCars && (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#0A1128] hover:bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span>View All {vehicles.length} Vehicles in Fleet</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
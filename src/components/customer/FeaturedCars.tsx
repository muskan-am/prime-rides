"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, ArrowRight, Wind } from "lucide-react";

import CarImageSlider from "@/components/customer/CarImageSlider";

export type FeaturedVehicleItem = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  type: string;
  fuel: string;
  transmission: string;
  seats: number;
  hasAirConditioning?: boolean;
  price: number;
  image: string;
  images?: string[];
  badge: string;
};

type FeaturedCarsProps = {
  vehicles?: FeaturedVehicleItem[];
};

const categories = ["All", "SUV", "Sedan", "Hatchback", "Luxury", "Premium"];

export default function FeaturedCars({ vehicles = [] }: FeaturedCarsProps) {
  const MAX_DISPLAY_CARS = 6;
  const displayedCars = vehicles.slice(0, MAX_DISPLAY_CARS);
  const hasMoreCars = vehicles.length > MAX_DISPLAY_CARS;

  return (
    <section className="bg-slate-50/60 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              OUR FLEET
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1128]">
              Explore Our Fleet
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Handpicked self-drive vehicles, sanitized and insured for your journey.
            </p>
          </div>

          <Link
            href="/cars"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0A1128] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg shrink-0"
          >
            <span>View Complete Fleet</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        {vehicles.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-bold text-slate-700">No vehicles available</p>
            <Link
              href="/cars"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCars.map((car) => (
                <article
                  key={car.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-200"
                >
                  {/* Image Container with Auto Slider */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0A1128]">
                    <CarImageSlider
                      primaryImage={car.image}
                      images={car.images}
                      alt={`${car.brand} ${car.model}`}
                      brand={car.brand}
                      model={car.model}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent pointer-events-none z-20" />

                    <div className="absolute bottom-4 left-4 right-4 text-white z-20 pointer-events-none">
                      <p className="text-xs font-medium text-slate-300 uppercase tracking-widest">
                        {car.brand}
                      </p>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        {car.model}
                      </h3>
                    </div>
                  </div>

                  {/* Specs & Pricing */}
                  <div className="p-6">
                    <p className="text-xs font-semibold text-slate-500 mb-4">
                      {car.variant || car.brand}
                    </p>

                    {/* Specs Pill Matrix */}
                    <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-50 p-2.5 text-center border border-slate-100 mb-6">
                      <div className="flex flex-col items-center gap-1">
                        <Fuel className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {car.fuel}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 border-l border-slate-200">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {car.transmission}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 border-l border-slate-200">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {car.seats} Seats
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 border-l border-slate-200">
                        <Wind className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {car.hasAirConditioning !== false ? "AC" : "Non-AC"}
                        </span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-2xl font-black text-slate-900">
                          ₹{car.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {" "}
                          / day
                        </span>
                      </div>

                      <Link
                        href={`/cars/${car.id}`}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* View All Button */}
            {hasMoreCars && (
              <div className="mt-12 flex justify-center">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A1128] via-blue-900 to-blue-600 px-8 py-4 text-base font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25 active:scale-95"
                >
                  <span>View All Vehicles ({vehicles.length > 0 ? `${vehicles.length}` : "All"} Vehicles)</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
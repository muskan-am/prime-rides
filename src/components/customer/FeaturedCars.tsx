"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, ArrowRight } from "lucide-react";

export type FeaturedVehicleItem = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  type: string;
  fuel: string;
  transmission: string;
  seats: number;
  price: number;
  image: string;
  badge: string;
};

type FeaturedCarsProps = {
  vehicles?: FeaturedVehicleItem[];
};

const categories = ["All", "SUV", "Sedan", "Hatchback", "Luxury", "Premium"];

export default function FeaturedCars({ vehicles = [] }: FeaturedCarsProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCars =
    activeCategory === "All"
      ? vehicles
      : vehicles.filter(
          (c) =>
            c.type.toLowerCase() === activeCategory.toLowerCase() ||
            c.variant.toLowerCase().includes(activeCategory.toLowerCase())
        );

  return (
    <section className="bg-slate-50/60 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Explore Our Fleet
            </h2>

            <p className="max-w-2xl text-base text-slate-600">
              From compact city hatchbacks to executive sedans and rugged 4x4 SUVs — all sanitized, insured, and ready for your adventure.
            </p>
          </div>

          <Link
            href="/cars"
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
          >
            <span>View Complete Fleet</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Filters */}
        {vehicles.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-slate-950 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredCars.length === 0 ? (
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
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <article
                key={car.id}
                className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-200"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {car.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
                        {car.badge}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-medium text-slate-300 uppercase tracking-widest">
                        {car.brand}
                      </p>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        {car.model}
                      </h3>
                    </div>

                    <span className="rounded-xl bg-blue-600/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold tracking-wide uppercase">
                      {car.type}
                    </span>
                  </div>
                </div>

                {/* Specs & Pricing */}
                <div className="p-6">
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    {car.variant || car.brand}
                  </p>

                  {/* Specs Pill Matrix */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center border border-slate-100 mb-6">
                    <div className="flex flex-col items-center gap-1">
                      <Fuel className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">
                        {car.fuel}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 border-x border-slate-200">
                      <Gauge className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">
                        {car.transmission}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">
                        {car.seats} Seats
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
        )}
      </div>
    </section>
  );
}
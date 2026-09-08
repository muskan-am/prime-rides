"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, ArrowRight, Shield, Zap } from "lucide-react";

const categories = ["All", "Economy", "Sedan", "SUV", "Luxury", "Premium"];

const featuredCars = [
  {
    id: "1",
    brand: "Hyundai",
    model: "Creta",
    variant: "SX Automatic",
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    badge: "Popular"
  },
  {
    id: "2",
    brand: "Kia",
    model: "Seltos",
    variant: "HTX Turbo",
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80",
    badge: "Top Rated"
  },
  {
    id: "3",
    brand: "Mahindra",
    model: "Thar 4x4",
    variant: "LX Hard Top",
    type: "Premium",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
    badge: "Adventure"
  },
  {
    id: "4",
    brand: "BMW",
    model: "3 Series",
    variant: "320i M Sport",
    type: "Luxury",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 6999,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    badge: "Luxury"
  },
  {
    id: "5",
    brand: "Honda",
    model: "City",
    variant: "ZX i-VTEC",
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2199,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    badge: "Comfort"
  },
  {
    id: "6",
    brand: "Maruti",
    model: "Swift",
    variant: "ZXi+",
    type: "Economy",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    price: 1499,
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
    badge: "Budget"
  }
];

export default function FeaturedCars() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCars = activeCategory === "All" 
    ? featuredCars 
    : featuredCars.filter(c => c.type === activeCategory);

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

        {/* Grid */}
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

                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
                    {car.badge}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <p className="text-xs font-medium text-slate-300 uppercase tracking-widest">{car.brand}</p>
                    <h3 className="text-xl font-bold tracking-tight text-white">{car.model}</h3>
                  </div>
                  
                  <span className="rounded-xl bg-blue-600/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold tracking-wide uppercase">
                    {car.type}
                  </span>
                </div>
              </div>

              {/* Specs & Pricing */}
              <div className="p-6">

                <p className="text-xs font-semibold text-slate-500 mb-4">{car.variant}</p>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center border border-slate-100 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Fuel className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">{car.fuel}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 border-x border-slate-200">
                    <Gauge className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">{car.transmission}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">{car.seats} Seats</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-2xl font-black text-slate-900">₹{car.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs font-semibold text-slate-500"> / day</span>
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

      </div>
    </section>
  );
}
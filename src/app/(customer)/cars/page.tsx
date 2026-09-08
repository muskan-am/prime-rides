"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, MapPin, Sparkles, Filter, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

const cars = [
  {
    id: "hyundai-creta",
    brand: "Hyundai",
    name: "Creta SX",
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    location: "Delhi",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80",
    badge: "Popular"
  },
  {
    id: "kia-seltos",
    brand: "Kia",
    name: "Seltos HTX",
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    location: "Goa",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=1000&q=80",
    badge: "Top Rated"
  },
  {
    id: "mahindra-thar",
    brand: "Mahindra",
    name: "Thar 4x4 LX",
    type: "Premium",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    location: "Bangalore",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80",
    badge: "Adventure"
  },
  {
    id: "bmw-3-series",
    brand: "BMW",
    name: "3 Series M Sport",
    type: "Luxury",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 6999,
    location: "Delhi",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80",
    badge: "Luxury"
  },
  {
    id: "honda-city",
    brand: "Honda",
    name: "City ZX",
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2199,
    location: "Bangalore",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
    badge: "Executive"
  },
  {
    id: "maruti-swift",
    brand: "Maruti",
    name: "Swift ZXi+",
    type: "Economy",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    price: 1499,
    location: "Goa",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80",
    badge: "Budget"
  }
];

export default function CarsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const filteredCars = cars.filter(car => {
    if (selectedLocation !== "All" && car.location.toLowerCase() !== selectedLocation.toLowerCase()) return false;
    if (selectedFuel !== "All" && car.fuel !== selectedFuel) return false;
    if (selectedTransmission !== "All" && car.transmission !== selectedTransmission) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === "low") return a.price - b.price;
    if (sortOption === "high") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pb-24">
        {/* Banner Header */}
        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">


            <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Self-Drive Fleet Catalog
                </h1>

                <p className="mt-3 max-w-2xl text-slate-400 text-base">
                  Choose from our verified fleet of SUVs, Sedans, Luxury, and Hatchbacks with transparent dynamic pricing and instant confirmation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-300">
                Showing <span className="text-blue-400 font-extrabold">{filteredCars.length}</span> verified vehicles
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="sticky top-20 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Filter className="h-4 w-4 text-blue-600" />
              <span>Filter Fleet:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Locations</option>
                <option value="delhi">Delhi NCR</option>
                <option value="goa">Goa Hub</option>
                <option value="bangalore">Bangalore Hub</option>
              </select>

              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
              </select>

              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Transmissions</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="default">Sort by Recommended</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>

          </div>
        </section>

        {/* Cars Grid */}
        <section className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {filteredCars.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center my-12">
                <p className="text-lg font-bold text-slate-700">No vehicles match your selected filters.</p>
                <button
                  onClick={() => { setSelectedLocation("All"); setSelectedFuel("All"); setSelectedTransmission("All"); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCars.map((car) => (
                  <article
                    key={car.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-300"
                  >
                    {/* Vehicle Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={car.image}
                        alt={car.name}
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
                          <h3 className="text-xl font-bold tracking-tight text-white">{car.name}</h3>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1 text-xs font-extrabold uppercase">
                          <MapPin className="h-3 w-3" /> {car.location}
                        </span>
                      </div>
                    </div>

                    {/* Content & Specs */}
                    <div className="p-6">

                      {/* Specification Matrix */}
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

                      {/* Availability badge */}
                      <div className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Ready for Instant Self-Drive Pickup</span>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <span className="text-2xl font-black text-slate-900">₹{car.price.toLocaleString("en-IN")}</span>
                          <span className="text-xs font-semibold text-slate-500"> / day</span>
                        </div>

                        <Link
                          href={`/cars/${car.id}`}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                        >
                          <span>Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
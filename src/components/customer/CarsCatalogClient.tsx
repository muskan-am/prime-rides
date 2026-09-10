"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, Users, MapPin, Filter, CheckCircle2, XCircle, ArrowRight, CalendarDays } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export type FormattedVehicle = {
  id: string;
  brand: string;
  name: string;
  model: string;
  variant: string;
  fuel: string;
  transmission: string;
  seats: number;
  price: number;
  deposit: number;
  location: string;
  locationIds: string[];
  locationNames: string[];
  isAvailable: boolean;
  image: string;
  badge: string;
  searchPriority: number;
};

export type FormattedLocation = {
  id: string;
  name: string;
};

type CarsCatalogClientProps = {
  initialVehicles: FormattedVehicle[];
  locations: FormattedLocation[];
  initialLocationQuery?: string;
  isDateFilterActive?: boolean;
  startDateText?: string;
  endDateText?: string;
};

export default function CarsCatalogClient({
  initialVehicles,
  locations,
  initialLocationQuery = "All",
  isDateFilterActive = false,
  startDateText,
  endDateText,
}: CarsCatalogClientProps) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocationQuery);
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  // Extract unique fuel types and transmissions present in DB vehicles
  const fuelOptions = Array.from(
    new Set(initialVehicles.map((v) => v.fuel).filter(Boolean))
  );

  const transmissionOptions = Array.from(
    new Set(initialVehicles.map((v) => v.transmission).filter(Boolean))
  );

  const filteredCars = initialVehicles
    .filter((car) => {
      // Location filter
      if (selectedLocation !== "All") {
        const selLocLower = selectedLocation.toLowerCase();
        const matchesLocation =
          car.locationNames.some((locName) =>
            locName.toLowerCase().includes(selLocLower) || selLocLower.includes(locName.toLowerCase())
          ) || car.location.toLowerCase().includes(selLocLower);
        if (!matchesLocation) return false;
      }

      // Fuel filter
      if (
        selectedFuel !== "All" &&
        car.fuel.toLowerCase() !== selectedFuel.toLowerCase()
      ) {
        return false;
      }

      // Transmission filter
      if (
        selectedTransmission !== "All" &&
        car.transmission.toLowerCase() !== selectedTransmission.toLowerCase()
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
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

                {isDateFilterActive && (startDateText || endDateText) && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-950/80 border border-blue-800/80 px-4 py-2 text-xs font-bold text-blue-300">
                    <CalendarDays className="h-4 w-4 text-blue-400" />
                    <span>
                      Filtered for requested dates:{" "}
                      <strong className="text-white">{startDateText}</strong> to{" "}
                      <strong className="text-white">{endDateText}</strong>
                    </span>
                  </div>
                )}
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
              {/* Location Selector */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>

              {/* Fuel Selector */}
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Fuel Types</option>
                {fuelOptions.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>

              {/* Transmission Selector */}
              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              >
                <option value="All">All Transmissions</option>
                {transmissionOptions.map((trans) => (
                  <option key={trans} value={trans}>
                    {trans}
                  </option>
                ))}
              </select>

              {/* Sort Selector */}
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
                <p className="text-lg font-bold text-slate-700">
                  {isDateFilterActive
                    ? "No vehicles available for your selected dates."
                    : "No vehicles available"}
                </p>
                <button
                  onClick={() => {
                    setSelectedLocation("All");
                    setSelectedFuel("All");
                    setSelectedTransmission("All");
                    setSortOption("default");
                  }}
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
                            {car.name}
                          </h3>
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

                      {/* Availability badge */}
                      {car.isAvailable ? (
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Ready for Instant Self-Drive Pickup</span>
                        </div>
                      ) : (
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-rose-500">
                          <XCircle className="h-4 w-4" />
                          <span>Currently Unavailable</span>
                        </div>
                      )}

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
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
                          className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-all ${
                            car.isAvailable
                              ? "bg-slate-950 hover:bg-blue-600 hover:shadow-lg"
                              : "bg-slate-700 hover:bg-slate-800"
                          }`}
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

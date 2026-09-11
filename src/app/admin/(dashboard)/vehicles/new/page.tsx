"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVehiclePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      brand: formData.get("brand"),
      model: formData.get("model"),
      variant: formData.get("variant"),
      registrationNumber: formData.get("registrationNumber"),
      fuelType: formData.get("fuelType"),
      transmission: formData.get("transmission"),
      seatingCapacity: formData.get("seatingCapacity"),
      hasAirConditioning: formData.get("hasAirConditioning") === "true",
      basePrice: formData.get("basePrice"),
      deposit: formData.get("deposit"),
      speedLimit: formData.get("speedLimit"),
      rentalTerms: formData.get("rentalTerms"),
      availabilityStatus: formData.get("availabilityStatus"),
      maintenanceStatus: formData.get("maintenanceStatus"),
      searchPriority: formData.get("searchPriority"),
      primaryImage: formData.get("primaryImage"),
    };

    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create vehicle");
        setLoading(false);
        return;
      }

      router.push("/admin/vehicles");
      router.refresh();
    } catch (error) {
      console.error("Create vehicle error:", error);

      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Add New Vehicle
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Register a new rental vehicle to your Prime Rides fleet.
          </p>
        </div>

        <Link
          href="/admin/vehicles"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
        >
          ← Back to Vehicles
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Basic Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Brand */}
              <div>
                <label htmlFor="brand" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Brand / Make *
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="e.g. Toyota"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium"
                />
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Model *
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="e.g. Fortuner"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium"
                />
              </div>

              {/* Variant */}
              <div>
                <label htmlFor="variant" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Variant / Trim
                </label>
                <input
                  id="variant"
                  name="variant"
                  type="text"
                  placeholder="e.g. 4x4 Legender"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium"
                />
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registration Plate Number
                </label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  placeholder="e.g. DL 01 AB 1234"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono uppercase placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* Vehicle Specifications */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Specifications & Features
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Fuel Type */}
              <div>
                <label htmlFor="fuelType" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  defaultValue="PETROL"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-semibold"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label htmlFor="transmission" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Transmission
                </label>
                <select
                  id="transmission"
                  name="transmission"
                  defaultValue="AUTOMATIC"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-semibold"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="AMT">AMT</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>

              {/* Seating Capacity */}
              <div>
                <label htmlFor="seatingCapacity" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Seating Capacity
                </label>
                <input
                  id="seatingCapacity"
                  name="seatingCapacity"
                  type="number"
                  min="1"
                  placeholder="5"
                  defaultValue="5"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-medium"
                />
              </div>

              {/* Speed Limit */}
              <div>
                <label htmlFor="speedLimit" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Speed Limit (km/h)
                </label>
                <input
                  id="speedLimit"
                  name="speedLimit"
                  type="number"
                  min="0"
                  placeholder="120"
                  defaultValue="120"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-medium"
                />
              </div>

              {/* Air Conditioning */}
              <div>
                <label htmlFor="hasAirConditioning" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Air Conditioning
                </label>
                <select
                  id="hasAirConditioning"
                  name="hasAirConditioning"
                  defaultValue="true"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-semibold"
                >
                  <option value="true">Air Conditioned (AC)</option>
                  <option value="false">Non-AC</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pricing Details */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Rental Pricing & Security Deposit
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Base Price */}
              <div>
                <label htmlFor="basePrice" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Daily Rental Rate (₹/day) *
                </label>
                <input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2500"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-bold"
                />
              </div>

              {/* Deposit */}
              <div>
                <label htmlFor="deposit" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  id="deposit"
                  name="deposit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  defaultValue="3000"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* Status & Priority */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Status & Visibility
            </h2>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="availabilityStatus" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Availability Status
                </label>
                <select
                  id="availabilityStatus"
                  name="availabilityStatus"
                  defaultValue="AVAILABLE"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div>
                <label htmlFor="maintenanceStatus" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Maintenance Status
                </label>
                <select
                  id="maintenanceStatus"
                  name="maintenanceStatus"
                  defaultValue="GOOD"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                >
                  <option value="GOOD">Good / Active</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label htmlFor="searchPriority" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Catalog Display Rank
                </label>
                <input
                  id="searchPriority"
                  name="searchPriority"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* Image & Terms */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Media & Terms
            </h2>

            <div>
              <label htmlFor="primaryImage" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Vehicle Image URL
              </label>
              <input
                id="primaryImage"
                name="primaryImage"
                type="url"
                placeholder="https://images.unsplash.com/photo-1549399542-7e3f8b79c341"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 text-sm font-medium"
              />
            </div>


          </section>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/admin/vehicles"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {loading ? "Registering Vehicle..." : "Save & Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
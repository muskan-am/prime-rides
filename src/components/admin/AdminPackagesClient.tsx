"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageType } from "@prisma/client";

type VehicleMin = {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  primaryImage?: string | null;
};

type PackageItem = {
  id: string;
  name: string;
  slug: string;
  type: PackageType;
  duration: number;
  price: number;
  shortDescription?: string | null;
  description?: string | null;
  image?: string | null;
  features: string[];
  terms?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  vehicles: VehicleMin[];
  bookingCount: number;
};

export default function AdminPackagesClient({
  initialPackages,
}: {
  initialPackages: PackageItem[];
}) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const filteredPackages = packages.filter((pkg) => {
    const matchesType = selectedType === "ALL" || pkg.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleActive = async (pkg: PackageItem) => {
    setLoadingId(pkg.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update package status.");
      }

      setPackages((prev) =>
        prev.map((item) =>
          item.id === pkg.id ? { ...item, isActive: !pkg.isActive } : item
        )
      );

      setSuccessMsg(
        `Package "${pkg.name}" is now ${!pkg.isActive ? "ACTIVE" : "INACTIVE"}.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (pkg: PackageItem) => {
    if (!confirm(`Are you sure you want to delete package "${pkg.name}"?`)) {
      return;
    }

    setLoadingId(pkg.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete package.");
      }

      setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
      setSuccessMsg(`Package "${pkg.name}" deleted successfully.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete package.");
    } finally {
      setLoadingId(null);
    }
  };

  const totalCount = packages.length;
  const activeCount = packages.filter((p) => p.isActive).length;
  const weeklyCount = packages.filter((p) => p.type === "WEEKLY").length;
  const monthlyCount = packages.filter((p) => p.type === "MONTHLY").length;
  const yearlyCount = packages.filter((p) => p.type === "YEARLY").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Packages</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Weekly</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-300 mt-1">{weeklyCount}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Monthly</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-300 mt-1">{monthlyCount}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Yearly</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">{yearlyCount}</p>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["ALL", "WEEKLY", "MONTHLY", "YEARLY"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {type === "ALL" ? "All Categories" : `${type}`}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages..."
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Package List / Grid */}
      {filteredPackages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
          <p className="text-slate-400 text-sm font-medium">No packages found.</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your filter or create a new package.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all bg-slate-900/80 ${
                pkg.isActive ? "border-slate-800" : "border-slate-800/50 opacity-75"
              }`}
            >
              <div>
                {/* Badge & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      pkg.type === "WEEKLY"
                        ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                        : pkg.type === "MONTHLY"
                        ? "bg-purple-950 text-purple-400 border border-purple-800/40"
                        : "bg-amber-950 text-amber-400 border border-amber-800/40"
                    }`}
                  >
                    {pkg.type} PACKAGE
                  </span>

                  <button
                    onClick={() => handleToggleActive(pkg)}
                    disabled={loadingId === pkg.id}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      pkg.isActive
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50"
                        : "bg-rose-950/60 text-rose-400 border border-rose-800/40 hover:bg-rose-900/50"
                    }`}
                  >
                    {loadingId === pkg.id ? "Updating..." : pkg.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Package Name & Price */}
                <h3 className="text-lg font-bold text-white leading-snug">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Slug: <code className="text-blue-300">/packages/{pkg.slug}</code></p>

                <div className="my-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">₹{pkg.price.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-400 font-medium">/ {pkg.duration} days</span>
                </div>

                {pkg.shortDescription && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {pkg.shortDescription}
                  </p>
                )}

                {/* Features Pill Summary */}
                {pkg.features.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                        ✓ {f}
                      </span>
                    ))}
                    {pkg.features.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400">
                        +{pkg.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Vehicles Count */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Eligible Vehicles: <strong className="text-slate-200">{pkg.vehicles.length}</strong></span>
                  <span>Bookings: <strong className="text-slate-200">{pkg.bookingCount}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/packages/${pkg.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Preview
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/packages/${pkg.id}/edit`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(pkg)}
                    disabled={loadingId === pkg.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/30 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

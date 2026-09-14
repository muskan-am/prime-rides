"use client";

import { useState } from "react";
import Link from "next/link";
import { DiscountType } from "@prisma/client";

export type AdminCouponItem = {
  id: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minBookingValue: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminCouponsClient({
  initialCoupons,
  initialTickerEnabled = true,
}: {
  initialCoupons: AdminCouponItem[];
  initialTickerEnabled?: boolean;
}) {
  const [coupons, setCoupons] = useState<AdminCouponItem[]>(initialCoupons);
  const [tickerEnabled, setTickerEnabled] = useState<boolean>(initialTickerEnabled);
  const [tickerLoading, setTickerLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleToggleTicker = async () => {
    setTickerLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const nextState = !tickerEnabled;

    try {
      const res = await fetch("/api/admin/settings/coupon-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update banner setting.");
      }

      setTickerEnabled(nextState);
      setSuccessMsg(
        `Promotional Coupon Ticker Banner is now ${
          nextState ? "ENABLED (Visible on Website)" : "DISABLED (Hidden from Website)"
        }.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update ticker setting.");
    } finally {
      setTickerLoading(false);
    }
  };

  const getComputedStatus = (coupon: AdminCouponItem) => {
    if (!coupon.isActive) return "INACTIVE";
    const now = new Date();
    const from = new Date(coupon.validFrom);
    const until = new Date(coupon.validUntil);

    if (now < from) return "UPCOMING";
    if (now > until) return "EXPIRED";
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return "LIMIT REACHED";
    }
    return "ACTIVE";
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesType = selectedType === "ALL" || coupon.discountType === selectedType;
    const computedStatus = getComputedStatus(coupon);
    const matchesStatus = selectedStatus === "ALL" || computedStatus === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.title && coupon.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  const handleToggleActive = async (coupon: AdminCouponItem) => {
    setLoadingId(coupon.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update coupon status.");
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
      );

      setSuccessMsg(
        `Coupon "${coupon.code}" is now ${!coupon.isActive ? "ACTIVE" : "INACTIVE"}.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update coupon.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (coupon: AdminCouponItem) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    setLoadingId(coupon.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete coupon.");
      }

      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      setSuccessMsg(`Coupon "${coupon.code}" was deleted.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete coupon.");
    } finally {
      setLoadingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            ● ACTIVE
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            ○ INACTIVE
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            ✕ EXPIRED
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            ⏳ UPCOMING
          </span>
        );
      case "LIMIT REACHED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            ⚠️ LIMIT REACHED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Promotional Ticker Banner Management Card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#0A1128] via-slate-900 to-[#0A1128] p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h3 className="text-base font-extrabold text-white">
              Public Website Scrolling Coupon Ticker Banner
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                tickerEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {tickerEnabled ? "● Banner Enabled" : "○ Banner Hidden"}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Control whether the thin scrolling coupon ticker appears below the main website Navbar for customers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleTicker}
          disabled={tickerLoading}
          className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            tickerEnabled
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          } disabled:opacity-50`}
        >
          {tickerLoading ? (
            <span>Updating...</span>
          ) : tickerEnabled ? (
            <>
              <span>Hide Ticker Banner</span>
            </>
          ) : (
            <>
              <span>Enable Ticker Banner</span>
            </>
          )}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search coupon code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-4 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
            <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="ALL">All Discount Types</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="EXPIRED">Expired</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="LIMIT REACHED">Limit Reached</option>
          </select>
        </div>
      </div>

      {/* Coupons Data Table */}
      {filteredCoupons.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-base font-bold text-slate-800">No coupons found.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search filters or create a new coupon.</p>
          <Link
            href="/admin/coupons/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            + Create New Coupon
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Coupon Code & Title</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min. Booking</th>
                  <th className="px-6 py-4">Max. Discount</th>
                  <th className="px-6 py-4">Validity Period</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCoupons.map((coupon) => {
                  const computedStatus = getComputedStatus(coupon);
                  const isPending = loadingId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Code & Title */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 tracking-wider text-xs inline-block">
                          {coupon.code}
                        </div>
                        {coupon.title && (
                          <div className="mt-1 text-xs text-slate-600 font-semibold truncate max-w-[200px]">
                            {coupon.title}
                          </div>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue.toLocaleString("en-IN")} OFF`}
                      </td>

                      {/* Min Booking Value */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {coupon.minBookingValue
                          ? `₹${coupon.minBookingValue.toLocaleString("en-IN")}`
                          : "None"}
                      </td>

                      {/* Max Discount */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {coupon.maxDiscount
                          ? `₹${coupon.maxDiscount.toLocaleString("en-IN")}`
                          : "Capped"}
                      </td>

                      {/* Validity Period */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div>From: {new Date(coupon.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div>Until: {new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4 text-xs font-bold text-slate-800">
                        {coupon.usageCount} {coupon.usageLimit !== null ? `/ ${coupon.usageLimit}` : "(Unlimited)"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {renderStatusBadge(computedStatus)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/coupons/${coupon.id}/edit`}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleToggleActive(coupon)}
                            disabled={isPending}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                              coupon.isActive
                                ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            } disabled:opacity-50`}
                          >
                            {isPending
                              ? "..."
                              : coupon.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDelete(coupon)}
                            disabled={isPending}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

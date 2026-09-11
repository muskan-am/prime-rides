"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DeliveryCharge = {
  id: string;
  charge: string | number;
  isActive: boolean;
  location: {
    id: string;
    name: string;
    address: string;
  };
};

export default function DeliveryChargesPage() {
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeliveryCharges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/delivery-charges");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch delivery charges");
      }

      setDeliveryCharges(data.deliveryCharges || []);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery charge?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/delivery-charges/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete delivery charge");
      }

      setDeliveryCharges((prev) => prev.filter((charge) => charge.id !== id));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete delivery charge");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 text-center animate-pulse">
        Loading delivery charges...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Doorstep Delivery Fees
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Set and manage location-based doorstep vehicle delivery charges.
          </p>
        </div>

        <Link
          href="/admin/delivery-charges/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          + Add Delivery Charge Rate
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Table Card */}
      {!error && deliveryCharges.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="text-lg font-bold text-slate-900">No Delivery Charges Configured</h3>
          <p className="text-sm text-slate-500 mt-1">Add fee rates for doorstep delivery across locations.</p>
          <Link
            href="/admin/delivery-charges/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            + Add Delivery Charge Rate
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Location Charge Matrix</h2>
            <span className="text-xs text-slate-500">Total: {deliveryCharges.length}</span>
          </div>

          {/* Mobile Card View (sm:hidden) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {deliveryCharges.map((item) => (
              <div key={item.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-slate-900 text-base">{item.location.name}</p>
                    <p className="text-xs text-slate-500">{item.location.address || "No address provided"}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <div>
                    <span className="text-slate-500">Fee: </span>
                    <span className="font-extrabold text-slate-900 text-base">₹{Number(item.charge).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/delivery-charges/${item.id}/edit`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto min-w-0">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4 font-semibold">Hub Location</th>
                  <th className="px-6 py-4 font-semibold">Address</th>
                  <th className="px-6 py-4 font-semibold">Delivery Charge (₹)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveryCharges.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.location.name}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {item.location.address || "—"}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-slate-900 text-base">
                      ₹{Number(item.charge).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/delivery-charges/${item.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
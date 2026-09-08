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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Doorstep Delivery Fees
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Set and manage location-based doorstep vehicle delivery charges.
          </p>
        </div>

        <Link
          href="/admin/delivery-charges/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          + Add Delivery Charge Rate
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Table Card */}
      {!error && deliveryCharges.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="text-lg font-bold text-white">No Delivery Charges Configured</h3>
          <p className="text-sm text-slate-400 mt-1">Add fee rates for doorstep delivery across locations.</p>
          <Link
            href="/admin/delivery-charges/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            + Add Delivery Charge Rate
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-lg font-mono">Location Charge Matrix</h2>
            <span className="text-xs text-slate-400">Total: {deliveryCharges.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Hub Location</th>
                  <th className="px-6 py-4 font-semibold">Address</th>
                  <th className="px-6 py-4 font-semibold">Delivery Charge (₹)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deliveryCharges.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {item.location.name}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {item.location.address || "—"}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-white text-base">
                      ₹{Number(item.charge).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/delivery-charges/${item.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 transition-colors"
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
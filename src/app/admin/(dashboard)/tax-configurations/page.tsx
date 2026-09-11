"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TaxConfiguration = {
  id: string;
  name: string;
  rate: string | number;
  isActive: boolean;
  createdAt: string;
};

export default function TaxConfigurationsPage() {
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTaxConfigurations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/tax-configurations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch tax configurations.");
      }

      setTaxConfigurations(data.taxConfigurations || []);
    } catch (err) {
      console.error("Fetch Tax Configurations Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxConfigurations();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tax configuration?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`/api/admin/tax-configurations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete tax configuration.");
      }

      setTaxConfigurations((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete Tax Configuration Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 text-center animate-pulse">
        Loading tax configuration rates...
      </div>
    );
  }

  const activeTax = taxConfigurations.find((t) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            GST & Tax Rates Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure system GST percentage applied dynamically to booking checkouts.
          </p>
        </div>

        <Link
          href="/admin/tax-configurations/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          + Add Tax Configuration
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Active Tax Alert Banner */}
      {activeTax && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 text-lg">🧾</span>
            <div>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Active System Tax Rate</p>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {activeTax.name} — <span className="text-emerald-700">{Number(activeTax.rate)}% GST</span>
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700">Used for all new reservations</span>
        </div>
      )}

      {/* Table Card */}
      {taxConfigurations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-3xl mb-3">🧾</div>
          <h3 className="text-lg font-bold text-slate-900">No Tax Rates Configured</h3>
          <p className="text-sm text-slate-500 mt-1">Add GST or rental tax rate for booking calculations.</p>
          <Link
            href="/admin/tax-configurations/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            + Add Tax Rate
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Tax Configuration Table</h2>
            <span className="text-xs text-slate-500">Total: {taxConfigurations.length}</span>
          </div>

          {/* Mobile Card List View (sm:hidden) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {taxConfigurations.map((tax) => (
              <div key={tax.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-slate-900 text-base">{tax.name}</p>
                    <p className="text-xs text-slate-500">Created: {new Date(tax.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      tax.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {tax.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <div>
                    <span className="text-slate-500">GST Rate: </span>
                    <span className="font-extrabold text-blue-600 text-base">{Number(tax.rate)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/tax-configurations/${tax.id}/edit`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === tax.id}
                      onClick={() => handleDelete(tax.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      {deletingId === tax.id ? "Deleting..." : "Delete"}
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
                  <th className="px-6 py-4 font-semibold">Tax Name</th>
                  <th className="px-6 py-4 font-semibold">Rate (%)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxConfigurations.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{tax.name}</td>
                    <td className="px-6 py-4 font-extrabold text-blue-600 text-base">{Number(tax.rate)}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          tax.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {tax.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(tax.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/tax-configurations/${tax.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === tax.id}
                          onClick={() => handleDelete(tax.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors disabled:opacity-50"
                        >
                          {deletingId === tax.id ? "Deleting..." : "Delete"}
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
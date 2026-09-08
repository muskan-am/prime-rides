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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GST & Tax Rates Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure system GST percentage applied dynamically to booking checkouts.
          </p>
        </div>

        <Link
          href="/admin/tax-configurations/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          + Add Tax Configuration
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Active Tax Alert Banner */}
      {activeTax && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">🧾</span>
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Active System Tax Rate</p>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {activeTax.name} — <span className="text-emerald-300">{Number(activeTax.rate)}% GST</span>
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-400">Used for all new reservations</span>
        </div>
      )}

      {/* Table */}
      {taxConfigurations.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="text-3xl mb-3">🧾</div>
          <h3 className="text-lg font-bold text-white">No Tax Rates Configured</h3>
          <p className="text-sm text-slate-400 mt-1">Add GST or rental tax rate for booking calculations.</p>
          <Link
            href="/admin/tax-configurations/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            + Add Tax Rate
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Tax Configuration Table</h2>
            <span className="text-xs text-slate-400">Total: {taxConfigurations.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tax Name</th>
                  <th className="px-6 py-4 font-semibold">Rate (%)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {taxConfigurations.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{tax.name}</td>
                    <td className="px-6 py-4 font-extrabold text-blue-400 text-base">{Number(tax.rate)}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          tax.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {tax.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(tax.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/tax-configurations/${tax.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === tax.id}
                          onClick={() => handleDelete(tax.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 transition-colors disabled:opacity-50"
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
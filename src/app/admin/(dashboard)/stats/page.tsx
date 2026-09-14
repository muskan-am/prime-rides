"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BarChart3, X, Loader2, Hash, Type } from "lucide-react";

interface PlatformStatItem {
  id: string;
  label: string;
  valueNumber: number;
  prefix: string;
  suffix: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<PlatformStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<PlatformStatItem | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    valueNumber: 100,
    prefix: "",
    suffix: "+",
    sortOrder: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load platform stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Error fetching platform stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openCreateModal = () => {
    setEditingStat(null);
    setFormData({
      label: "",
      valueNumber: 100,
      prefix: "",
      suffix: "+",
      sortOrder: stats.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (stat: PlatformStatItem) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      valueNumber: stat.valueNumber,
      prefix: stat.prefix,
      suffix: stat.suffix,
      sortOrder: stat.sortOrder,
      isActive: stat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim() || isNaN(formData.valueNumber)) return;

    try {
      setSaving(true);
      if (editingStat) {
        // PATCH update
        const res = await fetch(`/api/admin/stats/${editingStat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update stat");
      } else {
        // POST create
        const res = await fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create stat");
      }

      setIsModalOpen(false);
      fetchStats();
    } catch (err: any) {
      alert(err.message || "Error saving stat");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (stat: PlatformStatItem) => {
    try {
      const res = await fetch(`/api/admin/stats/${stat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !stat.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchStats();
    } catch (err: any) {
      alert(err.message || "Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;
    try {
      const res = await fetch(`/api/admin/stats/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete stat");
      fetchStats();
    } catch (err: any) {
      alert(err.message || "Error deleting stat");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">
              Platform Stats Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage animated counters (e.g. 100+ Cities, 25M+ Users) displayed on the homepage car section.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Stat</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-sm font-semibold text-slate-600">
            Loading platform stats...
          </span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-lg font-bold text-slate-800">No platform stats found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Click 'Add New Stat' to create your first statistic card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`p-5 rounded-2xl border bg-white transition-all shadow-xs flex flex-col justify-between ${
                stat.isActive
                  ? "border-slate-200 hover:border-blue-200"
                  : "border-slate-200/60 bg-slate-50/50 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Order: #{stat.sortOrder}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        stat.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {stat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleStatus(stat)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        stat.isActive
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {stat.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => openEditModal(stat)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                      title="Edit Stat"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(stat.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      title="Delete Stat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 bg-slate-900/5 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-3xl font-black text-slate-900 tracking-tight block">
                    {stat.prefix}{stat.valueNumber}{stat.suffix}
                  </span>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingStat ? "Edit Platform Stat" : "Add New Platform Stat"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Number, Prefix & Suffix */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹"
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Number *
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    placeholder="e.g. 100"
                    value={formData.valueNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valueNumber: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Suffix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +, M+, K+"
                    value={formData.suffix}
                    onChange={(e) =>
                      setFormData({ ...formData, suffix: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Preview Badge */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Animation Preview
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {formData.prefix}{formData.valueNumber}{formData.suffix}
                </span>
              </div>

              {/* Label Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Label Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Major cities in India with reliable self drive car rental options."
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingStat ? "Update Stat" : "Save Stat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

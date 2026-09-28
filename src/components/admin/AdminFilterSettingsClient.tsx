"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Car,
  Fuel,
  Gauge,
  Users,
  Star,
  IndianRupee,
  Truck,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { FilterSettings, DEFAULT_FILTER_SETTINGS } from "@/lib/filterSettings";

interface AdminFilterSettingsClientProps {
  initialSettings: FilterSettings;
}

export default function AdminFilterSettingsClient({
  initialSettings,
}: AdminFilterSettingsClientProps) {
  const [settings, setSettings] = useState<FilterSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // New option temp states
  const [newCarType, setNewCarType] = useState("");
  const [newFuelType, setNewFuelType] = useState("");
  const [newSeatOption, setNewSeatOption] = useState("");
  const [newTransmissionOption, setNewTransmissionOption] = useState("");

  const handleToggle = (key: keyof FilterSettings) => {
    setSettings((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          enabled: !current.enabled,
        },
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/filter-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Filter configuration successfully saved! Changes are now live on the customer cars catalog.",
        });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update filter configurations.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        "Are you sure you want to reset all customer filter settings to default configuration?"
      )
    ) {
      setSettings(DEFAULT_FILTER_SETTINGS);
    }
  };

  // Car Type Add/Delete
  const addCarType = () => {
    if (!newCarType.trim()) return;
    if (settings.carType.options.includes(newCarType.trim())) return;
    setSettings((prev) => ({
      ...prev,
      carType: {
        ...prev.carType,
        options: [...prev.carType.options, newCarType.trim()],
      },
    }));
    setNewCarType("");
  };

  const removeCarType = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      carType: {
        ...prev.carType,
        options: prev.carType.options.filter((_, i) => i !== index),
      },
    }));
  };

  // Fuel Type Add/Delete
  const addFuelType = () => {
    if (!newFuelType.trim()) return;
    if (settings.fuelType.options.includes(newFuelType.trim())) return;
    setSettings((prev) => ({
      ...prev,
      fuelType: {
        ...prev.fuelType,
        options: [...prev.fuelType.options, newFuelType.trim()],
      },
    }));
    setNewFuelType("");
  };

  const removeFuelType = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      fuelType: {
        ...prev.fuelType,
        options: prev.fuelType.options.filter((_, i) => i !== index),
      },
    }));
  };

  // Transmission Add/Delete
  const addTransmissionOption = () => {
    if (!newTransmissionOption.trim()) return;
    if (settings.transmission.options.includes(newTransmissionOption.trim())) return;
    setSettings((prev) => ({
      ...prev,
      transmission: {
        ...prev.transmission,
        options: [...prev.transmission.options, newTransmissionOption.trim()],
      },
    }));
    setNewTransmissionOption("");
  };

  const removeTransmissionOption = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      transmission: {
        ...prev.transmission,
        options: prev.transmission.options.filter((_, i) => i !== index),
      },
    }));
  };

  // Seat Options Add/Delete
  const addSeatOption = () => {
    if (!newSeatOption.trim()) return;
    if (settings.seats.options.includes(newSeatOption.trim())) return;
    setSettings((prev) => ({
      ...prev,
      seats: {
        ...prev.seats,
        options: [...prev.seats.options, newSeatOption.trim()],
      },
    }));
    setNewSeatOption("");
  };

  const removeSeatOption = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      seats: {
        ...prev.seats,
        options: prev.seats.options.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
              Customer Catalog Filter Manager
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Configure the 7 customer-facing sidebar filters: Price, Car Type, Fuel Type, Transmission, Seats, Ratings, and Delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Price Range & Delivery Type */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Total Price Range Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Price Range Filter</h3>
                <p className="text-xs text-slate-500">Min and Max price range slider limits</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("priceRange")}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.priceRange.enabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
            >
              {settings.priceRange.enabled ? (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5" /> Hidden
                </span>
              )}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section Label</label>
              <input
                type="text"
                value={settings.priceRange.label}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, label: e.target.value },
                  }))
                }
                className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Default Min Price (₹)</label>
              <input
                type="number"
                value={settings.priceRange.minPrice}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, minPrice: Number(e.target.value) || 500 },
                  }))
                }
                className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Default Max Price (₹)</label>
              <input
                type="number"
                value={settings.priceRange.maxPrice}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, maxPrice: Number(e.target.value) || 15000 },
                  }))
                }
                className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery Type Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delivery Type Filter</h3>
                <p className="text-xs text-slate-500">Home delivery checkbox option</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("deliveryType")}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.deliveryType.enabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
            >
              {settings.deliveryType.enabled ? (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5" /> Hidden
                </span>
              )}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section Label</label>
              <input
                type="text"
                value={settings.deliveryType.label}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    deliveryType: { ...prev.deliveryType, label: e.target.value },
                  }))
                }
                className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notice Caption Under Checkbox</label>
              <input
                type="text"
                value={settings.deliveryType.noticeText}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    deliveryType: { ...prev.deliveryType, noticeText: e.target.value },
                  }))
                }
                className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Car Type / Vehicle Type Management */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Car Type / Category Filter</h3>
              <p className="text-xs text-slate-500">
                Single source of truth for categories (SUV, Sedan, Hatchback, MUV/MPV, Luxury Sedan, Compact SUV, Luxury SUV)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("carType")}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              settings.carType.enabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-100 border-slate-200 text-slate-400"
            }`}
          >
            {settings.carType.enabled ? "Enabled" : "Hidden"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings.carType.options.map((opt, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800"
            >
              <span>{opt}</span>
              <button
                type="button"
                onClick={() => removeCarType(idx)}
                className="hover:text-rose-600 text-purple-400 cursor-pointer ml-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="e.g. Compact SUV"
            value={newCarType}
            onChange={(e) => setNewCarType(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none flex-1"
          />
          <button
            type="button"
            onClick={addCarType}
            className="px-3 h-9 rounded-xl bg-purple-600 text-white text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors"
          >
            + Add Car Type
          </button>
        </div>
      </div>

      {/* Section 3: Transmission & Fuel Type */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transmission Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Transmission Filter</h3>
                <p className="text-xs text-slate-500">Automatic, Manual</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("transmission")}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.transmission.enabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
            >
              {settings.transmission.enabled ? "Enabled" : "Hidden"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {settings.transmission.options.map((opt, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>{opt}</span>
                <button
                  type="button"
                  onClick={() => removeTransmissionOption(idx)}
                  className="hover:text-rose-600 text-slate-400 cursor-pointer ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Semi-Automatic"
              value={newTransmissionOption}
              onChange={(e) => setNewTransmissionOption(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none flex-1"
            />
            <button
              type="button"
              onClick={addTransmissionOption}
              className="px-3 h-9 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Fuel Type Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Fuel Type Filter</h3>
                <p className="text-xs text-slate-500">Petrol, Diesel, Electric, CNG, Hybrid</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("fuelType")}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.fuelType.enabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
            >
              {settings.fuelType.enabled ? "Enabled" : "Hidden"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {settings.fuelType.options.map((opt, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>{opt}</span>
                <button
                  type="button"
                  onClick={() => removeFuelType(idx)}
                  className="hover:text-rose-600 text-slate-400 cursor-pointer ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Hybrid"
              value={newFuelType}
              onChange={(e) => setNewFuelType(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none flex-1"
            />
            <button
              type="button"
              onClick={addFuelType}
              className="px-3 h-9 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Seating & User Ratings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Seating */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Seating Capacity Filter</h3>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("seats")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                settings.seats.enabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {settings.seats.enabled ? "Active" : "Off"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {settings.seats.options.map((opt, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-800"
              >
                {opt}
                <button
                  type="button"
                  onClick={() => removeSeatOption(idx)}
                  className="hover:text-rose-600 text-slate-400 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. 8+ Seater"
              value={newSeatOption}
              onChange={(e) => setNewSeatOption(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none flex-1"
            />
            <button
              type="button"
              onClick={addSeatOption}
              className="px-2.5 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* User Ratings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">User Ratings Filter</h3>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("userRatings")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                settings.userRatings.enabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {settings.userRatings.enabled ? "Active" : "Off"}
            </button>
          </div>

          <div className="space-y-1.5 pt-2">
            {settings.userRatings.options.map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                <span className="font-medium">{opt.label}</span>
                <span className="text-slate-400">≥ {opt.minRating}★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

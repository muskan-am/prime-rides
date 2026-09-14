"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


type VehicleOption = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

type InitialPackageData = {
  id?: string;
  name: string;
  slug: string;
  type: "WEEKLY" | "MONTHLY" | "YEARLY";
  duration: number;
  price: number;
  shortDescription: string;
  description: string;
  image: string;
  features: string[];
  terms: string;
  isActive: boolean;
  sortOrder: number;
  vehicleIds: string[];
};

export default function PackageFormClient({
  vehicles,
  initialData,
}: {
  vehicles: VehicleOption[];
  initialData?: InitialPackageData;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [type, setType] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">(
    initialData?.type || "WEEKLY"
  );
  const [duration, setDuration] = useState<number | string>(
    initialData?.duration ?? 7
  );
  const [price, setPrice] = useState<number | string>(
    initialData?.price ?? ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [image, setImage] = useState(initialData?.image || "");
  const [featuresText, setFeaturesText] = useState(
    initialData?.features ? initialData.features.join("\n") : ""
  );
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [showTermsPreview, setShowTermsPreview] = useState(false);
  const [sortOrder, setSortOrder] = useState<number | string>(
    initialData?.sortOrder ?? 0
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    initialData?.vehicleIds || []
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTypeChange = (newType: "WEEKLY" | "MONTHLY" | "YEARLY") => {
    setType(newType);
    // Suggest default duration if user hasn't modified or if creating new
    if (!isEditing) {
      if (newType === "WEEKLY") setDuration(7);
      if (newType === "MONTHLY") setDuration(30);
      if (newType === "YEARLY") setDuration(365);
    }
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const selectAllVehicles = () => {
    if (selectedVehicleIds.length === vehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(vehicles.map((v) => v.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Package name is required.");
      return;
    }

    const numDuration = Number(duration);
    if (!Number.isInteger(numDuration) || numDuration <= 0) {
      setErrorMsg("Duration must be a positive number of days.");
      return;
    }

    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setErrorMsg("Please enter a valid price.");
      return;
    }

    setLoading(true);

    try {
      const featuresArray = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        type,
        duration: numDuration,
        price: numPrice,
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        image: image.trim() || null,
        features: featuresArray,
        terms: terms.trim() || null,
        isActive,
        sortOrder: Number(sortOrder) || 0,
        vehicleIds: selectedVehicleIds,
      };

      const url = isEditing
        ? `/api/admin/packages/${initialData?.id}`
        : "/api/admin/packages";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save package.");
      }

      setSuccessMsg(
        isEditing
          ? "Package updated successfully!"
          : "Package created successfully!"
      );

      setTimeout(() => {
        router.push("/admin/packages");
        router.refresh();
      }, 1000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save package.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Main Details Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#0A1128] mb-2">General Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Package Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Getaway Special"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug (Optional / Auto-generated)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. weekly-getaway-special"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Package Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) =>
                handleTypeChange(e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY")
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="WEEKLY">Weekly Package</option>
              <option value="MONTHLY">Monthly Package</option>
              <option value="YEARLY">Yearly Package</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration (in Days) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="7"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Package Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 14999"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Short Description (Card Summary)
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="e.g. Includes 1000 free km, zero security deposit & unlimited roadside assistance."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed overview of the package benefits..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Package Banner Image URL (Optional)
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Features (Enter 1 feature per line)
          </label>
          <textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"Free Doorstep Delivery\nZero Security Deposit\nComprehensive Insurance\n24/7 Roadside Support"}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white font-mono text-xs resize-y"
          />
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sort Priority Order (Lower numbers appear first)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActiveToggle" className="text-sm font-semibold text-[#0A1128] cursor-pointer">
              Active & Publicly Bookable
            </label>
          </div>
        </div>
      </div>

      {/* Eligible Vehicles Selection */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A1128]">Eligible Vehicles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which cars in the fleet can be booked with this package.
            </p>
          </div>

          <button
            type="button"
            onClick={selectAllVehicles}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            {selectedVehicleIds.length === vehicles.length ? "Deselect All" : "Select All Vehicles"}
          </button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-xs text-slate-400 font-normal">No vehicles available in database.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {vehicles.map((v) => {
              const isSelected = selectedVehicleIds.includes(v.id);
              return (
                <div
                  key={v.id}
                  onClick={() => toggleVehicle(v.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 text-[#0A1128]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div click
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{v.name}</p>
                    <p className="text-[11px] text-slate-500">Base: ₹{v.price.toLocaleString("en-IN")}/day</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/packages")}
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {loading ? "Saving Package..." : isEditing ? "Save Changes" : "Create Package"}
        </button>
      </div>
    </form>
  );
}

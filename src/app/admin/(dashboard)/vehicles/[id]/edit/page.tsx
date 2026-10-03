"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type VehicleForm = {
  brand: string;
  model: string;
  variant: string;
  vehicleType: string;
  registrationNumber: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: string;
  hasAirConditioning: string;
  basePrice: string;
  deposit: string;
  speedLimit: string;
  rentalTerms: string;
  availabilityStatus: string;
  maintenanceStatus: string;
  searchPriority: string;
  primaryImage: string;
};

const initialForm: VehicleForm = {
  brand: "",
  model: "",
  variant: "",
  vehicleType: "SUV",
  registrationNumber: "",
  fuelType: "",
  transmission: "",
  seatingCapacity: "",
  hasAirConditioning: "true",
  basePrice: "",
  deposit: "0",
  speedLimit: "",
  rentalTerms: "",
  availabilityStatus: "AVAILABLE",
  maintenanceStatus: "GOOD",
  searchPriority: "0",
  primaryImage: "",
};

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch("/api/admin/locations");
        const data = await res.json();
        if (data.success && Array.isArray(data.locations)) {
          setLocations(data.locations.filter((l: any) => l.isActive));
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    }
    loadLocations();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/admin/vehicles/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load vehicle");
        }

        const vehicle = data.vehicle;

        if (Array.isArray(vehicle.inventory) && vehicle.inventory.length > 0) {
          setSelectedLocationIds(
            vehicle.inventory
              .filter((inv: any) => inv.isActive)
              .map((inv: any) => inv.locationId)
          );
        }

        setForm({
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          variant: vehicle.variant || "",
          vehicleType: vehicle.vehicleType || "SUV",
          registrationNumber: vehicle.registrationNumber || "",
          fuelType: vehicle.fuelType || "",
          transmission: vehicle.transmission || "",
          seatingCapacity: vehicle.seatingCapacity?.toString() || "",
          hasAirConditioning: vehicle.hasAirConditioning !== false ? "true" : "false",
          basePrice: vehicle.basePrice?.toString() || "",
          deposit: vehicle.deposit?.toString() || "0",
          speedLimit: vehicle.speedLimit?.toString() || "",
          rentalTerms: vehicle.rentalTerms || "",
          availabilityStatus: vehicle.availabilityStatus || "AVAILABLE",
          maintenanceStatus: vehicle.maintenanceStatus || "GOOD",
          searchPriority: vehicle.searchPriority?.toString() || "0",
          primaryImage: vehicle.primaryImage || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const toggleLocation = (locId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.brand.trim()) {
      setError("Brand is required");
      return;
    }

    if (!form.model.trim()) {
      setError("Model is required");
      return;
    }

    if (!form.basePrice) {
      setError("Base price is required");
      return;
    }

    if (selectedLocationIds.length === 0) {
      setError("Please select at least one branch/location for this vehicle.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          variant: form.variant || null,
          registrationNumber: form.registrationNumber || null,
          fuelType: form.fuelType || null,
          transmission: form.transmission || null,
          seatingCapacity: form.seatingCapacity ? Number(form.seatingCapacity) : null,
          hasAirConditioning: form.hasAirConditioning === "true",
          basePrice: Number(form.basePrice),
          deposit: form.deposit ? Number(form.deposit) : 0,
          speedLimit: form.speedLimit ? Number(form.speedLimit) : null,
          rentalTerms: form.rentalTerms || null,
          availabilityStatus: form.availabilityStatus,
          maintenanceStatus: form.maintenanceStatus,
          searchPriority: form.searchPriority ? Number(form.searchPriority) : 0,
          primaryImage: form.primaryImage || null,
          locationIds: selectedLocationIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update vehicle");
      }

      setSuccess("Vehicle updated successfully!");

      setTimeout(() => {
        router.push(`/admin/vehicles/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 text-center animate-pulse">
        Loading vehicle details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Edit Vehicle #{id.slice(-6)}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Update specifications, status, and pricing for {form.brand} {form.model}.
          </p>
        </div>

        <Link
          href={`/admin/vehicles/${id}`}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
        >
          ← Cancel Edit
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Basic Information
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Brand *" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Toyota" />
              <FormField label="Model *" name="model" value={form.model} onChange={handleChange} placeholder="e.g. Fortuner" />
              <FormField label="Variant" name="variant" value={form.variant} onChange={handleChange} placeholder="e.g. Legender" />
              <SelectField
                label="Car / Vehicle Type *"
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                options={[
                  "SUV",
                  "Sedan",
                  "Hatchback",
                  "MUV/MPV",
                  "Luxury Sedan",
                  "Compact SUV",
                  "Luxury SUV",
                ]}
              />
              <FormField label="Registration Plate" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="e.g. UP32AB1234" />
            </div>
          </section>

          {/* Specs */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Specifications
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Fuel Type" name="fuelType" value={form.fuelType} onChange={handleChange} options={["PETROL", "DIESEL", "ELECTRIC", "CNG", "HYBRID"]} />
              <SelectField label="Transmission" name="transmission" value={form.transmission} onChange={handleChange} options={["MANUAL", "AUTOMATIC", "AMT", "CVT", "DCT"]} />
              <FormField label="Seating Capacity" name="seatingCapacity" type="number" value={form.seatingCapacity} onChange={handleChange} placeholder="5" />
              <FormField label="Speed Limit (km/h)" name="speedLimit" type="number" value={form.speedLimit} onChange={handleChange} placeholder="120" />
              <SelectField label="Air Conditioning" name="hasAirConditioning" value={form.hasAirConditioning} onChange={handleChange} options={[{ label: "Air Conditioned (AC)", value: "true" }, { label: "Non-AC", value: "false" }]} />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Pricing & Security Deposit
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Base Daily Rate (₹) *" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} placeholder="2500" />
              <FormField label="Security Deposit (₹)" name="deposit" type="number" value={form.deposit} onChange={handleChange} placeholder="5000" />
            </div>
          </section>

          {/* Branch / Hub Location Assignment */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Branch & Hub Locations *
            </h2>
            <p className="text-xs text-slate-500">
              Select the branches/hubs where this vehicle is stationed and available for customer pickup.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {locations.map((loc) => {
                const isChecked = selectedLocationIds.includes(loc.id);
                return (
                  <label
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-sm">{loc.name}</span>
                  </label>
                );
              })}
            </div>
            {locations.length === 0 && (
              <p className="text-xs text-amber-600 font-medium">Loading active locations...</p>
            )}
          </section>

          {/* Status */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Status & Visibility
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField label="Availability" name="availabilityStatus" value={form.availabilityStatus} onChange={handleChange} options={["AVAILABLE", "UNAVAILABLE", "BOOKED"]} />
              <SelectField label="Maintenance" name="maintenanceStatus" value={form.maintenanceStatus} onChange={handleChange} options={["GOOD", "MAINTENANCE", "REPAIR"]} />
              <FormField label="Search Priority" name="searchPriority" type="number" value={form.searchPriority} onChange={handleChange} placeholder="0" />
            </div>
          </section>

          {/* Primary Image */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-[#0A1128] border-b border-slate-200 pb-2">
              Primary Vehicle Image
            </h2>
            <FormField label="Primary Image URL" name="primaryImage" value={form.primaryImage} onChange={handleChange} placeholder="https://example.com/car.jpg" />
            {form.primaryImage && (
              <div className="mt-3 relative h-40 w-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={form.primaryImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </section>



          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/admin/vehicles/${id}`}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Update Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-medium"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { label: string; value: string })[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-medium"
      >
        <option value="">Select {label}</option>
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const lbl = typeof option === "string" ? option : option.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}
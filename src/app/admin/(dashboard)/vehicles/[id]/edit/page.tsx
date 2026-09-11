"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type VehicleForm = {
  brand: string;
  model: string;
  variant: string;
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

        setForm({
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          variant: vehicle.variant || "",
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
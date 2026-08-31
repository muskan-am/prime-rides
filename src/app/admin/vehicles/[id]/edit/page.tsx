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
          seatingCapacity:
            vehicle.seatingCapacity?.toString() || "",
          basePrice: vehicle.basePrice?.toString() || "",
          deposit: vehicle.deposit?.toString() || "0",
          speedLimit: vehicle.speedLimit?.toString() || "",
          rentalTerms: vehicle.rentalTerms || "",
          availabilityStatus:
            vehicle.availabilityStatus || "AVAILABLE",
          maintenanceStatus:
            vehicle.maintenanceStatus || "GOOD",
          searchPriority:
            vehicle.searchPriority?.toString() || "0",
          primaryImage: vehicle.primaryImage || "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load vehicle"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
          registrationNumber:
            form.registrationNumber || null,
          fuelType: form.fuelType || null,
          transmission: form.transmission || null,
          seatingCapacity: form.seatingCapacity
            ? Number(form.seatingCapacity)
            : null,
          basePrice: Number(form.basePrice),
          deposit: form.deposit
            ? Number(form.deposit)
            : 0,
          speedLimit: form.speedLimit
            ? Number(form.speedLimit)
            : null,
          rentalTerms: form.rentalTerms || null,
          availabilityStatus: form.availabilityStatus,
          maintenanceStatus: form.maintenanceStatus,
          searchPriority: form.searchPriority
            ? Number(form.searchPriority)
            : 0,
          primaryImage: form.primaryImage || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update vehicle"
        );
      }

      setSuccess("Vehicle updated successfully!");

      setTimeout(() => {
        router.push(`/admin/vehicles/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-muted-foreground">
            Loading vehicle...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Edit Vehicle
            </h1>
          </div>

          <Link
            href={`/admin/vehicles/${id}`}
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            ← Back to Vehicle
          </Link>
        </div>

        {/* Form Card */}
        <div className="mt-8 rounded-2xl border bg-card p-5 sm:p-8">

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >

            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the basic details of the rental vehicle.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <FormField
                  label="Brand *"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                />

                <FormField
                  label="Model *"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="e.g. Fortuner"
                />

                <FormField
                  label="Variant"
                  name="variant"
                  value={form.variant}
                  onChange={handleChange}
                  placeholder="e.g. Legender"
                />

                <FormField
                  label="Registration Number"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. UP32AB1234"
                />

              </div>
            </section>

            {/* Vehicle Details */}
            <section>
              <h2 className="text-xl font-semibold">
                Vehicle Details
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <SelectField
                  label="Fuel Type"
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  options={[
                    "PETROL",
                    "DIESEL",
                    "ELECTRIC",
                    "CNG",
                    "HYBRID",
                  ]}
                />

                <SelectField
                  label="Transmission"
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  options={[
                    "MANUAL",
                    "AUTOMATIC",
                    "AMT",
                    "CVT",
                  ]}
                />

                <FormField
                  label="Seating Capacity"
                  name="seatingCapacity"
                  type="number"
                  value={form.seatingCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                />

                <FormField
                  label="Speed Limit (km/h)"
                  name="speedLimit"
                  type="number"
                  value={form.speedLimit}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                />

              </div>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="text-xl font-semibold">
                Pricing
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <FormField
                  label="Base Price *"
                  name="basePrice"
                  type="number"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                />

                <FormField
                  label="Security Deposit"
                  name="deposit"
                  type="number"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                />

              </div>
            </section>

            {/* Status */}
            <section>
              <h2 className="text-xl font-semibold">
                Status & Visibility
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">

                <SelectField
                  label="Availability"
                  name="availabilityStatus"
                  value={form.availabilityStatus}
                  onChange={handleChange}
                  options={[
                    "AVAILABLE",
                    "UNAVAILABLE",
                    "BOOKED",
                  ]}
                />

                <SelectField
                  label="Maintenance"
                  name="maintenanceStatus"
                  value={form.maintenanceStatus}
                  onChange={handleChange}
                  options={[
                    "GOOD",
                    "MAINTENANCE",
                    "REPAIR",
                  ]}
                />

                <FormField
                  label="Search Priority"
                  name="searchPriority"
                  type="number"
                  value={form.searchPriority}
                  onChange={handleChange}
                  placeholder="0"
                />

              </div>
            </section>

            {/* Image */}
            <section>
              <h2 className="text-xl font-semibold">
                Vehicle Image
              </h2>

              <div className="mt-5">
                <FormField
                  label="Primary Image URL"
                  name="primaryImage"
                  value={form.primaryImage}
                  onChange={handleChange}
                  placeholder="https://example.com/car.jpg"
                />
              </div>

              {form.primaryImage && (
                <div className="mt-4">
                  <img
                    src={form.primaryImage}
                    alt="Vehicle preview"
                    className="h-40 w-full max-w-sm rounded-xl border object-cover"
                  />
                </div>
              )}
            </section>

            {/* Rental Terms */}
            <section>
              <h2 className="text-xl font-semibold">
                Rental Terms
              </h2>

              <textarea
                name="rentalTerms"
                value={form.rentalTerms}
                onChange={handleChange}
                rows={5}
                placeholder="Enter rental terms and conditions..."
                className="mt-5 w-full resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </section>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

              <Link
                href={`/admin/vehicles/${id}`}
                className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Vehicle"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

/* ================================= */
/* FORM FIELD */
/* ================================= */

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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

/* ================================= */
/* SELECT FIELD */
/* ================================= */

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
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
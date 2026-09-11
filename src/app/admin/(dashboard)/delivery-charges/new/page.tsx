"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Location = {
  id: string;
  name: string;
  address: string;
};

export default function NewDeliveryChargePage() {
  const router = useRouter();

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");
  const [charge, setCharge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/admin/locations");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch locations"
          );
        }

        setLocations(data.locations || []);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load locations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!locationId) {
      setError("Please select a location.");
      return;
    }

    if (charge === "") {
      setError("Please enter a delivery charge.");
      return;
    }

    if (Number(charge) < 0) {
      setError("Delivery charge cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/delivery-charges",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId,
            charge,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create delivery charge"
        );
      }

      router.push("/admin/delivery-charges");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Add Delivery Charge
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Set a delivery charge for a location.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl rounded-xl border bg-white p-6">
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium"
            >
              Location
            </label>

            <select
              id="location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-black"
            >
              <option value="">
                Select a location
              </option>

              {locations.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name} — {location.address}
                </option>
              ))}
            </select>
          </div>

          {/* Charge */}
          <div>
            <label
              htmlFor="charge"
              className="mb-2 block text-sm font-medium"
            >
              Delivery Charge (₹)
            </label>

            <input
              id="charge"
              type="number"
              min="0"
              step="0.01"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              placeholder="Enter delivery charge"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/delivery-charges")
              }
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Delivery Charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
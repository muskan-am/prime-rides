"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Location = {
  id: string;
  name: string;
  address: string;
};

type DeliveryCharge = {
  id: string;
  locationId: string;
  charge: string | number;
  isActive: boolean;
  location: Location;
};

export default function EditDeliveryChargePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");
  const [charge, setCharge] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [chargeResponse, locationsResponse] =
          await Promise.all([
            fetch(`/api/admin/delivery-charges/${id}`),
            fetch("/api/admin/locations"),
          ]);

        const chargeData = await chargeResponse.json();
        const locationsData = await locationsResponse.json();

        if (!chargeResponse.ok) {
          throw new Error(
            chargeData.message ||
              "Failed to fetch delivery charge"
          );
        }

        if (!locationsResponse.ok) {
          throw new Error(
            locationsData.message ||
              "Failed to fetch locations"
          );
        }

        const deliveryCharge: DeliveryCharge =
          chargeData.deliveryCharge;

        setLocations(locationsData.locations || []);
        setLocationId(deliveryCharge.locationId);
        setCharge(String(deliveryCharge.charge));
        setIsActive(deliveryCharge.isActive);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load delivery charge"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
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
        `/api/admin/delivery-charges/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId,
            charge,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update delivery charge"
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
        <p>Loading delivery charge...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Edit Delivery Charge
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the delivery charge for this location.
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
              onChange={(e) =>
                setLocationId(e.target.value)
              }
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
              onChange={(e) =>
                setCharge(e.target.value)
              }
              placeholder="Enter delivery charge"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Status
              </p>

              <p className="text-xs text-gray-500">
                Enable or disable this delivery charge.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(e.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm">
                Active
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/delivery-charges"
                )
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
              {saving
                ? "Updating..."
                : "Update Delivery Charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
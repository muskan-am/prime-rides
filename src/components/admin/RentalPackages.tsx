"use client";

import { useEffect, useState } from "react";

type RentalPackage = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string | number;
  isActive: boolean;
};

type RentalPackagesProps = {
  vehicleId: string;
};

export default function RentalPackages({
  vehicleId,
}: RentalPackagesProps) {
  const [packages, setPackages] = useState<RentalPackage[]>([]);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------- */
  /* Fetch Packages */
  /* -------------------------------- */

  const fetchPackages = async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/rental-packages`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch rental packages"
        );
      }

      setPackages(data.packages || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch rental packages"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [vehicleId]);

  /* -------------------------------- */
  /* Add Package */
  /* -------------------------------- */

  const handleAdd = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const numericDuration = Number(duration);
    const numericPrice = Number(price);

    setError("");
    setSuccess("");

    if (!trimmedName) {
      setError("Package name is required");
      return;
    }

    if (
      !Number.isInteger(numericDuration) ||
      numericDuration <= 0
    ) {
      setError("Duration must be a positive number");
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Enter a valid package price");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/rental-packages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            description:
              trimmedDescription || null,
            duration: numericDuration,
            price: numericPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add rental package"
        );
      }

      setPackages((previous) =>
        [...previous, data.package].sort(
          (a, b) => a.duration - b.duration
        )
      );

      setName("");
      setDuration("");
      setPrice("");
      setDescription("");

      setSuccess("Rental package added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add rental package"
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- */
  /* Delete Package */
  /* -------------------------------- */

  const handleDelete = async (
    rentalPackage: RentalPackage
  ) => {
    const confirmed = window.confirm(
      `Delete "${rentalPackage.name}" package?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(rentalPackage.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/rental-packages`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            packageId: rentalPackage.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete rental package"
        );
      }

      setPackages((previous) =>
        previous.filter(
          (item) => item.id !== rentalPackage.id
        )
      );

      setSuccess(
        "Rental package deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete rental package"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="border-b p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Rental Packages
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage rental packages and pricing for this vehicle.
          </p>
        </div>

        <span className="text-sm text-muted-foreground">
          {packages.length} package
          {packages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Add Package Form */}
      <form
        onSubmit={handleAdd}
        className="mt-5 space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Package name"
            className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration in days"
            className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={2}
            placeholder="Package description (optional)"
            className="min-w-0 flex-1 resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <button
            type="submit"
            disabled={saving}
            className="h-11 shrink-0 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
          >
            {saving ? "Adding..." : "+ Add Package"}
          </button>
        </div>
      </form>

      {/* Packages List */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading rental packages...
          </p>
        ) : packages.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No rental packages added yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {packages.map((rentalPackage) => (
              <div
                key={rentalPackage.id}
                className="min-w-0 rounded-xl border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="break-words font-semibold">
                      {rentalPackage.name}
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {rentalPackage.duration} day
                      {rentalPackage.duration !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-lg font-bold">
                    ₹
                    {Number(
                      rentalPackage.price
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                {rentalPackage.description && (
                  <p className="mt-4 break-words text-sm leading-6 text-muted-foreground">
                    {rentalPackage.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {rentalPackage.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(rentalPackage)
                    }
                    disabled={
                      deletingId === rentalPackage.id
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === rentalPackage.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
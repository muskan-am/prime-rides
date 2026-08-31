"use client";

import { useEffect, useState } from "react";

type Specification = {
  id: string;
  name: string;
  value: string;
};

type VehicleSpecificationsProps = {
  vehicleId: string;
};

export default function VehicleSpecifications({
  vehicleId,
}: VehicleSpecificationsProps) {
  const [specifications, setSpecifications] = useState<
    Specification[]
  >([]);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------- */
  /* Fetch Specifications */
  /* -------------------------------- */

  const fetchSpecifications = async () => {
    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/specifications`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch specifications"
        );
      }

      setSpecifications(data.specifications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch specifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecifications();
  }, [vehicleId]);

  /* -------------------------------- */
  /* Add Specification */
  /* -------------------------------- */

  const handleAdd = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedValue = value.trim();

    setError("");
    setSuccess("");

    if (!trimmedName) {
      setError("Specification name is required");
      return;
    }

    if (!trimmedValue) {
      setError("Specification value is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/specifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            value: trimmedValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add specification"
        );
      }

      setSpecifications((previous) => [
        ...previous,
        data.specification,
      ]);

      setName("");
      setValue("");

      setSuccess("Specification added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add specification"
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- */
  /* Delete Specification */
  /* -------------------------------- */

  const handleDelete = async (
    specification: Specification
  ) => {
    const confirmed = window.confirm(
      `Delete "${specification.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(specification.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/specifications`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            specificationId: specification.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete specification"
        );
      }

      setSpecifications((previous) =>
        previous.filter(
          (item) => item.id !== specification.id
        )
      );

      setSuccess(
        "Specification deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete specification"
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
            Specifications
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage technical specifications of this vehicle.
          </p>
        </div>

        <span className="text-sm text-muted-foreground">
          {specifications.length} specification
          {specifications.length !== 1 ? "s" : ""}
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

      {/* Add Specification Form */}
      <form
        onSubmit={handleAdd}
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Specification name"
          className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value e.g. 2.8L"
          className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "+ Add"}
        </button>
      </form>

      {/* Specification List */}
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading specifications...
          </p>
        ) : specifications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No specifications added yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            {specifications.map((specification) => (
              <div
                key={specification.id}
                className="flex min-w-0 flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-4">
                  <p className="break-words text-sm text-muted-foreground">
                    {specification.name}
                  </p>

                  <p className="break-words text-sm font-medium">
                    {specification.value}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(specification)
                  }
                  disabled={
                    deletingId === specification.id
                  }
                  className="w-full shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {deletingId === specification.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
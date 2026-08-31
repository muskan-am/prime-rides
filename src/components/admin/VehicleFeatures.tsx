"use client";

import { useEffect, useState } from "react";

type Feature = {
  id: string;
  name: string;
};

type VehicleFeaturesProps = {
  vehicleId: string;
};

export default function VehicleFeatures({
  vehicleId,
}: VehicleFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchFeatures = async () => {
    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/features`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch features"
        );
      }

      setFeatures(data.features || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch features"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [vehicleId]);

  const handleAdd = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Feature name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/features`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add feature"
        );
      }

      setFeatures((previous) => [
        ...previous,
        data.feature,
      ]);

      setName("");
      setSuccess("Feature added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add feature"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (feature: Feature) => {
    const confirmed = window.confirm(
      `Delete "${feature.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(feature.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/features`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            featureId: feature.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete feature"
        );
      }

      setFeatures((previous) =>
        previous.filter(
          (item) => item.id !== feature.id
        )
      );

      setSuccess("Feature deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete feature"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="border-b p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Features
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage features available with this vehicle.
          </p>
        </div>

        <span className="text-sm text-muted-foreground">
          {features.length} feature
          {features.length !== 1 ? "s" : ""}
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

      {/* Add Feature */}
      <form
        onSubmit={handleAdd}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Air Conditioning"
          className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "+ Add Feature"}
        </button>
      </form>

      {/* Features List */}
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading features...
          </p>
        ) : features.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No features added yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border p-4"
              >
                <p className="min-w-0 break-words text-sm font-medium">
                  ✓ {feature.name}
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(feature)}
                  disabled={deletingId === feature.id}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === feature.id
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
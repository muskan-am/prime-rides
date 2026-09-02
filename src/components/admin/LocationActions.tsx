"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LocationActionsProps = {
  id: string;
  name: string;
  isActive: boolean;
  hasBookings: boolean;
  hasInventory: boolean;
};

export default function LocationActions({
  id,
  name,
  isActive,
  hasBookings,
  hasInventory,
}: LocationActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleStatus = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/locations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update location."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "TOGGLE LOCATION ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/locations/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete location."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE LOCATION ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canDelete =
    !hasBookings && !hasInventory;

  return (
    <div className="flex flex-col items-end gap-2">

      <div className="flex flex-wrap justify-end gap-2">

        {/* Edit */}
        <Link
          href={`/admin/locations/${id}/edit`}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Edit
        </Link>

        {/* Active / Inactive */}
        <button
          type="button"
          onClick={toggleStatus}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? "border border-orange-200 text-orange-700 hover:bg-orange-50"
              : "border border-green-200 text-green-700 hover:bg-green-50"
          }`}
        >
          {loading
            ? "Updating..."
            : isActive
              ? "Deactivate"
              : "Activate"}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={deleteLocation}
          disabled={loading || !canDelete}
          title={
            !canDelete
              ? "This location is already in use."
              : "Delete location"
          }
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete
        </button>

      </div>

      {/* Usage warning */}
      {!canDelete && (
        <p className="text-right text-xs text-muted-foreground">
          Cannot delete: location is in use.
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}
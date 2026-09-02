"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PickupOptionActionsProps = {
  id: string;
  name: string;
  isActive: boolean;
  hasBookings: boolean;
};

export default function PickupOptionActions({
  id,
  name,
  isActive,
  hasBookings,
}: PickupOptionActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggleStatus() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/pickup-options/${id}`,
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
          data.error || "Failed to update status."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Toggle pickup option error:",
        error
      );

      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePickupOption() {
    if (hasBookings) {
      setError(
        "This pickup option has existing bookings. Deactivate it instead."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/pickup-options/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to delete pickup option."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Delete pickup option error:",
        error
      );

      setError("Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex shrink-0 flex-wrap gap-2">

        {/* Edit */}
        <Link
          href={`/admin/pickup-options/${id}/edit`}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Edit
        </Link>

        {/* Activate / Deactivate */}
        <button
          type="button"
          onClick={toggleStatus}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
          onClick={deletePickupOption}
          disabled={loading || hasBookings}
          title={
            hasBookings
              ? "Cannot delete a pickup option used by bookings"
              : "Delete pickup option"
          }
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>

      </div>

      {hasBookings && (
        <p className="text-xs text-muted-foreground">
          Delete unavailable — used by bookings
        </p>
      )}

      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
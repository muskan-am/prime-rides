"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type PickupOption = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: {
    bookings: number;
  };
};

export default function EditPickupOptionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [pickupOption, setPickupOption] =
    useState<PickupOption | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPickupOption() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/pickup-options/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error || "Failed to load pickup option."
          );
          return;
        }

        setPickupOption(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setIsActive(data.isActive ?? true);
      } catch (error) {
        console.error(
          "Fetch pickup option error:",
          error
        );

        setError(
          "Something went wrong while loading the pickup option."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPickupOption();
    }
  }, [id]);

  const bookingCount =
    pickupOption?._count?.bookings ?? 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Pickup option name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/pickup-options/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to update pickup option."
        );
        return;
      }

      // Update successful → redirect to listing page
      router.push("/admin/pickup-options");
    } catch (error) {
      console.error(
        "Update pickup option error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pickupOption) {
      return;
    }

    if (bookingCount > 0) {
      setError(
        "This pickup option cannot be deleted because it is used by existing bookings. Deactivate it instead."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${pickupOption.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
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

      router.push("/admin/pickup-options");
    } catch (error) {
      console.error(
        "Delete pickup option error:",
        error
      );

      setError(
        "Something went wrong while deleting."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading pickup option...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!pickupOption) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <Link
            href="/admin/pickup-options"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to Pickup Options
          </Link>

          <div className="mt-8 rounded-2xl border bg-card p-8 text-center">

            <p className="font-medium">
              Pickup option not found
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div>
          <Link
            href="/admin/pickup-options"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to Pickup Options
          </Link>

          <p className="mt-4 text-sm text-muted-foreground">
            Prime Rides Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Edit Pickup Option
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Update pickup option details and status.
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 rounded-2xl border bg-card p-6 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium"
              >
                Pickup Option Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                disabled={saving || deleting}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                disabled={saving || deleting}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">

              <div>
                <p className="text-sm font-medium">
                  Active Status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active options are available for customer bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsActive(!isActive)
                }
                disabled={saving || deleting}
                className={`relative h-6 w-11 rounded-full transition ${
                  isActive
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                aria-label="Toggle active status"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    isActive
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* Status */}
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            {/* Booking Info */}
            <div className="rounded-lg border bg-muted/20 p-4">

              <p className="text-sm font-medium">
                Existing Bookings
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                This pickup option is used by{" "}
                <span className="font-semibold text-foreground">
                  {bookingCount}
                </span>{" "}
                booking
                {bookingCount === 1 ? "" : "s"}.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

              {/* Delete */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  deleting ||
                  saving ||
                  bookingCount > 0
                }
                className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Pickup Option"}
              </button>

              {/* Right buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/admin/pickup-options"
                  className="rounded-lg border px-5 py-2.5 text-center text-sm font-medium transition hover:bg-muted"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>
    </main>
  );
}
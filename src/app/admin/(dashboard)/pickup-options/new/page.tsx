"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPickupOptionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Pickup option name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/pickup-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create pickup option.");
        return;
      }

      router.push("/admin/pickup-options");
      router.refresh();
    } catch (error) {
      console.error("Create pickup option error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Add Pickup Option
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a new pickup option for customer bookings.
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
                placeholder="e.g. Airport Pickup"
                className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                disabled={loading}
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
                placeholder="Enter pickup option description"
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">

              <div>
                <p className="text-sm font-medium">
                  Active Status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active pickup options will be available for bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={loading}
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

            {/* Status Text */}
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

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                href="/admin/pickup-options"
                className="rounded-lg border px-5 py-2.5 text-center text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating..."
                  : "Create Pickup Option"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </main>
  );
}
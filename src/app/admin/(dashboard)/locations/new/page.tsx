"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewLocationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Location name is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/locations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            address: address.trim() || null,
            phone: phone.trim() || null,
            latitude: latitude || null,
            longitude: longitude || null,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create location."
        );
        return;
      }

      setSuccess(
        "Location created successfully."
      );

      setTimeout(() => {
        router.push("/admin/locations");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "CREATE LOCATION ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <Link
          href="/admin/locations"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Locations
        </Link>

        {/* Header */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Prime Rides Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Add Location
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a new pickup and rental location.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border bg-card p-6 sm:p-8"
        >
          <div className="space-y-6">

            {/* Location Name */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Location Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Delhi Main Branch"
                disabled={loading}
                required
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="text-sm font-medium"
              >
                Address
              </label>

              <textarea
                id="address"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter complete location address"
                disabled={loading}
                rows={3}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium"
              >
                Contact Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="e.g. 9876543210"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Coordinates */}
            <div>
              <h2 className="text-sm font-semibold">
                Geographic Coordinates
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Optional. You can add latitude and
                longitude for future maps integration.
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">

                {/* Latitude */}
                <div>
                  <label
                    htmlFor="latitude"
                    className="text-sm font-medium"
                  >
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(event) =>
                      setLatitude(event.target.value)
                    }
                    placeholder="e.g. 28.6139"
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label
                    htmlFor="longitude"
                    className="text-sm font-medium"
                  >
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(event) =>
                      setLongitude(event.target.value)
                    }
                    placeholder="e.g. 77.2090"
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

              </div>
            </div>

            {/* Active Status */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-medium">
                    Location Status
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Active locations can be selected
                    during vehicle booking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsActive((current) => !current)
                  }
                  disabled={loading}
                  className={`relative h-6 w-11 rounded-full transition ${
                    isActive
                      ? "bg-black"
                      : "bg-muted"
                  }`}
                  aria-label="Toggle location status"
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

              <p className="mt-2 text-xs font-medium">
                {isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                href="/admin/locations"
                className="inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create Location"}
              </button>

            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
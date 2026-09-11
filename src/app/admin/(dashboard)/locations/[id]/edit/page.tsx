"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type LocationData = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  isActive: boolean;
};

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------- */
  /* Load Location */
  /* -------------------------------- */

  useEffect(() => {
    if (!id) {
      setError("Location ID is missing.");
      setLoading(false);
      return;
    }

    const loadLocation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/locations/${id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to fetch location."
          );
          return;
        }

        const location: LocationData =
          data.location;

        setName(location.name || "");
        setAddress(location.address || "");
        setPhone(location.phone || "");

        setLatitude(
          location.latitude !== null &&
          location.latitude !== undefined
            ? String(location.latitude)
            : ""
        );

        setLongitude(
          location.longitude !== null &&
          location.longitude !== undefined
            ? String(location.longitude)
            : ""
        );

        setIsActive(location.isActive);
      } catch (error) {
        console.error(
          "LOAD LOCATION ERROR:",
          error
        );

        setError(
          "Something went wrong while loading the location."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [id]);

  /* -------------------------------- */
  /* Update Location */
  /* -------------------------------- */

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

    if (!id) {
      setError("Location ID is missing.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/locations/${id}`,
        {
          method: "PATCH",
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
            "Failed to update location."
        );
        return;
      }

      setSuccess(
        "Location updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/locations");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "UPDATE LOCATION ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- */
  /* Loading */
  /* -------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">
            Loading location...
          </p>
        </div>
      </main>
    );
  }

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
            Edit Location
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update pickup and rental location details.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        {!error && (
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                  className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Coordinates */}
              <div>
                <h2 className="text-sm font-semibold">
                  Geographic Coordinates
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Optional location coordinates.
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
                        setLatitude(
                          event.target.value
                        )
                      }
                      disabled={saving}
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
                        setLongitude(
                          event.target.value
                        )
                      }
                      disabled={saving}
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
                      Inactive locations cannot be
                      selected for new bookings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsActive(
                        (current) => !current
                      )
                    }
                    disabled={saving}
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
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Updating..."
                    : "Update Location"}
                </button>

              </div>

            </div>
          </form>
        )}

      </div>
    </main>
  );
}
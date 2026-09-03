"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type TaxConfiguration = {
  id: string;
  name: string;
  rate: string | number;
  isActive: boolean;
};

export default function EditTaxConfigurationPage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================
     Fetch Tax Configuration
  ========================================= */

  useEffect(() => {
    if (!id) {
      setError(
        "Tax configuration ID is missing."
      );
      setLoading(false);
      return;
    }

    const fetchTaxConfiguration =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response = await fetch(
            `/api/admin/tax-configurations/${id}`
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Failed to fetch tax configuration."
            );
          }

          const tax: TaxConfiguration =
            data.taxConfiguration;

          setName(tax.name);
          setRate(String(tax.rate));
          setIsActive(tax.isActive);
        } catch (err) {
          console.error(
            "Fetch Tax Configuration Error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchTaxConfiguration();
  }, [id]);

  /* =========================================
     Submit
  ========================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    const numericRate =
      Number(rate);

    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    if (!trimmedName) {
      setError(
        "Tax configuration name is required."
      );
      return;
    }

    if (!rate.trim()) {
      setError(
        "Tax rate is required."
      );
      return;
    }

    if (
      Number.isNaN(numericRate) ||
      numericRate < 0 ||
      numericRate > 100
    ) {
      setError(
        "Tax rate must be between 0 and 100."
      );
      return;
    }

    if (!id) {
      setError(
        "Tax configuration ID is missing."
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          `/api/admin/tax-configurations/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: trimmedName,
              rate: numericRate,
              isActive,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update tax configuration."
        );
      }

      router.push(
        "/admin/tax-configurations"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Update Tax Configuration Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     Loading State
  ========================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading tax configuration...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================
     Render
  ========================================= */

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-2xl">

        {/* =====================================
            Header
        ===================================== */}

        <div className="mb-6">
          <Link
            href="/admin/tax-configurations"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Tax Configuration
          </Link>

          <p className="mt-6 text-sm text-muted-foreground">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Edit Tax Configuration
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the tax rate used for new bookings.
          </p>
        </div>

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* =====================================
            Form
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 sm:p-8"
        >
          <div className="space-y-6">

            {/* Tax Name */}

            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Tax Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Example: GST"
                disabled={saving}
                required
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Tax Rate */}

            <div>
              <label
                htmlFor="rate"
                className="text-sm font-medium"
              >
                Tax Rate (%)
              </label>

              <div className="relative mt-2">
                <input
                  id="rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={rate}
                  onChange={(event) =>
                    setRate(
                      event.target.value
                    )
                  }
                  placeholder="18"
                  disabled={saving}
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Enter a value between 0% and 100%.
              </p>
            </div>

            {/* Active Status */}

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-medium">
                    Active
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Active tax will be applied to new bookings.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  disabled={saving}
                  onClick={() =>
                    setIsActive(
                      (current) =>
                        !current
                    )
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    isActive
                      ? "bg-black"
                      : "bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
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
            </div>

            {/* Buttons */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                href="/admin/tax-configurations"
                className="inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Updating..."
                  : "Update Tax"}
              </button>

            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
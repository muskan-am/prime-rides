"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TaxConfiguration = {
  id: string;
  name: string;
  rate: string | number;
  isActive: boolean;
  createdAt: string;
};

export default function TaxConfigurationsPage() {
  const [taxConfigurations, setTaxConfigurations] =
    useState<TaxConfiguration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /* =========================================
     Fetch Tax Configurations
  ========================================= */

  const fetchTaxConfigurations =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/tax-configurations"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to fetch tax configurations."
          );
        }

        setTaxConfigurations(
          data.taxConfigurations || []
        );
      } catch (err) {
        console.error(
          "Fetch Tax Configurations Error:",
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

  /* =========================================
     Initial Load
  ========================================= */

  useEffect(() => {
    fetchTaxConfigurations();
  }, []);

  /* =========================================
     Delete
  ========================================= */

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tax configuration?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/tax-configurations/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete tax configuration."
        );
      }

      setTaxConfigurations(
        (current) =>
          current.filter(
            (item) => item.id !== id
          )
      );
    } catch (err) {
      console.error(
        "Delete Tax Configuration Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================
     Render
  ========================================= */

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================
            Header
        ===================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Tax Configuration
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage the tax rate used for bookings.
            </p>
          </div>

          <Link
            href="/admin/tax-configurations/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            + Add Tax
          </Link>
        </div>

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* =====================================
            Loading
        ===================================== */}

        {loading ? (
          <div className="mt-6 rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading tax configurations...
            </p>
          </div>
        ) : taxConfigurations.length ===
          0 ? (
          /* ===================================
             Empty State
          =================================== */

          <div className="mt-6 rounded-xl border border-dashed bg-card p-10 text-center">
            <h2 className="font-semibold">
              No tax configuration found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add a tax configuration to apply
              tax to new bookings.
            </p>

            <Link
              href="/admin/tax-configurations/new"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add Tax Configuration
            </Link>
          </div>
        ) : (
          /* ===================================
             Tax Configuration List
          =================================== */

          <div className="mt-6 overflow-hidden rounded-xl border bg-card">

            {/* Desktop Header */}

            <div className="hidden grid-cols-[1fr_160px_140px_180px] border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Name</span>
              <span>Tax Rate</span>
              <span>Status</span>
              <span className="text-right">
                Actions
              </span>
            </div>

            {/* Rows */}

            <div className="divide-y">
              {taxConfigurations.map(
                (tax) => (
                  <div
                    key={tax.id}
                    className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[1fr_160px_140px_180px] md:items-center"
                  >

                    {/* Name */}

                    <div>
                      <p className="font-semibold">
                        {tax.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(
                          tax.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    {/* Rate */}

                    <div>
                      <p className="text-xs text-muted-foreground md:hidden">
                        Tax Rate
                      </p>

                      <p className="mt-1 font-semibold md:mt-0">
                        {Number(
                          tax.rate
                        ).toLocaleString(
                          "en-IN"
                        )}
                        %
                      </p>
                    </div>

                    {/* Status */}

                    <div>
                      <p className="text-xs text-muted-foreground md:hidden">
                        Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold md:mt-0 ${
                          tax.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tax.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}

                    <div className="flex items-center justify-start gap-2 md:justify-end">

                      <Link
                        href={`/admin/tax-configurations/${tax.id}/edit`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          tax.id
                        }
                        onClick={() =>
                          handleDelete(
                            tax.id
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        tax.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* =====================================
            Information
        ===================================== */}

        {!loading &&
          taxConfigurations.some(
            (tax) => tax.isActive
          ) && (
            <div className="mt-5 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm">
                <span className="font-semibold">
                  Active tax:
                </span>{" "}
                {
                  taxConfigurations.find(
                    (tax) =>
                      tax.isActive
                  )?.name
                }{" "}
                (
                {
                  Number(
                    taxConfigurations.find(
                      (tax) =>
                        tax.isActive
                    )?.rate
                  ).toLocaleString(
                    "en-IN"
                  )}
                %)
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                This active tax configuration
                will be used when creating new
                bookings.
              </p>
            </div>
          )}

      </div>
    </main>
  );
}
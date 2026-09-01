"use client";

import { useEffect, useState } from "react";

type MonthlyPlan = {
  id: string;
  name: string;
  months: number;
  price: string | number;
  isActive: boolean;
};

type MonthlyPlansProps = {
  vehicleId: string;
};

export default function MonthlyPlans({
  vehicleId,
}: MonthlyPlansProps) {
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);

  const [name, setName] = useState("");
  const [months, setMonths] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------- */
  /* Fetch Plans */
  /* -------------------------------- */

  const fetchPlans = async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/monthly-plans`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch monthly plans"
        );
      }

      setPlans(data.plans || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch monthly plans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [vehicleId]);

  /* -------------------------------- */
  /* Add Plan */
  /* -------------------------------- */

  const handleAdd = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const numericMonths = Number(months);
    const numericPrice = Number(price);

    setError("");
    setSuccess("");

    if (!trimmedName) {
      setError("Plan name is required");
      return;
    }

    if (
      !Number.isInteger(numericMonths) ||
      numericMonths <= 0
    ) {
      setError("Months must be a positive number");
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Enter a valid plan price");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/monthly-plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            months: numericMonths,
            price: numericPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add monthly plan"
        );
      }

      setPlans((previous) =>
        [...previous, data.plan].sort(
          (a, b) => a.months - b.months
        )
      );

      setName("");
      setMonths("");
      setPrice("");

      setSuccess("Monthly plan added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add monthly plan"
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- */
  /* Delete Plan */
  /* -------------------------------- */

  const handleDelete = async (
    plan: MonthlyPlan
  ) => {
    const confirmed = window.confirm(
      `Delete "${plan.name}" monthly plan?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(plan.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/monthly-plans`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete monthly plan"
        );
      }

      setPlans((previous) =>
        previous.filter(
          (item) => item.id !== plan.id
        )
      );

      setSuccess(
        "Monthly plan deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete monthly plan"
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
            Monthly Plans
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage long-term monthly rental plans for this vehicle.
          </p>
        </div>

        <span className="text-sm text-muted-foreground">
          {plans.length} plan
          {plans.length !== 1 ? "s" : ""}
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

      {/* Add Plan */}
      <form
        onSubmit={handleAdd}
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plan name"
          className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <input
          type="number"
          min="1"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Months"
          className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="h-11 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "+ Add Plan"}
        </button>
      </form>

      {/* Plans List */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading monthly plans...
          </p>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No monthly plans added yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="min-w-0 rounded-xl border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="break-words font-semibold">
                      {plan.name}
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.months} month
                      {plan.months !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-lg font-bold">
                    ₹
                    {Number(plan.price).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {plan.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(plan)}
                    disabled={
                      deletingId === plan.id
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === plan.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
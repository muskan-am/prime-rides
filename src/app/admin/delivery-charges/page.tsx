"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DeliveryCharge = {
  id: string;
  charge: string | number;
  isActive: boolean;
  location: {
    id: string;
    name: string;
    address: string;
  };
};

export default function DeliveryChargesPage() {
  const [deliveryCharges, setDeliveryCharges] = useState<
    DeliveryCharge[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeliveryCharges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/delivery-charges");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch delivery charges"
        );
      }

      setDeliveryCharges(data.deliveryCharges || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery charge?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/delivery-charges/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete delivery charge"
        );
      }

      setDeliveryCharges((prev) =>
        prev.filter((charge) => charge.id !== id)
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete delivery charge"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading delivery charges...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Delivery Charges
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage delivery charges for each location.
          </p>
        </div>

        <Link
          href="/admin/delivery-charges/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Delivery Charge
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && deliveryCharges.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold">
            No delivery charges found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add a delivery charge for your locations.
          </p>

          <Link
            href="/admin/delivery-charges/new"
            className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Add Delivery Charge
          </Link>
        </div>
      )}

      {/* Table */}
      {!error && deliveryCharges.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold">
                    Location
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Address
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Delivery Charge
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {deliveryCharges.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {item.location.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.location.address}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      ₹{Number(item.charge).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/delivery-charges/${item.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
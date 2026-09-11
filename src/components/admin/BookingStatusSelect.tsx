"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type Props = {
  bookingId: string;
  currentStatus: BookingStatus;
};

export default function BookingStatusSelect({
  bookingId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = event.target.value as BookingStatus;

    if (newStatus === status) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update booking status");
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update booking status"
      );
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 shadow-xs"
      >
        <option value="PENDING">Pending Review</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      {loading && (
        <span className="text-[11px] font-semibold text-blue-600 animate-pulse">Updating...</span>
      )}
    </div>
  );
}
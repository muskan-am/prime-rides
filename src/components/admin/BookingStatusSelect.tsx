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

  const [status, setStatus] =
    useState<BookingStatus>(currentStatus);

  const [loading, setLoading] = useState(false);

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus =
      event.target.value as BookingStatus;

    if (newStatus === status) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update booking status"
        );
      }

      setStatus(newStatus);

      router.refresh();
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

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
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Booking Status
      </label>

      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="PENDING">
          Pending
        </option>

        <option value="CONFIRMED">
          Confirmed
        </option>

        <option value="COMPLETED">
          Completed
        </option>

        <option value="CANCELLED">
          Cancelled
        </option>
      </select>

      {loading && (
        <p className="text-xs text-muted-foreground">
          Updating status...
        </p>
      )}
    </div>
  );
}
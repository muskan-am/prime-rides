import { prisma } from "@/lib/prisma";

/**
 * Retrieves the list of vehicle IDs that are unavailable due to overlapping
 * PENDING or CONFIRMED bookings for the exact DateTime range requested.
 *
 * Overlap condition:
 * booking.startDate < requestedEnd AND booking.endDate > requestedStart
 *
 * Excludes CANCELLED bookings.
 * Allows back-to-back rentals when an existing booking ends exactly when the new booking starts.
 */
export async function getUnavailableVehicleIds(
  startDateTime: Date,
  endDateTime: Date,
  excludeBookingId?: string
): Promise<string[]> {
  if (!startDateTime || !endDateTime || isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return [];
  }

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startDate: { lt: endDateTime },
      endDate: { gt: startDateTime },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { vehicleId: true },
  });

  return Array.from(new Set(overlappingBookings.map((b) => b.vehicleId)));
}

/**
 * Checks whether a single vehicle is available for the given DateTime range.
 */
export async function checkVehicleAvailability(
  vehicleId: string,
  startDateTime: Date,
  endDateTime: Date,
  options?: {
    excludeBookingId?: string;
    currentUserId?: string;
    pendingGraceMinutes?: number;
  }
): Promise<{ isAvailable: boolean; reason?: string }> {
  // 1. Check vehicle base status
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      availabilityStatus: true,
      maintenanceStatus: true,
    },
  });

  if (!vehicle) {
    return { isAvailable: false, reason: "Vehicle not found." };
  }

  if (vehicle.availabilityStatus !== "AVAILABLE") {
    return {
      isAvailable: false,
      reason: "This vehicle is currently marked as unavailable for booking.",
    };
  }

  if (vehicle.maintenanceStatus !== "GOOD") {
    return {
      isAvailable: false,
      reason: "This vehicle is currently undergoing maintenance and cannot be booked.",
    };
  }

  // 2. Check for overlapping bookings
  const graceMinutes = options?.pendingGraceMinutes ?? 15;
  const pendingCutoff = new Date(Date.now() - graceMinutes * 60 * 1000);

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      vehicleId,
      startDate: { lt: endDateTime },
      endDate: { gt: startDateTime },
      ...(options?.excludeBookingId ? { id: { not: options.excludeBookingId } } : {}),
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING",
          ...(options?.currentUserId ? { userId: { not: options.currentUserId } } : {}),
          createdAt: { gte: pendingCutoff },
        },
      ],
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  if (conflictingBooking) {
    return {
      isAvailable: false,
      reason: "This vehicle is already booked for the selected date and time range.",
    };
  }

  return { isAvailable: true };
}

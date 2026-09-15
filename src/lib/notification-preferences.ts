import { prisma } from "@/lib/prisma";

export const NOTIFICATION_TYPE_TO_PREFERENCE_KEY: Record<string, string> = {
  BOOKING_CREATED: "bookingCreated",
  PAYMENT_PENDING: "paymentPending",
  PAYMENT_SUCCESS: "paymentSuccess",
  BOOKING_CONFIRMED: "bookingConfirmed",
  BOOKING_CANCELLED: "bookingCancelled",
  BOOKING_COMPLETED: "bookingCompleted",
  ADMIN_NEW_BOOKING: "adminNewBooking",
  ADMIN_PAYMENT_RECEIVED: "adminPaymentReceived",
  ADMIN_BOOKING_CANCELLED: "adminBookingCancelled",
};

export const ALLOWED_PREFERENCE_FIELDS = [
  "bookingCreated",
  "paymentPending",
  "paymentSuccess",
  "bookingConfirmed",
  "bookingCancelled",
  "bookingCompleted",
  "adminNewBooking",
  "adminPaymentReceived",
  "adminBookingCancelled",
] as const;

export type PreferenceField = (typeof ALLOWED_PREFERENCE_FIELDS)[number];

/**
 * Checks if a specific notification type is enabled for a given user.
 * Implements failure isolation: defaults to true (enabled) if lookups fail or preference record doesn't exist.
 */
export async function isNotificationEnabled({
  userId,
  type,
}: {
  userId: string;
  type: string;
}): Promise<boolean> {
  try {
    const key = NOTIFICATION_TYPE_TO_PREFERENCE_KEY[type];

    // If type is unknown or not mapped to a preference field, default to enabled
    if (!key) {
      return true;
    }

    const pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // If no preference record exists yet, default to enabled (true)
    if (!pref) {
      return true;
    }

    // Return the boolean value of the mapped field (or true if undefined)
    const isEnabled = (pref as Record<string, any>)[key];
    return typeof isEnabled === "boolean" ? isEnabled : true;
  } catch (error) {
    console.error("Error checking notification preference (isolated fallback to enabled):", error);
    return true;
  }
}

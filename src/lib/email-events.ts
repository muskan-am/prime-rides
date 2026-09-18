import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  bookingCreatedEmailTemplate,
  paymentPendingEmailTemplate,
  paymentSuccessEmailTemplate,
  bookingConfirmedEmailTemplate,
} from "@/lib/email-templates";

/**
 * Sends Booking Created email to the customer and active admin users.
 *
 * Authoritative booking data is fetched directly from PostgreSQL.
 * Email failures are isolated so they never break booking execution.
 */
export async function sendBookingCreatedEmails(
  bookingId: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking) {
      console.warn(
        `[sendBookingCreatedEmails] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendBookingCreatedEmails] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    const customerHtml = bookingCreatedEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      pickupLocation: booking.location.name,
      pickupOption: booking.pickupOption?.name || undefined,
      startDate: booking.startDate,
      endDate: booking.endDate,
      rentalAmount: Number(booking.rentalAmount),
      deliveryCharge: Number(booking.deliveryCharge),
      taxAmount: Number(booking.taxAmount),
      discountAmount: Number(booking.discountAmount),
      totalAmount: Number(booking.totalAmount),
      paymentStatus: booking.paymentStatus,
    });

    // -----------------------------------------
    // 1. Send to Customer
    // -----------------------------------------

    const customerResult = await sendEmail({
      to: booking.user.email,
      subject: `Booking Received - ${booking.id} | Prime Rides`,
      html: customerHtml,
    });

    if (!customerResult.success) {
      console.error(
        `[sendBookingCreatedEmails] Failed to send customer email for booking ${booking.id}:`,
        customerResult.error
      );
    }

    // -----------------------------------------
    // 2. Send to Active Admins
    // -----------------------------------------

    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          email: {
            not: "",
          },
        },
        select: {
          email: true,
        },
      });

      const adminEmails = adminUsers
        .map((user) => user.email)
        .filter((email): email is string => Boolean(email));

      if (adminEmails.length > 0) {
        await sendEmail({
          to: adminEmails,
          subject: `[ADMIN] New Booking Received - ${booking.id}`,
          html: customerHtml,
        });
      }
    } catch (adminError) {
      console.error(
        `[sendBookingCreatedEmails] Failed to send admin emails for booking ${booking.id}:`,
        adminError
      );
    }
  } catch (error) {
    console.error(
      `[sendBookingCreatedEmails] Error processing booking created emails for ID ${bookingId}:`,
      error
    );
  }
}

/**
 * Sends Payment Pending email to the customer.
 *
 * Authoritative booking data is fetched directly from PostgreSQL.
 * Email failures are isolated so they never break booking execution.
 */
export async function sendPaymentPendingEmail(
  bookingId: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        vehicle: true,
      },
    });

    if (!booking) {
      console.warn(
        `[sendPaymentPendingEmail] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendPaymentPendingEmail] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    const html = paymentPendingEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      totalAmount: Number(booking.totalAmount),
    });

    const result = await sendEmail({
      to: booking.user.email,
      subject: `Action Required: Payment Pending for Booking ${booking.id} | Prime Rides`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendPaymentPendingEmail] Failed to send payment pending email for booking ${booking.id}:`,
        result.error
      );
    }
  } catch (error) {
    console.error(
      `[sendPaymentPendingEmail] Error processing payment pending email for ID ${bookingId}:`,
      error
    );
  }
}

/**
 * Sends Payment Successful email to the customer.
 *
 * This function fetches the latest authoritative booking data
 * directly from PostgreSQL after successful payment verification.
 *
 * The email is triggered only after the payment transaction has
 * successfully updated the booking/payment records.
 *
 * Email failures are isolated and never break the payment flow.
 */
export async function sendPaymentSuccessEmail(
  bookingId: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking) {
      console.warn(
        `[sendPaymentSuccessEmail] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendPaymentSuccessEmail] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    /*
     * IMPORTANT:
     * PaymentSuccessEmailData currently accepts only the fields
     * supported by paymentSuccessEmailTemplate().
     *
     * Do not pass pickupLocation, pickupOption, startDate,
     * endDate, rentalAmount, taxAmount, etc. unless those fields
     * are explicitly added to the template's data type.
     */
    const html = paymentSuccessEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      amountPaid: Number(booking.totalAmount),
      paymentStatus: booking.paymentStatus || "SUCCESS",
    });

    const result = await sendEmail({
      to: booking.user.email,
      subject: `Payment Successful - Booking ${booking.id} | Prime Rides`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendPaymentSuccessEmail] Failed to send payment success email for booking ${booking.id}:`,
        result.error
      );

      return;
    }

    console.log(
      `[sendPaymentSuccessEmail] Payment success email sent for booking ${booking.id}`
    );
  } catch (error) {
    console.error(
      `[sendPaymentSuccessEmail] Error processing payment success email for ID ${bookingId}:`,
      error
    );
  }
}

/**
 * Sends Booking Confirmed email to the customer.
 *
 * This function fetches the latest authoritative booking data
 * directly from PostgreSQL after successful booking confirmation.
 *
 * Email failures are isolated and never break payment/booking flows.
 */
export async function sendBookingConfirmedEmail(
  bookingId: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking) {
      console.warn(
        `[sendBookingConfirmedEmail] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendBookingConfirmedEmail] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    const html = bookingConfirmedEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      pickupLocation: booking.location.name,
      pickupOption: booking.pickupOption?.name || undefined,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: Number(booking.totalAmount),
    });

    const result = await sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmed - Booking ${booking.id} | Prime Rides`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendBookingConfirmedEmail] Failed to send booking confirmed email for booking ${booking.id}:`,
        result.error
      );
      return;
    }

    console.log(
      `[sendBookingConfirmedEmail] Booking confirmed email sent for booking ${booking.id}`
    );
  } catch (error) {
    console.error(
      `[sendBookingConfirmedEmail] Error processing booking confirmed email for ID ${bookingId}:`,
      error
    );
  }
}
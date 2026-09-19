import "server-only";

import { prisma } from "@/lib/prisma";
import { sendTrackedEmail } from "@/lib/email-log";
import {
  bookingCreatedEmailTemplate,
  paymentPendingEmailTemplate,
  paymentSuccessEmailTemplate,
  bookingConfirmedEmailTemplate,
  bookingCancelledEmailTemplate,
  bookingCompletedEmailTemplate,
  newEnquiryEmailTemplate,
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

    const customerResult = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "BOOKING_CREATED",
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
        await sendTrackedEmail({
          bookingId: booking.id,
          recipient: adminEmails,
          type: "ADMIN_BOOKING_CREATED",
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

    const result = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "PAYMENT_PENDING",
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

    const html = paymentSuccessEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      amountPaid: Number(booking.totalAmount),
      paymentStatus: booking.paymentStatus || "SUCCESS",
    });

    const result = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "PAYMENT_SUCCESS",
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

    const result = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "BOOKING_CONFIRMED",
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

/**
 * Sends Booking Cancelled email to the customer.
 *
 * This function fetches the latest authoritative booking data
 * directly from PostgreSQL after successful booking cancellation.
 *
 * Email failures are isolated and never break booking cancellation flows.
 */
export async function sendBookingCancelledEmail(
  bookingId: string,
  cancellationMessage?: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        vehicle: true,
        location: true,
        pickupOption: true,
        payment: {
          include: {
            refunds: true,
          },
        },
      },
    });

    if (!booking) {
      console.warn(
        `[sendBookingCancelledEmail] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendBookingCancelledEmail] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    let refundStatus: string | undefined = undefined;
    if (booking.payment?.refunds && booking.payment.refunds.length > 0) {
      refundStatus = booking.payment.refunds[0].status;
    } else if (booking.payment?.status === "REFUNDED") {
      refundStatus = "REFUNDED";
    }

    const html = bookingCancelledEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      cancellationMessage,
      refundStatus,
    });

    const result = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "BOOKING_CANCELLED",
      subject: `Booking Cancelled - Booking ${booking.id} | Prime Rides`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendBookingCancelledEmail] Failed to send booking cancelled email for booking ${booking.id}:`,
        result.error
      );
      return;
    }

    console.log(
      `[sendBookingCancelledEmail] Booking cancelled email sent for booking ${booking.id}`
    );
  } catch (error) {
    console.error(
      `[sendBookingCancelledEmail] Error processing booking cancelled email for ID ${bookingId}:`,
      error
    );
  }
}

/**
 * Sends Booking Completed email to the customer.
 *
 * This function fetches the latest authoritative booking data
 * directly from PostgreSQL after successful booking completion.
 *
 * Email failures are isolated and never break booking completion flows.
 */
export async function sendBookingCompletedEmail(
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
        `[sendBookingCompletedEmail] Booking not found for ID: ${bookingId}`
      );
      return;
    }

    if (!booking.user?.email) {
      console.warn(
        `[sendBookingCompletedEmail] User email missing for booking ID: ${bookingId}`
      );
      return;
    }

    const vehicleName = `${booking.vehicle.brand} ${
      booking.vehicle.model
    }${booking.vehicle.variant ? " " + booking.vehicle.variant : ""}`;

    const html = bookingCompletedEmailTemplate({
      customerName: booking.user.name || "Valued Customer",
      bookingId: booking.id,
      vehicleName,
      startDate: booking.startDate,
      endDate: booking.endDate,
    });

    const result = await sendTrackedEmail({
      userId: booking.userId,
      bookingId: booking.id,
      recipient: booking.user.email,
      type: "BOOKING_COMPLETED",
      subject: `Booking Completed - Booking ${booking.id} | Prime Rides`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendBookingCompletedEmail] Failed to send booking completed email for booking ${booking.id}:`,
        result.error
      );
      return;
    }

    console.log(
      `[sendBookingCompletedEmail] Booking completed email sent for booking ${booking.id}`
    );
  } catch (error) {
    console.error(
      `[sendBookingCompletedEmail] Error processing booking completed email for ID ${bookingId}:`,
      error
    );
  }
}

/**
 * Sends New Enquiry email notification to active admin users.
 *
 * Authoritative enquiry data is fetched directly from PostgreSQL.
 * Email failures are isolated and never break enquiry creation.
 */
export async function sendNewEnquiryEmail(
  enquiryId: string
): Promise<void> {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: {
        user: true,
      },
    });

    if (!enquiry) {
      console.warn(
        `[sendNewEnquiryEmail] Enquiry not found for ID: ${enquiryId}`
      );
      return;
    }

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

    if (adminEmails.length === 0) {
      console.warn(
        `[sendNewEnquiryEmail] No admin email addresses found for enquiry ID: ${enquiryId}`
      );
      return;
    }

    const html = newEnquiryEmailTemplate({
      name: enquiry.name || "Guest Customer",
      mobile: enquiry.mobile || "N/A",
      email: enquiry.email || "N/A",
      message: enquiry.message,
      createdAt: enquiry.createdAt,
    });

    const result = await sendTrackedEmail({
      userId: enquiry.userId || undefined,
      recipient: adminEmails,
      type: "NEW_ENQUIRY",
      subject: `[ADMIN] New Customer Enquiry - ${enquiry.name || "Guest"}`,
      html,
    });

    if (!result.success) {
      console.error(
        `[sendNewEnquiryEmail] Failed to send new enquiry email for ID ${enquiry.id}:`,
        result.error
      );
      return;
    }

    console.log(
      `[sendNewEnquiryEmail] New enquiry email sent for ID ${enquiry.id}`
    );
  } catch (error) {
    console.error(
      `[sendNewEnquiryEmail] Error processing new enquiry email for ID ${enquiryId}:`,
      error
    );
  }
}
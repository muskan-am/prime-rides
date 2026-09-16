import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email";
import {
  renderBookingCreatedCustomerEmail,
  renderBookingCreatedAdminEmail,
  renderPaymentSuccessCustomerEmail,
  renderPaymentSuccessAdminEmail,
  renderBookingConfirmedCustomerEmail,
  renderBookingCancelledCustomerEmail,
  renderBookingCompletedCustomerEmail,
  renderPaymentPendingCustomerEmail,
  renderNewEnquiryAdminEmail,
} from "./email-templates";

/**
 * Checks if a successful email log already exists to prevent duplicate transactional emails.
 */
async function isDuplicateEmail(
  entityKey: { bookingId?: string; enquiryId?: string },
  type: string,
  recipient: string
): Promise<boolean> {
  try {
    const existing = await prisma.emailLog.findFirst({
      where: {
        bookingId: entityKey.bookingId || null,
        enquiryId: entityKey.enquiryId || null,
        type,
        recipient,
        status: "SENT",
      },
    });
    return Boolean(existing);
  } catch (error) {
    console.error("[Email Events] Deduplication Check Error:", error);
    return false;
  }
}

/**
 * Records email audit log entry in DB with isolated error handling.
 */
async function recordEmailLog(data: {
  userId?: string | null;
  bookingId?: string | null;
  enquiryId?: string | null;
  type: string;
  recipient: string;
  subject: string;
  status: "SENT" | "FAILED";
  providerId?: string | null;
  error?: string | null;
}) {
  try {
    await prisma.emailLog.create({
      data: {
        userId: data.userId || null,
        bookingId: data.bookingId || null,
        enquiryId: data.enquiryId || null,
        type: data.type,
        recipient: data.recipient,
        subject: data.subject,
        status: data.status,
        providerId: data.providerId || null,
        error: data.error || null,
      },
    });
  } catch (err) {
    console.error("[Email Events] Failed to write EmailLog:", err);
  }
}

/**
 * Resolves active Admin emails from database.
 */
async function getActiveAdminEmails(): Promise<{ id: string; email: string }[]> {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        email: { not: "" },
      },
      select: {
        id: true,
        email: true,
      },
    });
    return admins.filter((a) => Boolean(a.email && a.email.includes("@")));
  } catch (error) {
    console.error("[Email Events] Failed to fetch admin emails:", error);
    return [];
  }
}

/* ===================================================================
   EVENT FUNCTIONS
   =================================================================== */

/**
 * A. BOOKING CREATED
 * Sends Customer booking received email and Admin new booking notification email.
 */
export async function sendBookingCreatedEmails(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    // 1. Send Customer Email
    const customerEmail = booking.user.email;
    const customerType = "BOOKING_CREATED_CUSTOMER";

    const isCustDup = await isDuplicateEmail({ bookingId }, customerType, customerEmail);
    if (!isCustDup) {
      const template = renderBookingCreatedCustomerEmail(booking as any);
      const res = await sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
      });

      await recordEmailLog({
        userId: booking.userId,
        bookingId: booking.id,
        type: customerType,
        recipient: customerEmail,
        subject: template.subject,
        status: res.success ? "SENT" : "FAILED",
        providerId: res.id,
        error: res.error,
      });
    }

    // 2. Send Admin Email
    const adminType = "BOOKING_CREATED_ADMIN";
    const admins = await getActiveAdminEmails();

    for (const admin of admins) {
      const isAdminDup = await isDuplicateEmail({ bookingId }, adminType, admin.email);
      if (isAdminDup) continue;

      const adminTemplate = renderBookingCreatedAdminEmail(booking as any);
      const res = await sendEmail({
        to: admin.email,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });

      await recordEmailLog({
        userId: admin.id,
        bookingId: booking.id,
        type: adminType,
        recipient: admin.email,
        subject: adminTemplate.subject,
        status: res.success ? "SENT" : "FAILED",
        providerId: res.id,
        error: res.error,
      });
    }
  } catch (error) {
    console.error("[Email Events] sendBookingCreatedEmails isolated failure:", error);
  }
}

/**
 * B. PAYMENT SUCCESSFUL
 * Sends Customer payment successful email and Admin payment received email.
 */
export async function sendPaymentSuccessEmails(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    // 1. Send Customer Email
    const customerEmail = booking.user.email;
    const customerType = "PAYMENT_SUCCESS_CUSTOMER";

    const isCustDup = await isDuplicateEmail({ bookingId }, customerType, customerEmail);
    if (!isCustDup) {
      const template = renderPaymentSuccessCustomerEmail(booking as any);
      const res = await sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
      });

      await recordEmailLog({
        userId: booking.userId,
        bookingId: booking.id,
        type: customerType,
        recipient: customerEmail,
        subject: template.subject,
        status: res.success ? "SENT" : "FAILED",
        providerId: res.id,
        error: res.error,
      });
    }

    // 2. Send Admin Email
    const adminType = "PAYMENT_SUCCESS_ADMIN";
    const admins = await getActiveAdminEmails();

    for (const admin of admins) {
      const isAdminDup = await isDuplicateEmail({ bookingId }, adminType, admin.email);
      if (isAdminDup) continue;

      const adminTemplate = renderPaymentSuccessAdminEmail(booking as any);
      const res = await sendEmail({
        to: admin.email,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });

      await recordEmailLog({
        userId: admin.id,
        bookingId: booking.id,
        type: adminType,
        recipient: admin.email,
        subject: adminTemplate.subject,
        status: res.success ? "SENT" : "FAILED",
        providerId: res.id,
        error: res.error,
      });
    }
  } catch (error) {
    console.error("[Email Events] sendPaymentSuccessEmails isolated failure:", error);
  }
}

/**
 * C. BOOKING CONFIRMED
 * Sends Customer booking confirmation email.
 */
export async function sendBookingConfirmedEmail(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    const customerEmail = booking.user.email;
    const emailType = "BOOKING_CONFIRMED_CUSTOMER";

    const isDup = await isDuplicateEmail({ bookingId }, emailType, customerEmail);
    if (isDup) return;

    const template = renderBookingConfirmedCustomerEmail(booking as any);
    const res = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
    });

    await recordEmailLog({
      userId: booking.userId,
      bookingId: booking.id,
      type: emailType,
      recipient: customerEmail,
      subject: template.subject,
      status: res.success ? "SENT" : "FAILED",
      providerId: res.id,
      error: res.error,
    });
  } catch (error) {
    console.error("[Email Events] sendBookingConfirmedEmail isolated failure:", error);
  }
}

/**
 * D. BOOKING CANCELLED
 * Sends Customer booking cancellation email.
 */
export async function sendBookingCancelledEmail(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    const customerEmail = booking.user.email;
    const emailType = "BOOKING_CANCELLED_CUSTOMER";

    const isDup = await isDuplicateEmail({ bookingId }, emailType, customerEmail);
    if (isDup) return;

    const template = renderBookingCancelledCustomerEmail(booking as any);
    const res = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
    });

    await recordEmailLog({
      userId: booking.userId,
      bookingId: booking.id,
      type: emailType,
      recipient: customerEmail,
      subject: template.subject,
      status: res.success ? "SENT" : "FAILED",
      providerId: res.id,
      error: res.error,
    });
  } catch (error) {
    console.error("[Email Events] sendBookingCancelledEmail isolated failure:", error);
  }
}

/**
 * E. BOOKING COMPLETED
 * Sends Customer booking completed email.
 */
export async function sendBookingCompletedEmail(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    const customerEmail = booking.user.email;
    const emailType = "BOOKING_COMPLETED_CUSTOMER";

    const isDup = await isDuplicateEmail({ bookingId }, emailType, customerEmail);
    if (isDup) return;

    const template = renderBookingCompletedCustomerEmail(booking as any);
    const res = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
    });

    await recordEmailLog({
      userId: booking.userId,
      bookingId: booking.id,
      type: emailType,
      recipient: customerEmail,
      subject: template.subject,
      status: res.success ? "SENT" : "FAILED",
      providerId: res.id,
      error: res.error,
    });
  } catch (error) {
    console.error("[Email Events] sendBookingCompletedEmail isolated failure:", error);
  }
}

/**
 * F. PAYMENT PENDING
 * Sends Customer payment pending email if not already sent.
 */
export async function sendPaymentPendingEmail(options: { bookingId: string }) {
  try {
    const { bookingId } = options;
    if (!bookingId) return;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
        location: true,
        pickupOption: true,
      },
    });

    if (!booking || !booking.user?.email) return;

    const customerEmail = booking.user.email;
    const emailType = "PAYMENT_PENDING_CUSTOMER";

    const isDup = await isDuplicateEmail({ bookingId }, emailType, customerEmail);
    if (isDup) return;

    const template = renderPaymentPendingCustomerEmail(booking as any);
    const res = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
    });

    await recordEmailLog({
      userId: booking.userId,
      bookingId: booking.id,
      type: emailType,
      recipient: customerEmail,
      subject: template.subject,
      status: res.success ? "SENT" : "FAILED",
      providerId: res.id,
      error: res.error,
    });
  } catch (error) {
    console.error("[Email Events] sendPaymentPendingEmail isolated failure:", error);
  }
}

/**
 * G. NEW CUSTOMER ENQUIRY
 * Sends Admin enquiry notification email.
 */
export async function sendNewEnquiryEmail(options: { enquiryId: string }) {
  try {
    const { enquiryId } = options;
    if (!enquiryId) return;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
    });

    if (!enquiry) return;

    const adminType = "NEW_ENQUIRY_ADMIN";
    const admins = await getActiveAdminEmails();

    for (const admin of admins) {
      const isDup = await isDuplicateEmail({ enquiryId }, adminType, admin.email);
      if (isDup) continue;

      const template = renderNewEnquiryAdminEmail(enquiry as any);
      const res = await sendEmail({
        to: admin.email,
        subject: template.subject,
        html: template.html,
      });

      await recordEmailLog({
        userId: admin.id,
        enquiryId: enquiry.id,
        type: adminType,
        recipient: admin.email,
        subject: template.subject,
        status: res.success ? "SENT" : "FAILED",
        providerId: res.id,
        error: res.error,
      });
    }
  } catch (error) {
    console.error("[Email Events] sendNewEnquiryEmail isolated failure:", error);
  }
}

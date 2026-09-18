import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  bookingCreatedEmailTemplate,
  paymentPendingEmailTemplate,
  paymentSuccessEmailTemplate,
  bookingConfirmedEmailTemplate,
  bookingCancelledEmailTemplate,
  bookingCompletedEmailTemplate,
  newEnquiryEmailTemplate,
} from "@/lib/email-templates";

export async function GET(request: NextRequest) {
  // Only allow in development mode for safety
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Test template route is only available in development mode" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "booking-confirmed";
  const shouldSend = searchParams.get("send") === "true";

  let html = "";
  let subject = "";

  switch (type) {
    case "booking-created":
      subject = "Booking Received - Prime Rides";
      html = bookingCreatedEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        pickupLocation: "Indira Gandhi International Airport, Delhi",
        pickupOption: "Self Pickup at Airport Hub",
        startDate: "2026-10-01T10:00:00.000Z",
        endDate: "2026-10-05T10:00:00.000Z",
        rentalAmount: 14000,
        deliveryCharge: 500,
        taxAmount: 1450,
        discountAmount: 1000,
        totalAmount: 14950,
        paymentStatus: "Pending",
      });
      break;

    case "payment-pending":
      subject = "Payment Pending for Booking PR-2026-9841 - Prime Rides";
      html = paymentPendingEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        totalAmount: 14950,
      });
      break;

    case "payment-success":
      subject = "Payment Successful for Booking PR-2026-9841 - Prime Rides";
      html = paymentSuccessEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        amountPaid: 14950,
        paymentStatus: "Paid",
      });
      break;

    case "booking-confirmed":
      subject = "Booking Confirmed - PR-2026-9841 - Prime Rides";
      html = bookingConfirmedEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        pickupLocation: "Indira Gandhi International Airport, Delhi",
        pickupOption: "Self Pickup at Airport Hub",
        startDate: "2026-10-01T10:00:00.000Z",
        endDate: "2026-10-05T10:00:00.000Z",
        totalAmount: 14950,
      });
      break;

    case "booking-cancelled":
      subject = "Booking Cancelled - PR-2026-9841 - Prime Rides";
      html = bookingCancelledEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        startDate: "2026-10-01T10:00:00.000Z",
        endDate: "2026-10-05T10:00:00.000Z",
        cancellationMessage: "Schedule adjustment by customer request.",
        refundStatus: "Full Refund Initiated to Original Payment Method",
      });
      break;

    case "booking-completed":
      subject = "Trip Completed - PR-2026-9841 - Prime Rides";
      html = bookingCompletedEmailTemplate({
        customerName: "Aarav Sharma",
        bookingId: "PR-2026-9841",
        vehicleName: "Mahindra Thar 4x4",
        startDate: "2026-10-01T10:00:00.000Z",
        endDate: "2026-10-05T10:00:00.000Z",
      });
      break;

    case "new-enquiry":
      subject = "New Customer Enquiry - Priya Patel";
      html = newEnquiryEmailTemplate({
        name: "Priya Patel",
        mobile: "+91 98765 12345",
        email: "priya.patel@example.com",
        message:
          "Hi, I would like to inquire about luxury SUV availability in Goa for 7 days starting next week.",
        createdAt: "2026-09-18T12:00:00.000Z",
      });
      break;

    default:
      return NextResponse.json(
        {
          error: "Invalid template type",
          supportedTypes: [
            "booking-created",
            "payment-pending",
            "payment-success",
            "booking-confirmed",
            "booking-cancelled",
            "booking-completed",
            "new-enquiry",
          ],
        },
        { status: 400 }
      );
  }

  if (shouldSend) {
    // Determine configured development test recipient
    const recipient =
      process.env.DEV_TEST_EMAIL ||
      process.env.EMAIL_FROM ||
      "onboarding@resend.dev";

    const emailResult = await sendEmail({
      to: recipient,
      subject: `[DEV TEST] ${subject}`,
      html,
    });

    return NextResponse.json({
      success: emailResult.success,
      type,
      recipient,
      resendId: emailResult.id || null,
      error: emailResult.error || null,
    });
  }

  // Render HTML in browser for visual preview
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

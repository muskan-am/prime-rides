import "server-only";

// ==================================================
// APP URL & LOGO HELPERS
// ==================================================
export const DEFAULT_PRODUCTION_URL = "https://prime-rides-two.vercel.app";

export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const vercelHost = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (vercelHost && !vercelHost.includes("localhost")) {
      return `https://${vercelHost}`;
    }
  }
  return DEFAULT_PRODUCTION_URL;
};

/**
 * Returns an absolute public HTTPS URL for the Prime Rides logo in HTML emails.
 * Ensures localhost or unroutable URLs are never used for email logo rendering.
 */
export const getEmailLogoUrl = (): string => {
  const appUrl = getAppUrl();
  if (!appUrl || appUrl.includes("localhost") || appUrl.startsWith("http://")) {
    return `${DEFAULT_PRODUCTION_URL}/prime-rides-logo.png`;
  }
  return `${appUrl}/prime-rides-logo.png`;
};

// ==================================================
// TEMPLATE HELPERS & FORMATTERS
// ==================================================

/**
 * Escapes dynamic user inputs to prevent HTML injection in email clients.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats numbers into Indian Rupees currency format (e.g. ₹3,950).
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "₹0";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formats ISO date strings or Date objects into clean readable Indian format (e.g. 20 Sep 2026).
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return escapeHtml(String(date));
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats booking IDs safely.
 */
export function formatBookingId(id: string | null | undefined): string {
  if (!id) return "N/A";
  return escapeHtml(id);
}

// ==================================================
// EMAIL LAYOUT & COMPONENT BUILDERS
// ==================================================

export interface EmailLayoutOptions {
  preheader?: string;
  eyebrow?: string;
  title: string;
  introduction?: string;
  contentHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  supportMessage?: string;
}

export function createInfoRow(label: string, value: string, isHighlight = false): string {
  return `
    <tr>
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 500; color: #64748B; border-bottom: 1px solid #F1F5F9; width: 40%; vertical-align: top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 14px; font-size: 14px; font-weight: ${isHighlight ? "700" : "600"}; color: ${isHighlight ? "#2563EB" : "#0F172A"}; border-bottom: 1px solid #F1F5F9; text-align: right; vertical-align: top;">
        ${value}
      </td>
    </tr>
  `;
}

export function createSummaryCard(title: string, rowsHtml: string): string {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; margin-bottom: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; border-collapse: separate; overflow: hidden;">
      ${
        title
          ? `
        <tr>
          <td colspan="2" style="padding: 12px 14px; background-color: #0A1128; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            ${escapeHtml(title)}
          </td>
        </tr>
      `
          : ""
      }
      ${rowsHtml}
    </table>
  `;
}

export function createButton(label: string, url: string): string {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto 20px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: #2563EB;">
          <a href="${escapeHtml(url)}" target="_blank" style="font-size: 15px; font-family: Arial, sans-serif; color: #FFFFFF; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; border: 1px solid #2563EB; display: inline-block;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function createEmailLayout(options: EmailLayoutOptions): string {
  const logoUrl = getEmailLogoUrl();
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    td {font-family: Arial, sans-serif;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">

  ${
    options.preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #F8FAFC;">${escapeHtml(options.preheader)}</div>`
      : ""
  }

  <!-- MAIN WRAPPER -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- CONTAINER -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">

          <!-- HEADER -->
          <tr>
            <td style="background-color: #0A1128; padding: 32px 24px; text-align: center; border-bottom: 3px solid #2563EB;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Prime Rides" width="140" style="display: block; width: 140px; max-width: 140px; height: auto; border: 0; outline: none; text-decoration: none; border-radius: 8px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="color: #94A3B8; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                      Your Ride. Your Freedom.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT BODY -->
          <tr>
            <td style="padding: 36px 28px 28px 28px; background-color: #FFFFFF;">

              ${
                options.eyebrow
                  ? `
                <div style="font-size: 12px; font-weight: 700; color: #2563EB; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 8px;">
                  ${escapeHtml(options.eyebrow)}
                </div>
              `
                  : ""
              }

              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #0A1128; line-height: 1.3;">
                ${escapeHtml(options.title)}
              </h1>

              ${
                options.introduction
                  ? `
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  ${escapeHtml(options.introduction)}
                </p>
              `
                  : ""
              }

              <!-- DYNAMIC CONTENT -->
              ${options.contentHtml}

              <!-- CTA BUTTON -->
              ${
                options.ctaLabel && options.ctaUrl
                  ? createButton(options.ctaLabel, options.ctaUrl)
                  : ""
              }

              <!-- SUPPORT MESSAGE -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
                <tr>
                  <td style="font-size: 13px; line-height: 1.5; color: #64748B; text-align: center;">
                    ${
                      options.supportMessage
                        ? escapeHtml(options.supportMessage)
                        : "If you have any questions or need assistance, reply to this email or contact support at <a href='mailto:support@primerides.com' style='color: #2563EB; text-decoration: none; font-weight: 600;'>support@primerides.com</a>."
                    }
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #0A1128; padding: 28px 24px; text-align: center; border-top: 1px solid #1E293B;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px; padding-bottom: 6px;">
                    Prime Rides
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #94A3B8; padding-bottom: 12px;">
                    Delhi &bull; Goa &bull; Bangalore
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #94A3B8; padding-bottom: 16px;">
                    <a href="mailto:support@primerides.com" style="color: #94A3B8; text-decoration: underline;">support@primerides.com</a> &nbsp;|&nbsp; <span>+91 98765 43210</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 14px;">
                    &copy; ${currentYear} Prime Rides Technologies. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ==================================================
// INDIVIDUAL EMAIL TEMPLATES
// ==================================================

// 1. BOOKING CREATED TEMPLATE
export interface BookingCreatedEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  pickupLocation: string;
  pickupOption?: string;
  startDate: string | Date;
  endDate: string | Date;
  rentalAmount: number;
  deliveryCharge?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentStatus: string;
}

export function bookingCreatedEmailTemplate(data: BookingCreatedEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Pickup Location", escapeHtml(data.pickupLocation)),
  ];

  if (data.pickupOption) {
    rows.push(createInfoRow("Pickup Option", escapeHtml(data.pickupOption)));
  }

  rows.push(
    createInfoRow("Start Date", formatDate(data.startDate)),
    createInfoRow("End Date", formatDate(data.endDate)),
    createInfoRow("Rental Amount", formatINR(data.rentalAmount))
  );

  if (data.deliveryCharge && data.deliveryCharge > 0) {
    rows.push(createInfoRow("Delivery Charge", formatINR(data.deliveryCharge)));
  }

  if (data.taxAmount && data.taxAmount > 0) {
    rows.push(createInfoRow("Tax", formatINR(data.taxAmount)));
  }

  if (data.discountAmount && data.discountAmount > 0) {
    rows.push(createInfoRow("Discount", `-${formatINR(data.discountAmount)}`));
  }

  rows.push(
    createInfoRow("Total Amount", formatINR(data.totalAmount), true),
    createInfoRow("Payment Status", escapeHtml(data.paymentStatus))
  );

  const cardHtml = createSummaryCard("Booking Details", rows.join(""));

  return createEmailLayout({
    preheader: `Booking request received for ${data.vehicleName} (${formatBookingId(data.bookingId)})`,
    eyebrow: "BOOKING REQUEST RECEIVED",
    title: "Booking Received",
    introduction: `Hi ${escapeHtml(data.customerName)}, thank you for choosing Prime Rides. We've received your booking request.`,
    contentHtml: cardHtml,
    ctaLabel: "View My Booking",
    ctaUrl: `${appUrl}/dashboard`,
  });
}

// 2. PAYMENT PENDING TEMPLATE
export interface PaymentPendingEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  totalAmount: number;
}

export function paymentPendingEmailTemplate(data: PaymentPendingEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Total Amount Due", formatINR(data.totalAmount), true),
    createInfoRow("Payment Status", "Pending"),
  ].join("");

  const cardHtml = createSummaryCard("Pending Payment Summary", rows);

  return createEmailLayout({
    preheader: `Action required: Complete payment for booking ${formatBookingId(data.bookingId)}`,
    eyebrow: "ACTION REQUIRED",
    title: "Payment Pending",
    introduction: `Hi ${escapeHtml(data.customerName)}, your booking request for ${escapeHtml(data.vehicleName)} has been created, but your payment is currently pending. Please complete payment to confirm your reservation.`,
    contentHtml: cardHtml,
    ctaLabel: "Complete Payment",
    ctaUrl: `${appUrl}/dashboard`,
  });
}

// 3. PAYMENT SUCCESS TEMPLATE
export interface PaymentSuccessEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  amountPaid: number;
  paymentStatus: string;
}

export function paymentSuccessEmailTemplate(data: PaymentSuccessEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Amount Paid", formatINR(data.amountPaid), true),
    createInfoRow("Payment Status", escapeHtml(data.paymentStatus)),
  ].join("");

  const cardHtml = createSummaryCard("Payment Receipt", rows);

  return createEmailLayout({
    preheader: `Payment confirmed for booking ${formatBookingId(data.bookingId)}`,
    eyebrow: "PAYMENT RECEIVED",
    title: "Payment Successful",
    introduction: `Hi ${escapeHtml(data.customerName)}, your payment of ${formatINR(data.amountPaid)} has been successfully received.`,
    contentHtml: cardHtml,
    ctaLabel: "View My Booking",
    ctaUrl: `${appUrl}/dashboard`,
  });
}

// 4. BOOKING CONFIRMED TEMPLATE
export interface BookingConfirmedEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  pickupLocation: string;
  pickupOption?: string;
  startDate: string | Date;
  endDate: string | Date;
  totalAmount: number;
}

export function bookingConfirmedEmailTemplate(data: BookingConfirmedEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Pickup Location", escapeHtml(data.pickupLocation)),
  ];

  if (data.pickupOption) {
    rows.push(createInfoRow("Pickup Option", escapeHtml(data.pickupOption)));
  }

  rows.push(
    createInfoRow("Start Date", formatDate(data.startDate)),
    createInfoRow("End Date", formatDate(data.endDate)),
    createInfoRow("Total Amount", formatINR(data.totalAmount), true)
  );

  const cardHtml = createSummaryCard("Confirmed Reservation Details", rows.join(""));

  const nextStepsHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px;">
      <tr>
        <td style="font-size: 14px; font-weight: 700; color: #1E40AF; padding-bottom: 8px;">
          Next Steps:
        </td>
      </tr>
      <tr>
        <td>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #1E3A8A;">
            <li style="margin-bottom: 4px;">Keep your booking confirmation available.</li>
            <li style="margin-bottom: 4px;">Carry the required documents for pickup.</li>
            <li style="margin-bottom: 4px;">Arrive at the selected pickup location on time.</li>
            <li>Follow the vehicle handover instructions provided by Prime Rides.</li>
          </ul>
        </td>
      </tr>
    </table>
  `;

  return createEmailLayout({
    preheader: `Booking confirmed for ${data.vehicleName} (${formatBookingId(data.bookingId)})`,
    eyebrow: "RESERVATION CONFIRMED",
    title: "Booking Confirmed",
    introduction: `Hi ${escapeHtml(data.customerName)}, your Prime Rides booking is confirmed.`,
    contentHtml: cardHtml + nextStepsHtml,
    ctaLabel: "View Booking",
    ctaUrl: `${appUrl}/dashboard`,
  });
}

// 5. BOOKING CANCELLED TEMPLATE
export interface BookingCancelledEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  startDate: string | Date;
  endDate: string | Date;
  cancellationMessage?: string;
  refundStatus?: string;
}

export function bookingCancelledEmailTemplate(data: BookingCancelledEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Start Date", formatDate(data.startDate)),
    createInfoRow("End Date", formatDate(data.endDate)),
  ];

  if (data.refundStatus && data.refundStatus.trim() !== "") {
    rows.push(createInfoRow("Refund Status", escapeHtml(data.refundStatus), true));
  } else {
    rows.push(createInfoRow("Refund Info", "Refer to booking details"));
  }

  const cardHtml = createSummaryCard("Cancelled Booking Details", rows.join(""));

  const refundNotice = data.refundStatus && data.refundStatus.trim() !== ""
    ? `Refund Status: <strong>${escapeHtml(data.refundStatus)}</strong>.`
    : `Please refer to your booking/payment information for refund details.`;

  const noteHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px 16px;">
      ${
        data.cancellationMessage
          ? `
        <tr>
          <td style="font-size: 13px; color: #991B1B; line-height: 1.5; padding-bottom: 6px;">
            <strong>Reason/Note:</strong> ${escapeHtml(data.cancellationMessage)}
          </td>
        </tr>
      `
          : ""
      }
      <tr>
        <td style="font-size: 13px; color: #991B1B; line-height: 1.5;">
          ${refundNotice}
        </td>
      </tr>
    </table>
  `;

  return createEmailLayout({
    preheader: `Booking ${formatBookingId(data.bookingId)} has been cancelled`,
    eyebrow: "BOOKING CANCELLED",
    title: "Booking Cancelled",
    introduction: `Hi ${escapeHtml(data.customerName)}, your booking for ${escapeHtml(data.vehicleName)} has been cancelled.`,
    contentHtml: cardHtml + noteHtml,
    ctaLabel: "View Account",
    ctaUrl: `${appUrl}/dashboard`,
  });
}

// 6. BOOKING COMPLETED TEMPLATE
export interface BookingCompletedEmailData {
  customerName: string;
  bookingId: string;
  vehicleName: string;
  startDate: string | Date;
  endDate: string | Date;
}

export function bookingCompletedEmailTemplate(data: BookingCompletedEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Booking ID", formatBookingId(data.bookingId)),
    createInfoRow("Customer Name", escapeHtml(data.customerName)),
    createInfoRow("Vehicle", escapeHtml(data.vehicleName)),
    createInfoRow("Start Date", formatDate(data.startDate)),
    createInfoRow("End Date", formatDate(data.endDate)),
  ].join("");

  const cardHtml = createSummaryCard("Rental Summary", rows);

  const thankYouHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; text-align: center;">
      <tr>
        <td style="font-size: 15px; font-weight: 600; color: #0A1128;">
          We hope you enjoyed your journey.
        </td>
      </tr>
    </table>
  `;

  return createEmailLayout({
    preheader: `Thank you for choosing Prime Rides (Booking ${formatBookingId(data.bookingId)})`,
    eyebrow: "TRIP COMPLETED",
    title: "Booking Completed",
    introduction: `Hi ${escapeHtml(data.customerName)}, thank you for choosing Prime Rides.`,
    contentHtml: cardHtml + thankYouHtml,
    ctaLabel: "Book Another Ride",
    ctaUrl: `${appUrl}/cars`,
  });
}

// 7. NEW ENQUIRY TEMPLATE (ADMIN)
export interface NewEnquiryEmailData {
  name: string;
  mobile: string;
  email: string;
  message: string;
  createdAt: string | Date;
}

export function newEnquiryEmailTemplate(data: NewEnquiryEmailData): string {
  const appUrl = getAppUrl();
  const rows = [
    createInfoRow("Customer Name", escapeHtml(data.name)),
    createInfoRow("Mobile", escapeHtml(data.mobile)),
    createInfoRow("Email", escapeHtml(data.email)),
    createInfoRow("Submitted At", formatDate(data.createdAt)),
  ].join("");

  const cardHtml = createSummaryCard("Enquiry Details", rows);

  const messageHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 8px; padding: 16px;">
      <tr>
        <td style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px;">
          Message:
        </td>
      </tr>
      <tr>
        <td style="font-size: 14px; color: #0F172A; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
      </tr>
    </table>
  `;

  return createEmailLayout({
    preheader: `New customer enquiry from ${data.name}`,
    eyebrow: "ADMIN NOTIFICATION",
    title: "New Customer Enquiry",
    introduction: `A new customer enquiry has been submitted on the Prime Rides platform.`,
    contentHtml: cardHtml + messageHtml,
    ctaLabel: "View Enquiry",
    ctaUrl: `${appUrl}/admin/enquiries`,
  });
}

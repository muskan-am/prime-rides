import {
  formatCustomerName,
  formatVehicleName,
  formatBookingDates,
  formatINRAmount,
  formatShortBookingId,
} from "./admin-notification-context";

type BookingEmailData = {
  id: string;
  user?: { name?: string | null; email?: string | null } | null;
  vehicle?: { brand?: string | null; model?: string | null; variant?: string | null } | null;
  location?: { name?: string | null } | null;
  pickupOption?: { name?: string | null } | null;
  startDate: Date | string;
  endDate: Date | string;
  rentalAmount?: number | string | unknown;
  deliveryCharge?: number | string | unknown;
  taxAmount?: number | string | unknown;
  discountAmount?: number | string | unknown;
  totalAmount: number | string | unknown;
  status: string;
  paymentStatus: string;
};

type EnquiryEmailData = {
  id: string;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
  subject?: string | null;
  message: string;
  createdAt: Date | string;
};

const BRAND_NAVY = "#0A1128";
const BRAND_BLUE = "#2563EB";
const BRAND_SILVER = "#94A3B8";

/**
 * Common HTML container wrapper for Prime Rides emails
 */
function wrapEmailHtml(title: string, contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(10, 17, 40, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: ${BRAND_NAVY};
      padding: 28px 32px;
      text-align: center;
    }
    .brand-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      color: ${BRAND_SILVER};
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 32px;
    }
    .heading {
      color: ${BRAND_NAVY};
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 14px;
    }
    .row:last-child {
      border-bottom: none;
    }
    .label {
      color: #64748b;
      font-weight: 500;
    }
    .value {
      color: ${BRAND_NAVY};
      font-weight: 600;
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .badge-pending { background-color: #fef9c3; color: #a16207; }
    .badge-cancelled { background-color: #fee2e2; color: #b91c1c; }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn {
      display: inline-block;
      background-color: ${BRAND_BLUE};
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: ${BRAND_BLUE};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-title">PRIME RIDES</div>
        <div class="brand-tagline">Your Ride. Your Freedom.</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">Need assistance? Reach out to <a href="mailto:support@primerides.com">support@primerides.com</a></p>
        <p style="margin: 0;">&copy; ${currentYear} Prime Rides Car Rental Platform. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/* ===================================================================
   A. BOOKING CREATED
   =================================================================== */

export function renderBookingCreatedCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const dates = formatBookingDates(data.startDate, data.endDate);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);
  const rentalStr = formatINRAmount(data.rentalAmount);
  const deliveryStr = formatINRAmount(data.deliveryCharge);
  const taxStr = formatINRAmount(data.taxAmount);
  const discountVal = Number(data.discountAmount || 0);
  const discountStr = discountVal > 0 ? formatINRAmount(discountVal) : null;

  const content = `
    <h2 class="heading">Booking Received</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Thank you for choosing Prime Rides! We have received your booking request for <strong>${vehicleName}</strong>.</p>
    
    <div class="card">
      <div class="row">
        <span class="label">Booking Reference</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Rental Dates</span>
        <span class="value">${dates}</span>
      </div>
      ${
        data.location?.name
          ? `<div class="row"><span class="label">Pickup Location</span><span class="value">${data.location.name}</span></div>`
          : ""
      }
      ${
        data.pickupOption?.name
          ? `<div class="row"><span class="label">Pickup Option</span><span class="value">${data.pickupOption.name}</span></div>`
          : ""
      }
      <div class="row">
        <span class="label">Rental Base Amount</span>
        <span class="value">${rentalStr}</span>
      </div>
      <div class="row">
        <span class="label">Delivery Charge</span>
        <span class="value">${deliveryStr}</span>
      </div>
      <div class="row">
        <span class="label">Tax</span>
        <span class="value">${taxStr}</span>
      </div>
      ${
        discountStr
          ? `<div class="row"><span class="label">Discount</span><span class="value" style="color: #16a34a;">-${discountStr}</span></div>`
          : ""
      }
      <div class="row" style="font-size: 16px; padding-top: 12px;">
        <span class="label" style="color: ${BRAND_NAVY}; font-weight: 700;">Total Amount</span>
        <span class="value" style="color: ${BRAND_BLUE}; font-weight: 700;">${totalStr}</span>
      </div>
      <div class="row">
        <span class="label">Payment Status</span>
        <span class="value"><span class="badge badge-pending">${data.paymentStatus}</span></span>
      </div>
    </div>

    <p>Please complete your payment to lock in your reservation.</p>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">View My Booking</a>
    </div>
  `;

  return {
    subject: `Booking Received – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Booking Received – Prime Rides", content),
  };
}

export function renderBookingCreatedAdminEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const dates = formatBookingDates(data.startDate, data.endDate);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);
  const customerEmail = data.user?.email || "N/A";

  const content = `
    <h2 class="heading">New Booking Received</h2>
    <p>A new booking request has been submitted by <strong>${customerName}</strong> (${customerEmail}).</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking ID</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Customer</span>
        <span class="value">${customerName} (${customerEmail})</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Dates</span>
        <span class="value">${dates}</span>
      </div>
      ${
        data.location?.name
          ? `<div class="row"><span class="label">Location</span><span class="value">${data.location.name}</span></div>`
          : ""
      }
      <div class="row">
        <span class="label">Total Amount</span>
        <span class="value">${totalStr}</span>
      </div>
      <div class="row">
        <span class="label">Payment Status</span>
        <span class="value">${data.paymentStatus}</span>
      </div>
    </div>

    <div class="btn-container">
      <a href="https://primerides.com/admin/bookings#${data.id}" class="btn">View Booking</a>
    </div>
  `;

  return {
    subject: `New Booking Received – Prime Rides (${shortId})`,
    html: wrapEmailHtml("New Booking Received", content),
  };
}

/* ===================================================================
   B. PAYMENT SUCCESSFUL
   =================================================================== */

export function renderPaymentSuccessCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);

  const content = `
    <h2 class="heading">Payment Successful</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>We have successfully received your payment of <strong>${totalStr}</strong> for your vehicle rental.</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking Reference</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Amount Paid</span>
        <span class="value" style="color: #16a34a; font-weight: 700;">${totalStr}</span>
      </div>
      <div class="row">
        <span class="label">Payment Status</span>
        <span class="value"><span class="badge badge-success">SUCCESS</span></span>
      </div>
      <div class="row">
        <span class="label">Booking Status</span>
        <span class="value"><span class="badge badge-success">${data.status}</span></span>
      </div>
    </div>

    <p>Your vehicle is reserved and your booking status is <strong>${data.status}</strong>. Safe travels!</p>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">View My Booking</a>
    </div>
  `;

  return {
    subject: `Payment Successful – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Payment Successful – Prime Rides", content),
  };
}

export function renderPaymentSuccessAdminEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);

  const content = `
    <h2 class="heading">Payment Received</h2>
    <p>Payment has been confirmed for booking <strong>${shortId}</strong>.</p>

    <div class="card">
      <div class="row">
        <span class="label">Customer</span>
        <span class="value">${customerName}</span>
      </div>
      <div class="row">
        <span class="label">Booking ID</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Amount Received</span>
        <span class="value" style="color: #16a34a; font-weight: 700;">${totalStr}</span>
      </div>
      <div class="row">
        <span class="label">Confirmation</span>
        <span class="value">Payment verified via Razorpay</span>
      </div>
    </div>

    <div class="btn-container">
      <a href="https://primerides.com/admin/bookings#${data.id}" class="btn">View Booking</a>
    </div>
  `;

  return {
    subject: `Payment Received – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Payment Received – Prime Rides", content),
  };
}

/* ===================================================================
   C. BOOKING CONFIRMED
   =================================================================== */

export function renderBookingConfirmedCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const dates = formatBookingDates(data.startDate, data.endDate);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);

  const content = `
    <h2 class="heading">Booking Confirmed!</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Great news! Your Prime Rides booking has been confirmed by our team.</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking ID</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Dates</span>
        <span class="value">${dates}</span>
      </div>
      ${
        data.location?.name
          ? `<div class="row"><span class="label">Pickup Location</span><span class="value">${data.location.name}</span></div>`
          : ""
      }
      ${
        data.pickupOption?.name
          ? `<div class="row"><span class="label">Pickup Option</span><span class="value">${data.pickupOption.name}</span></div>`
          : ""
      }
      <div class="row">
        <span class="label">Total Amount</span>
        <span class="value">${totalStr}</span>
      </div>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid ${BRAND_BLUE}; padding: 14px; margin: 20px 0; border-radius: 4px;">
      <strong style="color: ${BRAND_NAVY};">Important Next Steps:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #334155; font-size: 14px;">
        <li>Please keep a valid Driving License & Original Government ID handy for vehicle handover.</li>
        <li>Inspect the vehicle carefully at the time of pickup/delivery.</li>
        <li>Adhere to speed limit safety guidelines.</li>
      </ul>
    </div>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">View Booking</a>
    </div>
  `;

  return {
    subject: `Booking Confirmed – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Booking Confirmed – Prime Rides", content),
  };
}

/* ===================================================================
   D. BOOKING CANCELLED
   =================================================================== */

export function renderBookingCancelledCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const dates = formatBookingDates(data.startDate, data.endDate);
  const shortId = formatShortBookingId(data.id);

  const content = `
    <h2 class="heading">Booking Cancelled</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Your booking <strong>${shortId}</strong> for <strong>${vehicleName}</strong> has been cancelled.</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking Reference</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Scheduled Dates</span>
        <span class="value">${dates}</span>
      </div>
      <div class="row">
        <span class="label">Cancellation Status</span>
        <span class="value"><span class="badge badge-cancelled">CANCELLED</span></span>
      </div>
    </div>

    <p style="font-size: 14px; color: #475569;">
      If you made a payment and are eligible for a refund according to our rental terms, our support team will process it to your original payment method.
    </p>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">View Booking Status</a>
    </div>
  `;

  return {
    subject: `Booking Cancelled – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Booking Cancelled – Prime Rides", content),
  };
}

/* ===================================================================
   E. BOOKING COMPLETED
   =================================================================== */

export function renderBookingCompletedCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const dates = formatBookingDates(data.startDate, data.endDate);
  const shortId = formatShortBookingId(data.id);

  const content = `
    <h2 class="heading">Booking Completed</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Thank you for riding with Prime Rides! Your rental for <strong>${vehicleName}</strong> has been completed successfully.</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking Reference</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Rental Period</span>
        <span class="value">${dates}</span>
      </div>
      <div class="row">
        <span class="label">Status</span>
        <span class="value"><span class="badge badge-success">COMPLETED</span></span>
      </div>
    </div>

    <p>We hope you had a smooth drive! We look forward to serving you again on your next journey.</p>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">View Rental Summary</a>
    </div>
  `;

  return {
    subject: `Booking Completed – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Booking Completed – Prime Rides", content),
  };
}

/* ===================================================================
   F. PAYMENT PENDING
   =================================================================== */

export function renderPaymentPendingCustomerEmail(data: BookingEmailData) {
  const customerName = formatCustomerName(data.user);
  const vehicleName = formatVehicleName(data.vehicle);
  const shortId = formatShortBookingId(data.id);
  const totalStr = formatINRAmount(data.totalAmount);

  const content = `
    <h2 class="heading">Payment Pending</h2>
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Your booking <strong>${shortId}</strong> for <strong>${vehicleName}</strong> is currently waiting for payment.</p>

    <div class="card">
      <div class="row">
        <span class="label">Booking Reference</span>
        <span class="value">${shortId}</span>
      </div>
      <div class="row">
        <span class="label">Vehicle</span>
        <span class="value">${vehicleName}</span>
      </div>
      <div class="row">
        <span class="label">Amount Due</span>
        <span class="value" style="color: ${BRAND_BLUE}; font-weight: 700;">${totalStr}</span>
      </div>
      <div class="row">
        <span class="label">Payment Status</span>
        <span class="value"><span class="badge badge-pending">PENDING</span></span>
      </div>
    </div>

    <p>To secure your vehicle reservation, please complete your payment at your earliest convenience.</p>

    <div class="btn-container">
      <a href="https://primerides.com/dashboard?bookingId=${data.id}" class="btn">Complete Payment</a>
    </div>
  `;

  return {
    subject: `Payment Pending – Prime Rides (${shortId})`,
    html: wrapEmailHtml("Payment Pending – Prime Rides", content),
  };
}

/* ===================================================================
   G. NEW CUSTOMER ENQUIRY
   =================================================================== */

export function renderNewEnquiryAdminEmail(data: EnquiryEmailData) {
  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Just now";

  const content = `
    <h2 class="heading">New Customer Enquiry</h2>
    <p>A new customer message has been received from the contact support form.</p>

    <div class="card">
      <div class="row">
        <span class="label">Customer Name</span>
        <span class="value">${data.name || "N/A"}</span>
      </div>
      <div class="row">
        <span class="label">Mobile</span>
        <span class="value">${data.mobile || "N/A"}</span>
      </div>
      <div class="row">
        <span class="label">Email</span>
        <span class="value">${data.email || "N/A"}</span>
      </div>
      <div class="row">
        <span class="label">Subject</span>
        <span class="value">${data.subject || "General Enquiry"}</span>
      </div>
      <div class="row">
        <span class="label">Submitted At</span>
        <span class="value">${dateStr}</span>
      </div>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong style="color: ${BRAND_NAVY}; display: block; margin-bottom: 8px;">Customer Message:</strong>
      <p style="margin: 0; color: #334155; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
    </div>

    <div class="btn-container">
      <a href="https://primerides.com/admin/enquiries#${data.id}" class="btn">View Enquiry</a>
    </div>
  `;

  return {
    subject: `New Customer Enquiry – Prime Rides (${data.name || "Customer"})`,
    html: wrapEmailHtml("New Customer Enquiry", content),
  };
}

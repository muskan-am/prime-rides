export function formatCustomerName(user?: {
  name?: string | null;
  email?: string | null;
} | null): string {
  if (!user) return "Customer";
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim();
  }
  if (user.email && user.email.includes("@")) {
    return user.email.split("@")[0];
  }
  return "Customer";
}

export function formatVehicleName(vehicle?: {
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
} | null): string {
  if (!vehicle) return "Vehicle";
  const brand = vehicle.brand?.trim() || "";
  const model = vehicle.model?.trim() || "";
  const variant = vehicle.variant?.trim() || "";

  const base = `${brand} ${model}`.trim();
  if (!base) return "Vehicle";
  return variant ? `${base} ${variant}` : base;
}

export function formatBookingDates(
  startDate?: Date | string | null,
  endDate?: Date | string | null
): string {
  if (!startDate || !endDate) return "";
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

    const startFormatted = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(start);

    const endFormatted = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(end);

    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return "";
  }
}

export function formatINRAmount(amount?: number | string | unknown): string {
  if (amount === undefined || amount === null) return "₹0";
  const num = Number(amount);
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatShortBookingId(bookingId?: string | null): string {
  if (!bookingId) return "";
  const clean = bookingId.trim();
  if (clean.length <= 6) return `#${clean.toUpperCase()}`;
  return `#${clean.slice(-6).toUpperCase()}`;
}

export function resolveAdminBookingLink(bookingId?: string | null): string {
  if (bookingId && typeof bookingId === "string" && bookingId.trim().length > 0) {
    return `/admin/bookings#${bookingId.trim()}`;
  }
  return "/admin/bookings";
}

export function buildAdminNewBookingContent(booking: any) {
  try {
    const customer = formatCustomerName(booking?.user);
    const vehicle = formatVehicleName(booking?.vehicle);
    const dates = formatBookingDates(booking?.startDate, booking?.endDate);
    const amount = formatINRAmount(booking?.totalAmount);
    const location = booking?.location?.name ? `${booking.location.name}` : "";

    const detailsParts = [];
    if (location) detailsParts.push(location);
    if (dates) detailsParts.push(`for ${dates}`);

    const detailsStr = detailsParts.length > 0 ? `, ${detailsParts.join(", ")}` : "";
    const message = `${customer} booked ${vehicle}${detailsStr}. Total ${amount}.`;
    const link = resolveAdminBookingLink(booking?.id);

    return {
      title: "New Booking Received",
      message,
      link,
    };
  } catch (error) {
    console.error("Error building Admin New Booking content:", error);
    return {
      title: "New Booking Received",
      message: "A new Prime Rides booking has been received.",
      link: "/admin/bookings",
    };
  }
}

export function buildAdminPaymentReceivedContent(booking: any) {
  try {
    const customer = formatCustomerName(booking?.user);
    const vehicle = formatVehicleName(booking?.vehicle);
    const amount = formatINRAmount(booking?.totalAmount);
    const shortId = formatShortBookingId(booking?.id);
    const bookingRef = shortId ? `, booking ${shortId}` : "";

    const message = `${customer} paid ${amount} for ${vehicle}${bookingRef}.`;
    const link = resolveAdminBookingLink(booking?.id);

    return {
      title: "Payment Received",
      message,
      link,
    };
  } catch (error) {
    console.error("Error building Admin Payment Received content:", error);
    return {
      title: "Payment Received",
      message: "A customer payment has been successfully received.",
      link: "/admin/bookings",
    };
  }
}

export function buildAdminBookingCancelledContent(booking: any) {
  try {
    const customer = formatCustomerName(booking?.user);
    const vehicle = formatVehicleName(booking?.vehicle);
    const shortId = formatShortBookingId(booking?.id);
    const bookingRef = shortId ? ` ${shortId}` : "";

    const message = `${customer} cancelled booking${bookingRef} for ${vehicle}.`;
    const link = resolveAdminBookingLink(booking?.id);

    return {
      title: "Booking Cancelled",
      message,
      link,
    };
  } catch (error) {
    console.error("Error building Admin Booking Cancelled content:", error);
    return {
      title: "Booking Cancelled",
      message: "A Prime Rides booking has been cancelled.",
      link: "/admin/bookings",
    };
  }
}

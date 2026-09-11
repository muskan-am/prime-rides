import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatAmount(amount: unknown) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; payment?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const filterStatus = resolvedParams.status;
  const filterPayment = resolvedParams.payment;

  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          variant: true,
          primaryImage: true,
          registrationNumber: true,
        },
      },
      rentalPackage: {
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
        },
      },
      monthlyPlan: {
        select: {
          id: true,
          name: true,
          months: true,
          price: true,
        },
      },
      pickupOption: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  // Calculate Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  const paidCount = bookings.filter((b) => b.paymentStatus === "SUCCESS").length;
  const paymentPendingCount = bookings.filter(
    (b) => b.paymentStatus === "PENDING" || !b.paymentStatus
  ).length;

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (filterPayment && b.paymentStatus !== filterPayment) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Booking & Payment Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review bookings, verify payment status, inspect Razorpay transaction IDs, and update reservation status.
          </p>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <a
          href="/admin/bookings"
          className={`p-4 rounded-2xl border transition-all ${
            !filterStatus && !filterPayment
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Bookings</p>
          <p className="text-2xl font-extrabold mt-1">{totalCount}</p>
        </a>

        <a
          href="/admin/bookings?payment=SUCCESS"
          className={`p-4 rounded-2xl border transition-all ${
            filterPayment === "SUCCESS"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white border-emerald-200 text-emerald-800 hover:border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider">💳 Paid (Success)</p>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {Math.round((paidCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <p className="text-2xl font-extrabold mt-1">{paidCount}</p>
        </a>

        <a
          href="/admin/bookings?payment=PENDING"
          className={`p-4 rounded-2xl border transition-all ${
            filterPayment === "PENDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-white border-amber-200 text-amber-800 hover:border-amber-300 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider">⏳ Payment Pending</p>
          <p className="text-2xl font-extrabold mt-1">{paymentPendingCount}</p>
        </a>

        <a
          href="/admin/bookings?status=PENDING"
          className={`p-4 rounded-2xl border transition-all ${
            filterStatus === "PENDING"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
        </a>

        <a
          href="/admin/bookings?status=CONFIRMED"
          className={`p-4 rounded-2xl border transition-all ${
            filterStatus === "CONFIRMED"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Confirmed Active</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{confirmedCount}</p>
        </a>

        <a
          href="/admin/bookings?status=CANCELLED"
          className={`p-4 rounded-2xl border transition-all ${
            filterStatus === "CANCELLED"
              ? "bg-rose-600 text-white border-rose-600 shadow-md"
              : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cancelled</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{cancelledCount}</p>
        </a>
      </div>

      {/* Filter Tabs Indicator */}
      {(filterStatus || filterPayment) && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-xs text-blue-900">
          <span>
            Filtering by:{" "}
            <strong className="font-bold">
              {filterPayment ? `Payment Status: ${filterPayment}` : `Booking Status: ${filterStatus}`}
            </strong>
          </span>
          <a
            href="/admin/bookings"
            className="ml-auto font-bold text-blue-700 underline hover:text-blue-900"
          >
            Clear Filters (Show All)
          </a>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-3xl mb-3">📑</div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {filterStatus || filterPayment
                ? "No bookings match the selected filter criteria."
                : "Customer bookings will appear here once submitted."}
            </p>
            {(filterStatus || filterPayment) && (
              <a
                href="/admin/bookings"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                View All Bookings
              </a>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const rentalType = booking.rentalPackage
              ? booking.rentalPackage.name
              : booking.monthlyPlan
              ? booking.monthlyPlan.name
              : "Standard Daily";

            const statusColors: Record<string, string> = {
              PENDING: "bg-amber-50 text-amber-700 border-amber-200",
              CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
              COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
              CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
            };

            const isPaid = booking.paymentStatus === "SUCCESS";
            const isPaymentFailed = booking.paymentStatus === "FAILED";
            const isRefunded = booking.paymentStatus === "REFUNDED";

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Header with Booking Status & Payment Status */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Booking Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColors[booking.status] || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      Status: {booking.status}
                    </span>

                    {/* PAYMENT STATUS BADGE */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        💳 PAID (SUCCESS)
                      </span>
                    ) : isPaymentFailed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ❌ PAYMENT FAILED
                      </span>
                    ) : isRefunded ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        🔄 REFUNDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ⏳ PAYMENT PENDING
                      </span>
                    )}

                    <div>
                      <p className="text-xs text-slate-500 font-mono">ID: {booking.id}</p>
                      <p className="text-[11px] text-slate-400">
                        Booked on {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status Switcher Component */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">Change Status:</span>
                    <BookingStatusSelect
                      bookingId={booking.id}
                      currentStatus={booking.status as any}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-5 grid gap-6 md:grid-cols-12 items-center">
                  {/* Vehicle Image & Name (4 cols) */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    {booking.vehicle.primaryImage ? (
                      <div className="relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <Image
                          src={booking.vehicle.primaryImage}
                          alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-28 shrink-0 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        No Image
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {booking.vehicle.brand}
                      </p>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {booking.vehicle.model}
                      </h3>
                      {booking.vehicle.variant && (
                        <p className="text-xs text-slate-500">{booking.vehicle.variant}</p>
                      )}
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        Plate: {booking.vehicle.registrationNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info & Rental Info (5 cols) */}
                  <div className="md:col-span-5 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Customer</p>
                      <p className="font-bold text-slate-900">{booking.user.name || "Guest"}</p>
                      <p className="text-slate-500 truncate">{booking.user.email}</p>
                      {booking.user.mobile && <p className="text-slate-500">{booking.user.mobile}</p>}
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Rental Plan</p>
                      <p className="font-bold text-slate-900">{rentalType}</p>
                      <p className="text-slate-500 mt-0.5">
                        {formatDate(booking.startDate)}
                      </p>
                      <p className="text-slate-500">
                        to {formatDate(booking.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown & Payment Badge Summary (3 cols) */}
                  <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-5 text-left md:text-right">
                    <p className="text-xs text-slate-500">Total Amount</p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {formatAmount(booking.totalAmount)}
                    </p>
                    
                    <div className="mt-1 text-[11px] text-slate-500 space-y-0.5">
                      <p>Rent: {formatAmount(booking.rentalAmount)}</p>
                      {booking.taxAmount ? <p>Tax: {formatAmount(booking.taxAmount)}</p> : null}
                      {booking.deliveryCharge ? <p>Delivery: {formatAmount(booking.deliveryCharge)}</p> : null}
                    </div>

                    <div className="mt-2.5">
                      {isPaid ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✅ FULLY PAID
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ⚠️ PAYMENT UNPAID
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Details Bar - Pickup Info & Razorpay Payment Details */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>📍 Pickup Hub: <strong className="text-slate-800 font-semibold">{booking.location.name}</strong></span>
                    <span>🚚 Method: <strong className="text-slate-800 font-semibold">{booking.pickupOption?.name || "Standard Pickup"}</strong></span>
                  </div>

                  {/* Payment Details Section */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-500">Payment Status:</span>
                      {isPaid ? (
                        <strong className="text-emerald-600 font-bold">PAID (SUCCESS)</strong>
                      ) : isPaymentFailed ? (
                        <strong className="text-rose-600 font-bold">FAILED</strong>
                      ) : (
                        <strong className="text-amber-600 font-bold">UNPAID (PENDING)</strong>
                      )}
                    </div>

                    {booking.paidAt && (
                      <div>
                        <span className="font-semibold text-slate-500">Paid At: </span>
                        <strong className="text-slate-800">{formatDate(booking.paidAt)}</strong>
                      </div>
                    )}

                    {booking.razorpayPaymentId && (
                      <div>
                        <span className="font-semibold text-slate-500">Payment ID: </span>
                        <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                          {booking.razorpayPaymentId}
                        </code>
                      </div>
                    )}

                    {booking.razorpayOrderId && (
                      <div>
                        <span className="font-semibold text-slate-500">Order ID: </span>
                        <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">
                          {booking.razorpayOrderId}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
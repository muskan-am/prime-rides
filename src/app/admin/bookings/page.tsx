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

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

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

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Booking Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review, approve, update status, and inspect breakdown of all customer reservations.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reservations</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{bookings.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Confirmed Active</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{confirmedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{completedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{cancelledCount}</p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-3xl mb-3">📑</div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-sm text-slate-500 mt-1">Customer bookings will appear here once submitted.</p>
          </div>
        ) : (
          bookings.map((booking) => {
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

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColors[booking.status] || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {booking.status}
                    </span>
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

                  {/* Pricing Breakdown (3 cols) */}
                  <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-5 text-right">
                    <p className="text-xs text-slate-500">Total Booking Price</p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {formatAmount(booking.totalAmount)}
                    </p>
                    <div className="mt-1 text-[11px] text-slate-500 space-y-0.5">
                      <p>Rent: {formatAmount(booking.rentalAmount)}</p>
                      {booking.taxAmount ? <p>Tax: {formatAmount(booking.taxAmount)}</p> : null}
                      {booking.deliveryCharge ? <p>Delivery: {formatAmount(booking.deliveryCharge)}</p> : null}
                    </div>
                  </div>
                </div>

                {/* Footer Details Bar */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>📍 Pickup Hub: <strong className="text-slate-700">{booking.location.name}</strong></span>
                    <span>🚚 Method: <strong className="text-slate-700">{booking.pickupOption?.name || "Standard Pickup"}</strong></span>
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
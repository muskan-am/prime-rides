import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";
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

function getStatusClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function AdminBookingsPage() {
  /* -------------------------------- */
  /* Authentication */
  /* -------------------------------- */

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  /* -------------------------------- */
  /* Admin Authorization */
  /* -------------------------------- */

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  /* -------------------------------- */
  /* Fetch Bookings */
  /* -------------------------------- */

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

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Booking Management
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage all customer vehicle bookings.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                bookings.filter(
                  (booking) =>
                    booking.status === "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                bookings.filter(
                  (booking) =>
                    booking.status === "CONFIRMED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                bookings.filter(
                  (booking) =>
                    booking.status === "COMPLETED"
                ).length
              }
            </p>
          </div>

        </div>

        {/* Bookings */}
        <div className="mt-8">

          {bookings.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <h2 className="text-lg font-semibold">
                No Bookings Found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Customer bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {bookings.map((booking) => {

                const rentalType =
                  booking.rentalPackage
                    ? booking.rentalPackage.name
                    : booking.monthlyPlan
                    ? booking.monthlyPlan.name
                    : "N/A";

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border bg-card"
                  >

                    {/* Booking Header */}
                    <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Booking ID
                        </p>

                        <p className="mt-1 break-all text-sm font-medium">
                          {booking.id}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <BookingStatusSelect
                        bookingId={booking.id}
                        currentStatus={booking.status}
                       />

                    </div>

                    {/* Main Information */}
                    <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr]">

                      {/* Vehicle Image */}
                      <div className="overflow-hidden rounded-xl border bg-muted">

                        {booking.vehicle.primaryImage ? (
                          <img
                            src={
                              booking.vehicle.primaryImage
                            }
                            alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                            No Image
                          </div>
                        )}

                      </div>

                      {/* Vehicle + Customer */}
                      <div>

                        <p className="text-xs text-muted-foreground">
                          Vehicle
                        </p>

                        <h2 className="mt-1 text-xl font-bold">
                          {booking.vehicle.brand}{" "}
                          {booking.vehicle.model}
                        </h2>

                        {booking.vehicle.variant && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.vehicle.variant}
                          </p>
                        )}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                          {/* Customer */}
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Customer
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {booking.user.name ||
                                "Not available"}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {booking.user.email}
                            </p>

                            {booking.user.mobile && (
                              <p className="text-sm text-muted-foreground">
                                {booking.user.mobile}
                              </p>
                            )}
                          </div>

                          {/* Rental Type */}
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Rental Type
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {rentalType}
                            </p>

                            {booking.rentalPackage && (
                              <p className="text-xs text-muted-foreground">
                                {
                                  booking.rentalPackage
                                    .duration
                                }{" "}
                                day(s)
                              </p>
                            )}

                            {booking.monthlyPlan && (
                              <p className="text-xs text-muted-foreground">
                                {
                                  booking.monthlyPlan
                                    .months
                                }{" "}
                                month(s)
                              </p>
                            )}
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Booking Details */}
                    <div className="grid gap-5 border-t p-5 sm:grid-cols-2 lg:grid-cols-4">

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(
                            booking.startDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          End Date
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(
                            booking.endDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Pickup Location
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {booking.location.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {booking.location.address}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Pickup Option
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {booking.pickupOption?.name ||
                            "Not selected"}
                        </p>
                      </div>

                    </div>

                    {/* Amount Summary */}
                    <div className="border-t p-5">

                      <h3 className="text-base font-semibold">
                        Payment Summary
                      </h3>

                      <div className="mt-4 space-y-3 text-sm">

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Rental Amount
                          </span>

                          <span className="font-medium">
                            {formatAmount(
                              booking.rentalAmount
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Delivery Charge
                          </span>

                          <span>
                            {formatAmount(
                              booking.deliveryCharge
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tax
                          </span>

                          <span>
                            {formatAmount(
                              booking.taxAmount
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Discount
                          </span>

                          <span>
                            -{formatAmount(
                              booking.discountAmount
                            )}
                          </span>
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex justify-between text-base font-bold">
                            <span>Total</span>

                            <span>
                              {formatAmount(
                                booking.totalAmount
                              )}
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Created At */}
                    <div className="border-t px-5 py-4 text-xs text-muted-foreground">
                      Booking created on{" "}
                      {formatDate(
                        booking.createdAt
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
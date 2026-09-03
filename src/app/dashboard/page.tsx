import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

import LogoutButton from "@/components/auth/LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // User is not logged in
  if (!session?.user) {
    redirect("/login");
  }

  /*
   * Find the current user from the database.
   * We use the email from the authenticated session.
   */
  const user = session.user.email
    ? await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        select: {
          id: true,
        },
      })
    : null;

  /*
   * If the authenticated user does not exist
   * in the database, show an empty booking list.
   */
  const bookings = user
    ? await prisma.booking.findMany({
        where: {
          userId: user.id,
        },

        include: {
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

        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* =====================================
            Header
        ===================================== */}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {session.user.name || "Customer"}
            </h1>
          </div>

          <LogoutButton />
        </div>

        {/* =====================================
            Account Information
        ===================================== */}

        <div className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            Account Information
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">
                Name:
              </span>{" "}
              {session.user.name ||
                "Not available"}
            </p>

            <p>
              <span className="font-medium">
                Email:
              </span>{" "}
              {session.user.email ||
                "Not available"}
            </p>
          </div>
        </div>

        {/* =====================================
            My Bookings
        ===================================== */}

        <div className="mt-6 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                My Bookings
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your vehicle bookings
              </p>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {bookings.length}{" "}
              {bookings.length === 1
                ? "Booking"
                : "Bookings"}
            </span>
          </div>

          {/* Empty State */}

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">
                No bookings yet
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Your bookings will appear here
                after you book a vehicle.
              </p>
            </div>
          ) : (
            /* ===================================
               Booking List
            =================================== */

            <div className="mt-6 space-y-5">
              {bookings.map((booking) => {
                /* =================================
                   Calculate Applied Tax Percentage
                ================================= */

                const rentalAmount =
                  Number(booking.rentalAmount);

                const taxAmount =
                  Number(booking.taxAmount);

                const taxRate =
                  rentalAmount > 0
                    ? (taxAmount /
                        rentalAmount) *
                      100
                    : 0;

                const formattedTaxRate =
                  Number.isInteger(taxRate)
                    ? taxRate.toString()
                    : taxRate.toFixed(2);

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border"
                  >
                    {/* Booking Header */}

                    <div className="flex flex-col gap-3 border-b bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Booking ID
                        </p>

                        <p className="mt-1 break-all text-sm font-medium">
                          {booking.id}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status ===
                          "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : booking.status ===
                                "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : booking.status ===
                                  "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Booking Body */}

                    <div className="p-5">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">

                        {/* Vehicle Image */}

                        <div className="flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl bg-muted">
                          {booking.vehicle
                            .primaryImage ? (
                            <img
                              src={
                                booking.vehicle
                                  .primaryImage
                              }
                              alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                              className="h-full min-h-[140px] w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No Image
                            </span>
                          )}
                        </div>

                        {/* Vehicle Information */}

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Vehicle
                          </p>

                          <h3 className="mt-1 text-xl font-bold">
                            {
                              booking.vehicle
                                .brand
                            }{" "}
                            {
                              booking.vehicle
                                .model
                            }
                          </h3>

                          {booking.vehicle
                            .variant && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {
                                booking.vehicle
                                  .variant
                              }
                            </p>
                          )}

                          {/* Rental Type */}

                          <div className="mt-5">
                            <p className="text-xs text-muted-foreground">
                              Rental Type
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {booking.rentalPackage
                                ? booking
                                    .rentalPackage
                                    .name
                                : booking.monthlyPlan
                                  ? booking
                                      .monthlyPlan
                                      .name
                                  : "Normal Days"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =================================
                          Booking Details
                      ================================= */}

                      <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Start Date */}

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Start Date
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {new Date(
                              booking.startDate
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        {/* End Date */}

                        <div>
                          <p className="text-xs text-muted-foreground">
                            End Date
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {new Date(
                              booking.endDate
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        {/* Pickup Location */}

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pickup Location
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {
                              booking.location
                                .name
                            }
                          </p>

                          {booking.location
                            .address && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                booking.location
                                  .address
                              }
                            </p>
                          )}
                        </div>

                        {/* Pickup Option */}

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pickup Option
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {booking.pickupOption
                              ?.name ||
                              "—"}
                          </p>
                        </div>
                      </div>

                      {/* =================================
                          Amount
                      ================================= */}

                      <div className="mt-6 border-t pt-5">

                        {/* Rental Amount */}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Rental Amount
                          </span>

                          <span className="text-sm font-medium">
                            ₹
                            {rentalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* Delivery Charge */}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Delivery Charge
                          </span>

                          <span className="text-sm">
                            ₹
                            {Number(
                              booking.deliveryCharge
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* Tax */}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Tax ({formattedTaxRate}%)
                          </span>

                          <span className="text-sm">
                            ₹
                            {taxAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* Discount */}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Discount
                          </span>

                          <span className="text-sm">
                            -₹
                            {Number(
                              booking.discountAmount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* Total */}

                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                          <span className="font-semibold">
                            Total
                          </span>

                          <span className="text-xl font-bold">
                            ₹
                            {Number(
                              booking.totalAmount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Created At */}

                      <div className="mt-4 text-xs text-muted-foreground">
                        Booked on{" "}
                        {new Date(
                          booking.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>
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
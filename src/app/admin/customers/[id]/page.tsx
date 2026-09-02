import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function CustomerDetailsPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  /* -------------------------------- */
  /* Authentication */
  /* -------------------------------- */

  if (!session?.user) {
    redirect("/login");
  }

  /* -------------------------------- */
  /* Admin Authorization */
  /* -------------------------------- */

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  /* -------------------------------- */
  /* Fetch Customer */
  /* -------------------------------- */

  const customer = await prisma.user.findFirst({
    where: {
      id,
      role: "CUSTOMER",
    },

    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      image: true,
      createdAt: true,
      updatedAt: true,

      customerProfile: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
        },
      },

      bookings: {
        orderBy: {
          createdAt: "desc",
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
      },
    },
  });

  /* -------------------------------- */
  /* Customer Not Found */
  /* -------------------------------- */

  if (!customer) {
    notFound();
  }

  /* -------------------------------- */
  /* Booking Statistics */
  /* -------------------------------- */

  const totalBookings =
    customer.bookings.length;

  const pendingBookings =
    customer.bookings.filter(
      (booking) =>
        booking.status === "PENDING"
    ).length;

  const confirmedBookings =
    customer.bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED"
    ).length;

  const completedBookings =
    customer.bookings.filter(
      (booking) =>
        booking.status === "COMPLETED"
    ).length;

  const cancelledBookings =
    customer.bookings.filter(
      (booking) =>
        booking.status === "CANCELLED"
    ).length;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            Header
        ===================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Link
              href="/admin/customers"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              ← Back to Customers
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Customer Details
            </h1>
          </div>

          <LogoutButton />

        </div>

        {/* =====================================
            Customer Profile
        ===================================== */}

        <div className="mt-8 rounded-2xl border bg-card p-6">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Avatar */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-3xl font-bold">
              {(
                customer.name?.charAt(0) ||
                "C"
              ).toUpperCase()}
            </div>

            {/* Basic Information */}

            <div className="min-w-0">

              <h2 className="text-2xl font-bold">
                {customer.name ||
                  "Unnamed Customer"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {customer.email}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {customer.mobile ||
                  "Mobile not available"}
              </p>

            </div>

          </div>

          {/* Customer Information */}

          <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs text-muted-foreground">
                Customer ID
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {customer.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Joined
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(
                  customer.createdAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Last Updated
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(
                  customer.updatedAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Location
              </p>

              <p className="mt-1 text-sm font-medium">
                {customer.customerProfile
                  ?.city ||
                  customer.customerProfile
                    ?.state ||
                  "Not available"}
              </p>
            </div>

          </div>

          {/* Address */}

          {customer.customerProfile && (
            <div className="mt-6 border-t pt-6">

              <p className="text-xs text-muted-foreground">
                Address
              </p>

              <p className="mt-1 text-sm font-medium">
                {customer.customerProfile
                  .address ||
                  "Address not available"}
              </p>

              {(customer.customerProfile
                .city ||
                customer.customerProfile
                  .state ||
                customer.customerProfile
                  .postalCode) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[
                    customer.customerProfile
                      .city,
                    customer.customerProfile
                      .state,
                    customer.customerProfile
                      .postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

            </div>
          )}

        </div>

        {/* =====================================
            Booking Statistics
        ===================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalBookings}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingBookings}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {confirmedBookings}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completedBookings}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold">
              {cancelledBookings}
            </p>
          </div>

        </div>

        {/* =====================================
            Booking History
        ===================================== */}

        <div className="mt-8 rounded-2xl border bg-card">

          <div className="border-b p-6">

            <h2 className="text-lg font-semibold">
              Booking History
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              All bookings made by this customer.
            </p>

          </div>

          {customer.bookings.length === 0 ? (
            <div className="p-10 text-center">

              <p className="font-medium">
                No bookings found
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                This customer has not booked a
                vehicle yet.
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {customer.bookings.map(
                (booking) => {
                  const rentalType =
                    booking.rentalPackage
                      ? booking.rentalPackage.name
                      : booking.monthlyPlan
                      ? booking.monthlyPlan.name
                      : "N/A";

                  return (
                    <div
                      key={booking.id}
                      className="p-6"
                    >

                      {/* Booking Top */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

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

                      </div>

                      {/* Vehicle */}

                      <div className="mt-6 flex flex-col gap-5 sm:flex-row">

                        <div className="h-32 w-full overflow-hidden rounded-xl bg-muted sm:w-44">

                          {booking.vehicle
                            .primaryImage ? (
                            <img
                              src={
                                booking.vehicle
                                  .primaryImage
                              }
                              alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}

                        </div>

                        <div>

                          <p className="text-xs text-muted-foreground">
                            Vehicle
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {
                              booking
                                .vehicle
                                .brand
                            }{" "}
                            {
                              booking
                                .vehicle
                                .model
                            }
                          </h3>

                          {booking.vehicle
                            .variant && (
                            <p className="text-sm text-muted-foreground">
                              {
                                booking
                                  .vehicle
                                  .variant
                              }
                            </p>
                          )}

                          <p className="mt-3 text-sm">
                            <span className="text-muted-foreground">
                              Rental:
                            </span>{" "}
                            <span className="font-medium">
                              {rentalType}
                            </span>
                          </p>

                        </div>

                      </div>

                      {/* Booking Details */}

                      <div className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">

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
                            {booking.location
                              .name}
                          </p>

                          {booking.location
                            .address && (
                            <p className="text-xs text-muted-foreground">
                              {
                                booking
                                  .location
                                  .address
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pickup Option
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {booking.pickupOption
                              ?.name ||
                              "Not selected"}
                          </p>
                        </div>

                      </div>

                      {/* Amount */}

                      <div className="mt-6 border-t pt-5">

                        <div className="flex items-center justify-between">

                          <span className="text-sm text-muted-foreground">
                            Total Amount
                          </span>

                          <span className="text-xl font-bold">
                            {formatAmount(
                              booking.totalAmount
                            )}
                          </span>

                        </div>

                      </div>

                      {/* Created */}

                      <p className="mt-4 text-xs text-muted-foreground">
                        Booked on{" "}
                        {formatDate(
                          booking.createdAt
                        )}
                      </p>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalCustomers,
    totalVehicles,
    revenueResult,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count(),

    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.booking.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.vehicle.count(),

    prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
    }),

    prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            brand: true,
            model: true,
          },
        },
      },
    }),
  ]);

  const totalRevenue = Number(
    revenueResult._sum.totalAmount ?? 0
  );

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Reports
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Platform performance and booking reports.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Overview */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Overview
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalBookings}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Customers
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalCustomers}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Vehicles
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalVehicles}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Revenue
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>

          </div>
        </section>

        {/* Booking Status */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Booking Status
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold">
                {pendingBookings}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Confirmed
              </p>

              <p className="mt-2 text-2xl font-bold">
                {confirmedBookings}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold">
                {completedBookings}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Cancelled
              </p>

              <p className="mt-2 text-2xl font-bold">
                {cancelledBookings}
              </p>
            </div>

          </div>
        </section>

        {/* Recent Bookings */}
        <section className="mt-8 rounded-2xl border bg-card">

          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Recent Bookings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest vehicle bookings on the platform.
            </p>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No bookings found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Booking activity will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div>
                    <p className="font-semibold">
                      {booking.vehicle.brand}{" "}
                      {booking.vehicle.model}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Customer:{" "}
                      {booking.user.name ||
                        booking.user.email}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Booking ID: {booking.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {booking.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Start Date
                      </p>

                      <p className="mt-1 text-sm">
                        {booking.startDate.toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        End Date
                      </p>

                      <p className="mt-1 text-sm">
                        {booking.endDate.toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        ₹
                        {Number(
                          booking.totalAmount
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
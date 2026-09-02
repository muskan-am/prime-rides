import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogoutButton from "@/components/auth/LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // User is not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMIN can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  /* -------------------------------- */
  /* Dashboard Statistics */
  /* -------------------------------- */

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalVehicles,
    totalCustomers,
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

    prisma.vehicle.count(),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),
  ]);

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
              Admin Dashboard
            </h1>
          </div>

          <LogoutButton />
        </div>

        {/* Welcome Card */}
        <div className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">
            Welcome, {session.user.name || "Admin"} 👋
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            You are logged in as an administrator.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">
                Name:
              </span>{" "}
              {session.user.name || "Not available"}
            </p>

            <p>
              <span className="font-medium">
                Email:
              </span>{" "}
              {session.user.email || "Not available"}
            </p>

            <p>
              <span className="font-medium">
                Role:
              </span>{" "}
              {session.user.role}
            </p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Bookings */}
          <Link
            href="/admin/bookings"
            className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalBookings}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              View all bookings →
            </p>
          </Link>

          {/* Pending */}
          <Link
            href="/admin/bookings"
            className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">
              Pending Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingBookings}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Requires attention →
            </p>
          </Link>

          {/* Confirmed */}
          <Link
            href="/admin/bookings"
            className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">
              Confirmed Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {confirmedBookings}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Active bookings →
            </p>
          </Link>

          {/* Completed */}
          <Link
            href="/admin/bookings"
            className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">
              Completed Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completedBookings}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Completed rentals →
            </p>
          </Link>

        </div>

        {/* Admin Modules */}
        <div className="mt-8">

          <h2 className="text-xl font-semibold">
            Admin Modules
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Vehicles */}
            <Link
              href="/admin/vehicles"
              className="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-semibold">
                Vehicles
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage rental vehicles
              </p>

              <p className="mt-4 text-2xl font-bold">
                {totalVehicles}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Total vehicles →
              </p>
            </Link>

            {/* Bookings */}
            <Link
              href="/admin/bookings"
              className="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-semibold">
                Bookings
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage customer bookings
              </p>

              <p className="mt-4 text-2xl font-bold">
                {totalBookings}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage bookings →
              </p>
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              className="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-semibold">
                Customers
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage customers
              </p>

              <p className="mt-4 text-2xl font-bold">
                {totalCustomers}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Customers registered →
              </p>
            </Link>

            {/* Reports */}
            <Link
              href="/admin/reports"
              className="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-semibold">
                Reports
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                View platform reports
              </p>

              <p className="mt-4 text-sm font-medium">
                View reports →
              </p>
            </Link>

          </div>
        </div>

      </div>
    </main>
  );
}
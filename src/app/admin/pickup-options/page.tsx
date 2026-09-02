import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";
import PickupOptionActions from "@/components/admin/PickupOptionActions";

export default async function AdminPickupOptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pickupOptions = await prisma.pickupOption.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  const activeOptions = pickupOptions.filter(
    (option) => option.isActive
  ).length;

  const inactiveOptions = pickupOptions.filter(
    (option) => !option.isActive
  ).length;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              ← Back to Admin Dashboard
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Pickup Options
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage pickup options available for customer bookings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pickup-options/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              + Add Pickup Option
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Options
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pickupOptions.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Active Options
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeOptions}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Inactive Options
            </p>

            <p className="mt-2 text-3xl font-bold">
              {inactiveOptions}
            </p>
          </div>

        </div>

        {/* Pickup Options List */}
        <div className="mt-8 rounded-2xl border bg-card">

          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">
              All Pickup Options
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Options customers can select while making a booking.
            </p>
          </div>

          {/* Empty State */}
          {pickupOptions.length === 0 ? (
            <div className="p-10 text-center">

              <p className="font-medium">
                No pickup options found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first pickup option.
              </p>

              <Link
                href="/admin/pickup-options/new"
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Add Pickup Option
              </Link>

            </div>
          ) : (
            <div className="divide-y">

              {pickupOptions.map((option) => (
                <div
                  key={option.id}
                  className="p-6 transition hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Option Information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-semibold">
                          {option.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            option.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {option.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {option.description ||
                          "No description available"}
                      </p>

                    </div>

                    {/* Booking Count */}
                    <div className="shrink-0">
                      <p className="text-xs text-muted-foreground">
                        Bookings
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {option._count.bookings}
                      </p>
                    </div>

                    {/* Actions */}
                    <PickupOptionActions
                      id={option.id}
                      name={option.name}
                      isActive={option.isActive}
                      hasBookings={
                        option._count.bookings > 0
                      }
                    />

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
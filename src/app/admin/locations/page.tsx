import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";
import LocationActions from "@/components/admin/LocationActions";

export default async function AdminLocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const locations = await prisma.location.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          bookings: true,
          inventory: true,
        },
      },
    },
  });

  const activeLocations = locations.filter(
    (location) => location.isActive
  ).length;

  const inactiveLocations = locations.filter(
    (location) => !location.isActive
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
              Location Management
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage pickup and rental locations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/locations/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              + Add Location
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          {/* Total */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Locations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {locations.length}
            </p>
          </div>

          {/* Active */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Active Locations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeLocations}
            </p>
          </div>

          {/* Inactive */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Inactive Locations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {inactiveLocations}
            </p>
          </div>

        </div>

        {/* Location List */}
        <div className="mt-8 rounded-2xl border bg-card">

          {/* List Header */}
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">
              All Locations
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Locations available for vehicle bookings.
            </p>
          </div>

          {/* Empty State */}
          {locations.length === 0 ? (
            <div className="p-10 text-center">

              <p className="font-medium">
                No locations found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first rental location.
              </p>

              <Link
                href="/admin/locations/new"
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Add Location
              </Link>

            </div>
          ) : (
            <div className="divide-y">

              {locations.map((location) => (
                <div
                  key={location.id}
                  className="p-6 transition hover:bg-muted/20"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Location Information */}
                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-semibold">
                          {location.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            location.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {location.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>

                      </div>

                      <div className="mt-3 space-y-1">

                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Address:
                          </span>{" "}
                          {location.address || "Not available"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Phone:
                          </span>{" "}
                          {location.phone || "Not available"}
                        </p>

                      </div>

                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Bookings
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {location._count.bookings}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Inventory
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {location._count.inventory}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Coordinates
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {location.latitude !== null &&
                          location.longitude !== null
                            ? "Available"
                            : "Not set"}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}
                    <LocationActions
                      id={location.id}
                      name={location.name}
                      isActive={location.isActive}
                      hasBookings={location._count.bookings > 0}
                      hasInventory={location._count.inventory > 0}
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
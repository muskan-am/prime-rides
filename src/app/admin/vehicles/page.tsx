import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Header */}
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Vehicles
            </h1>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link
              href="/admin"
              className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition hover:bg-muted sm:flex-none"
            >
              Admin Dashboard
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Management Header */}
        <div className="mt-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              Vehicle Management
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage all rental vehicles.
            </p>
          </div>

          <Link
            href="/admin/vehicles/new"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-auto"
          >
            + Add Vehicle
          </Link>
        </div>

        {/* Empty State */}
        {vehicles.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-8 text-center sm:p-12">
            <h3 className="text-xl font-semibold">
              No vehicles found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Add your first rental vehicle to get started.
            </p>

            <Link
              href="/admin/vehicles/new"
              className="mt-6 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              + Add Vehicle
            </Link>
          </div>
        ) : (
          <>
            {/* ============================= */}
            {/* DESKTOP TABLE */}
            {/* ============================= */}

            <div className="mt-8 hidden w-full min-w-0 overflow-hidden rounded-2xl border bg-card md:block">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Vehicle
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Registration
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Fuel
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Transmission
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Seats
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Price
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Availability
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Maintenance
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="transition hover:bg-muted/20"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            {vehicle.primaryImage ? (
                              <img
                                src={vehicle.primaryImage}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="h-14 w-20 shrink-0 rounded-lg border object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold">
                                {vehicle.brand} {vehicle.model}
                              </p>

                              {vehicle.variant && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {vehicle.variant}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5">
                          {vehicle.registrationNumber || "—"}
                        </td>

                        <td className="px-5 py-5">
                          {vehicle.fuelType || "—"}
                        </td>

                        <td className="px-5 py-5">
                          {vehicle.transmission || "—"}
                        </td>

                        <td className="px-5 py-5">
                          {vehicle.seatingCapacity || "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5">
                          ₹{vehicle.basePrice.toString()}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            type="availability"
                            value={vehicle.availabilityStatus}
                          />
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            type="maintenance"
                            value={vehicle.maintenanceStatus}
                          />
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/vehicles/${vehicle.id}`}
                            className="inline-flex rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================= */}
            {/* MOBILE CARDS */}
            {/* ============================= */}

            <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-4 md:hidden">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-card"
                >
                  {/* Vehicle Header */}
                  <div className="flex min-w-0 gap-3 p-4 sm:gap-4">
                    {vehicle.primaryImage ? (
                      <img
                        src={vehicle.primaryImage}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-20 w-24 shrink-0 rounded-xl border object-cover sm:h-24 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border bg-muted text-xs text-muted-foreground sm:h-24 sm:w-28">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold sm:text-lg">
                        {vehicle.brand} {vehicle.model}
                      </h3>

                      {vehicle.variant && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {vehicle.variant}
                        </p>
                      )}

                      <p className="mt-2 break-all text-sm font-medium">
                        {vehicle.registrationNumber ||
                          "No registration"}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid min-w-0 grid-cols-2 border-t">
                    <DetailItem
                      label="Fuel"
                      value={vehicle.fuelType || "—"}
                    />

                    <DetailItem
                      label="Transmission"
                      value={vehicle.transmission || "—"}
                    />

                    <DetailItem
                      label="Seats"
                      value={
                        vehicle.seatingCapacity
                          ? String(vehicle.seatingCapacity)
                          : "—"
                      }
                    />

                    <DetailItem
                      label="Price"
                      value={`₹${vehicle.basePrice.toString()}`}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex min-w-0 flex-wrap gap-2 border-t p-4">
                    <StatusBadge
                      type="availability"
                      value={vehicle.availabilityStatus}
                    />

                    <StatusBadge
                      type="maintenance"
                      value={vehicle.maintenanceStatus}
                    />
                  </div>

                  {/* Action */}
                  <div className="border-t p-4">
                    <Link
                      href={`/admin/vehicles/${vehicle.id}`}
                      className="flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                    >
                      View Vehicle
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Total vehicles: {vehicles.length}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

/* ============================= */
/* DETAIL ITEM */
/* ============================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden border-b p-3 sm:p-4">
      <p className="truncate text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 min-w-0 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

/* ============================= */
/* STATUS BADGE */
/* ============================= */

function StatusBadge({
  type,
  value,
}: {
  type: "availability" | "maintenance";
  value: string;
}) {
  const isGood =
    type === "availability"
      ? value === "AVAILABLE"
      : value === "GOOD";

  return (
    <span
      className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-medium ${
        isGood
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {value}
    </span>
  );
}
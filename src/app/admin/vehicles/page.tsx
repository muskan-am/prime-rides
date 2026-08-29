import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);

  // Login check
  if (!session?.user) {
    redirect("/login");
  }

  // Admin check
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Vehicles
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Admin Dashboard
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Vehicle Management
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage all rental vehicles.
            </p>
          </div>

          <Link
            href="/admin/vehicles/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            + Add Vehicle
          </Link>
        </div>

        {/* Vehicle List */}
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">

          {vehicles.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold">
                No vehicles found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Add your first rental vehicle to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-left font-semibold">
                      Variant
                    </th>

                    <th className="px-6 py-4 text-left font-semibold">
                      Fuel
                    </th>

                    <th className="px-6 py-4 text-left font-semibold">
                      Transmission
                    </th>

                    <th className="px-6 py-4 text-left font-semibold">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left font-semibold">
                      Availability
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </div>

                        {vehicle.registrationNumber && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {vehicle.registrationNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle.variant || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle.fuelType || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle.transmission || "-"}
                      </td>

                      <td className="px-6 py-4">
                        ₹{vehicle.basePrice.toString()}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle.availabilityStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
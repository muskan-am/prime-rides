import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fleet Vehicle Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage specs, availability, rental rates, and maintenance of your vehicles.
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Vehicle
        </Link>
      </div>

      {/* Empty State */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-4">
            🚘
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Vehicles Listed</h3>
          <p className="mt-2 text-sm text-slate-500">
            Start building your rental fleet by adding your first vehicle.
          </p>
          <Link
            href="/admin/vehicles/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            + Add Vehicle
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Mobile Card List View (sm:hidden) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-center gap-3">
                  {vehicle.primaryImage ? (
                    <div className="relative h-14 w-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <Image
                        src={vehicle.primaryImage}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-400">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {vehicle.registrationNumber || "No Reg Plate"}
                    </p>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">
                      ₹{vehicle.basePrice.toString()}/day
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge type="availability" value={vehicle.availabilityStatus} />
                    <StatusBadge type="maintenance" value={vehicle.maintenanceStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/vehicles/${vehicle.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/admin/vehicles/${vehicle.id}/edit`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto min-w-0">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4">Specs</th>
                  <th className="px-6 py-4">Daily Rate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Maintenance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {vehicle.primaryImage ? (
                          <div className="relative h-12 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <Image
                              src={vehicle.primaryImage}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-400">
                            No Image
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          {vehicle.variant && (
                            <p className="text-xs text-slate-500">{vehicle.variant}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {vehicle.registrationNumber || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {vehicle.fuelType || "Petrol"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {vehicle.transmission || "Automatic"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {vehicle.seatingCapacity || 5} Seats
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          {vehicle.hasAirConditioning !== false ? "AC" : "Non-AC"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{vehicle.basePrice.toString()} <span className="text-xs font-normal text-slate-500">/day</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        type="availability"
                        value={vehicle.availabilityStatus}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        type="maintenance"
                        value={vehicle.maintenanceStatus}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/admin/vehicles/${vehicle.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Total Listed Vehicles: <strong className="text-slate-900">{vehicles.length}</strong></span>
            <span>All vehicles are verified and tracked.</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isGood
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? "bg-emerald-500" : "bg-rose-500"}`} />
      {value}
    </span>
  );
}
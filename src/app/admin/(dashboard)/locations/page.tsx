import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LocationActions from "@/components/admin/LocationActions";

export default async function AdminLocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const locations = await prisma.location.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          bookings: true,
          inventory: true,
        },
      },
    },
  });

  const activeLocations = locations.filter((l) => l.isActive).length;
  const inactiveLocations = locations.filter((l) => !l.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Hub Location Management
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Configure pickup hubs, depot addresses, active status, and inventory.
          </p>
        </div>

        <Link
          href="/admin/locations/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
        >
          + Add New Location
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hubs</p>
          <p className="text-3xl font-extrabold text-[#0A1128] mt-2">{locations.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Hubs</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{activeLocations}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Inactive Hubs</p>
          <p className="text-3xl font-extrabold text-rose-700 mt-2">{inactiveLocations}</p>
        </div>
      </div>

      {/* Locations List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-[#0A1128] text-lg">Configured Rental Hubs</h2>
          <span className="text-xs font-semibold text-slate-500">Total: {locations.length}</span>
        </div>

        {locations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No locations created yet. Click above to add your first hub.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {locations.map((loc) => (
              <div key={loc.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#0A1128]">{loc.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          loc.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {loc.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <p>📍 {loc.address || "Address not specified"}</p>
                      {loc.phone && <p>📞 Phone: {loc.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-700">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Reservations</span>
                      <strong className="text-[#0A1128] text-sm">{loc._count.bookings}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Inventory</span>
                      <strong className="text-[#0A1128] text-sm">{loc._count.inventory}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">GPS Sync</span>
                      <strong className="text-emerald-700 text-sm">
                        {loc.latitude ? "Set" : "None"}
                      </strong>
                    </div>
                  </div>

                  <LocationActions
                    id={loc.id}
                    name={loc.name}
                    isActive={loc.isActive}
                    hasBookings={loc._count.bookings > 0}
                    hasInventory={loc._count.inventory > 0}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
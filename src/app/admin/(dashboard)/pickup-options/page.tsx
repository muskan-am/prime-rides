import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PickupOptionActions from "@/components/admin/PickupOptionActions";

export default async function AdminPickupOptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const pickupOptions = await prisma.pickupOption.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  const activeOptions = pickupOptions.filter((o) => o.isActive).length;
  const inactiveOptions = pickupOptions.filter((o) => !o.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Pickup Method Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure delivery methods (Self Pickup, Doorstep Delivery) and status.
          </p>
        </div>

        <Link
          href="/admin/pickup-options/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          + Add Pickup Option
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Options</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{pickupOptions.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Options</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{activeOptions}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Inactive Options</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-2">{inactiveOptions}</p>
        </div>
      </div>

      {/* Pickup Options List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">Configured Pickup Methods</h2>
          <span className="text-xs text-slate-500">Total: {pickupOptions.length}</span>
        </div>

        {pickupOptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No pickup options added yet. Click above to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pickupOptions.map((opt) => (
              <div key={opt.id} className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{opt.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          opt.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {opt.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {opt.description || "No description specified."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px] self-start sm:self-auto">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Reservations</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{opt._count.bookings}</strong>
                  </div>

                  <PickupOptionActions
                    id={opt.id}
                    name={opt.name}
                    isActive={opt.isActive}
                    hasBookings={opt._count.bookings > 0}
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
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
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
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.vehicle.count(),
    prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { brand: true, model: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Platform Analytics & Business Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time financial performance, booking conversions, and fleet breakdown metrics.
          </p>
        </div>
      </div>

      {/* Revenue Highlight Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E293B] border border-slate-800 p-6 lg:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Gross Platform Revenue</span>
            <p className="text-3xl lg:text-4xl font-black text-white mt-1">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-300 mt-1">Confirmed + Completed Bookings</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Total Reservations</span>
            <p className="text-3xl lg:text-4xl font-black text-white mt-1">{totalBookings}</p>
            <p className="text-xs text-slate-300 mt-1">Lifetime booking volume</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Active Customers</span>
            <p className="text-3xl lg:text-4xl font-black text-white mt-1">{totalCustomers}</p>
            <p className="text-xs text-slate-300 mt-1">Registered customer users</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Fleet Size</span>
            <p className="text-3xl lg:text-4xl font-black text-white mt-1">{totalVehicles}</p>
            <p className="text-xs text-slate-300 mt-1">Vehicles in system</p>
          </div>
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[#0A1128] mb-4">Reservation Status Distribution</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{pendingBookings}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${totalBookings ? (pendingBookings / totalBookings) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Confirmed Active</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{confirmedBookings}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${totalBookings ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Completed</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{completedBookings}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${totalBookings ? (completedBookings / totalBookings) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Cancelled</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{cancelledBookings}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${totalBookings ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Audit Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">Recent Financial Transactions</h2>
          <span className="text-xs text-slate-500">Last 5 bookings</span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No recent transaction history recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {b.vehicle.brand} {b.vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customer: <span className="text-slate-800 font-semibold">{b.user.name || b.user.email}</span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">ID: {b.id}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-600 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                      <strong className="text-slate-800 font-bold">{b.status}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Price</span>
                      <strong className="text-emerald-600 text-base font-black">
                        ₹{Number(b.totalAmount).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
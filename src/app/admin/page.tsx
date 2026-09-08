import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  /* -------------------------------- */
  /* Fetch Statistics & Recent Data */
  /* -------------------------------- */
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalVehicles,
    totalCustomers,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.vehicle.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        user: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E293B] border border-slate-800 p-6 lg:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Prime Rides Control Center
              </span>
              <span className="text-xs text-slate-300">
                System Status: <span className="text-emerald-400 font-medium">● Operational</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {session.user.name || "Admin"} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Here is what is happening with your rental fleet today.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <Link
          href="/admin/bookings"
          className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{totalBookings}</span>
            <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              View all →
            </span>
          </div>
        </Link>

        {/* Pending Bookings */}
        <Link
          href="/admin/bookings?status=PENDING"
          className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{pendingBookings}</span>
            <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Review now →
            </span>
          </div>
        </Link>

        {/* Confirmed Bookings */}
        <Link
          href="/admin/bookings?status=CONFIRMED"
          className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rentals</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{confirmedBookings}</span>
            <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Active →
            </span>
          </div>
        </Link>

        {/* Fleet Vehicles */}
        <Link
          href="/admin/vehicles"
          className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Vehicles</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{totalVehicles}</span>
            <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Manage fleet →
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Modules Quick Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Management Modules
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/vehicles"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                🚘
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Vehicles</h3>
                <p className="text-xs text-slate-500">{totalVehicles} Listed vehicles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/bookings"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                📑
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Bookings</h3>
                <p className="text-xs text-slate-500">{totalBookings} Total reservations</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Customers</h3>
                <p className="text-xs text-slate-500">{totalCustomers} Registered users</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                📈
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Reports</h3>
                <p className="text-xs text-slate-500">Revenue & Fleet analytics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Reservations</h2>
            <p className="text-xs text-slate-500">Latest customer booking requests</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Bookings →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No bookings found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Total Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => {
                  const statusColors: Record<string, string> = {
                    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
                    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
                  };

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{b.user?.name || "Guest Customer"}</div>
                        <div className="text-xs text-slate-500">{b.user?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {b.vehicle?.brand} {b.vehicle?.model}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {b.vehicle?.registrationNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div>
                          {new Date(b.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(b.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            statusColors[b.status] || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/bookings?id=${b.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
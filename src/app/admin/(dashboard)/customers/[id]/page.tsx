import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatAmount(amount: unknown) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default async function CustomerDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const customer = await prisma.user.findFirst({
    where: {
      id,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      customerProfile: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              variant: true,
              primaryImage: true,
            },
          },
          rentalPackage: {
            select: { id: true, name: true, duration: true, price: true },
          },
          monthlyPlan: {
            select: { id: true, name: true, months: true, price: true },
          },
          pickupOption: { select: { id: true, name: true } },
          location: { select: { id: true, name: true, address: true } },
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalBookings = customer.bookings.length;
  const pendingBookings = customer.bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = customer.bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedBookings = customer.bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledBookings = customer.bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/customers"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Customers Directory
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight mt-1">
            Customer Profile: {customer.name || "User"}
          </h1>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-2xl">
            {(customer.name?.charAt(0) || "C").toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{customer.name || "Unnamed Customer"}</h2>
            <p className="text-sm text-slate-500">{customer.email}</p>
            {customer.mobile && <p className="text-xs text-slate-500 mt-0.5">📞 {customer.mobile}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-5 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider font-semibold">User ID</span>
            <p className="font-mono text-slate-800 mt-1 truncate">{customer.id}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Account Created</span>
            <p className="text-slate-800 mt-1">{formatDate(customer.createdAt)}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider font-semibold">City / Location</span>
            <p className="text-slate-800 mt-1">{customer.customerProfile?.city || "Not Provided"}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Full Address</span>
            <p className="text-slate-800 mt-1 truncate">
              {customer.customerProfile?.address || "No address on file"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalBookings}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingBookings}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{confirmedBookings}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{completedBookings}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{cancelledBookings}</p>
        </div>
      </div>

      {/* Customer Booking History */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Customer Booking History</h2>
          <p className="text-xs text-slate-500">All reservations placed by this user account</p>
        </div>

        {customer.bookings.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            This customer has not placed any vehicle bookings yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customer.bookings.map((b) => (
              <div key={b.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {b.vehicle.primaryImage ? (
                      <div className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <Image
                          src={b.vehicle.primaryImage}
                          alt={`${b.vehicle.brand} ${b.vehicle.model}`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-24 shrink-0 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        No Image
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase">{b.vehicle.brand}</span>
                      <h3 className="font-bold text-slate-900 text-base">{b.vehicle.model}</h3>
                      <p className="text-xs text-slate-500">
                        {formatDate(b.startDate)} to {formatDate(b.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {b.status}
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">
                      {formatAmount(b.totalAmount)}
                    </p>
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
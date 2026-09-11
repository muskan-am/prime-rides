import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminCouponsClient from "@/components/admin/AdminCouponsClient";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { usages: true },
      },
    },
  });

  const formattedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    minBookingValue: c.minBookingValue ? Number(c.minBookingValue) : null,
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    validFrom: c.validFrom.toISOString(),
    validUntil: c.validUntil.toISOString(),
    usageLimit: c.usageLimit,
    usageCount: c._count.usages,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Coupon & Discount Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, monitor, and manage promotional discount coupons for bookings.
          </p>
        </div>

        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Coupon
        </Link>
      </div>

      {/* Client List Component */}
      <AdminCouponsClient initialCoupons={formattedCoupons} />
    </div>
  );
}

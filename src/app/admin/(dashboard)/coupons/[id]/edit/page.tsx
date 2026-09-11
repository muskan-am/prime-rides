import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CouponFormClient from "@/components/admin/CouponFormClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditCouponPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    notFound();
  }

  const formattedData = {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    minBookingValue: coupon.minBookingValue ? Number(coupon.minBookingValue) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    validFrom: coupon.validFrom.toISOString(),
    validUntil: coupon.validUntil.toISOString(),
    usageLimit: coupon.usageLimit,
    isActive: coupon.isActive,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
          <Link href="/admin/coupons" className="hover:text-blue-600">Coupons</Link>
          <span>/</span>
          <span>Edit</span>
          <span>/</span>
          <span className="text-slate-900 font-extrabold">{coupon.code}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Coupon: {coupon.code}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Update discount rates, usage caps, and validity settings without altering past completed booking records.
        </p>
      </div>

      <CouponFormClient initialData={formattedData} isEdit={true} />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CouponFormClient from "@/components/admin/CouponFormClient";

export default async function AdminNewCouponPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
          <Link href="/admin/coupons" className="hover:text-blue-600">Coupons</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Discount Coupon
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Define discount percentage or fixed amount, minimum booking values, and validity window.
        </p>
      </div>

      <CouponFormClient />
    </div>
  );
}

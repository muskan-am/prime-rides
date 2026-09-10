import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PackageFormClient from "@/components/admin/PackageFormClient";

export const revalidate = 0;

export default async function AdminNewPackagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      basePrice: true,
      primaryImage: true,
    },
  });

  const formattedVehicles = vehicles.map((v) => ({
    id: v.id,
    name: `${v.brand} ${v.model}${v.variant ? ` (${v.variant})` : ""}`,
    price: Number(v.basePrice),
    image: v.primaryImage,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/packages"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-1"
          >
            ← Back to Packages
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create New Package
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Add a new Weekly, Monthly, or Yearly rental package and select eligible vehicles.
          </p>
        </div>
      </div>

      <PackageFormClient vehicles={formattedVehicles} />
    </div>
  );
}

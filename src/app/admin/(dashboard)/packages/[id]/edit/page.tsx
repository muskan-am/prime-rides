import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PackageFormClient from "@/components/admin/PackageFormClient";

export const revalidate = 0;

export default async function AdminEditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const [pkg, vehicles] = await Promise.all([
    prisma.package.findUnique({
      where: { id },
      include: {
        vehicles: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.vehicle.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: {
        id: true,
        brand: true,
        model: true,
        variant: true,
        basePrice: true,
        primaryImage: true,
      },
    }),
  ]);

  if (!pkg) {
    notFound();
  }

  const formattedVehicles = vehicles.map((v) => ({
    id: v.id,
    name: `${v.brand} ${v.model}${v.variant ? ` (${v.variant})` : ""}`,
    price: Number(v.basePrice),
    image: v.primaryImage,
  }));

  const initialData = {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    type: pkg.type,
    duration: pkg.duration,
    price: Number(pkg.price),
    shortDescription: pkg.shortDescription || "",
    description: pkg.description || "",
    image: pkg.image || "",
    features: pkg.features,
    terms: pkg.terms || "",
    isActive: pkg.isActive,
    sortOrder: pkg.sortOrder,
    vehicleIds: pkg.vehicles.map((v) => v.id),
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/packages"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1"
          >
            ← Back to Packages
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Edit Package: {pkg.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Update package details, duration, pricing, and vehicle eligibility.
          </p>
        </div>
      </div>

      <PackageFormClient vehicles={formattedVehicles} initialData={initialData} />
    </div>
  );
}

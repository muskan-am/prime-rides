import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPackagesClient from "@/components/admin/AdminPackagesClient";

export const revalidate = 0;

export default async function AdminPackagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const packages = await prisma.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      vehicles: {
        select: {
          id: true,
          brand: true,
          model: true,
          variant: true,
          primaryImage: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  const formattedPackages = packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    type: pkg.type,
    duration: pkg.duration,
    price: Number(pkg.price),
    shortDescription: pkg.shortDescription,
    description: pkg.description,
    image: pkg.image,
    features: pkg.features,
    terms: pkg.terms,
    isActive: pkg.isActive,
    sortOrder: pkg.sortOrder,
    createdAt: pkg.createdAt.toISOString(),
    vehicles: pkg.vehicles,
    bookingCount: pkg._count.bookings,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Package Management
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Create and manage Weekly, Monthly, and Yearly rental packages and assign eligible vehicles.
          </p>
        </div>

        <Link
          href="/admin/packages/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all shrink-0"
        >
          + Create New Package
        </Link>
      </div>

      <AdminPackagesClient initialPackages={formattedPackages} />
    </div>
  );
}

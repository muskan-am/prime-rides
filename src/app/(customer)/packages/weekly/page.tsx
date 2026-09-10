import { prisma } from "@/lib/prisma";
import PackageListingClient, { PublicPackageItem } from "@/components/customer/PackageListingClient";

export const revalidate = 0;

export default async function WeeklyPackagesPage() {
  const packages = await prisma.package.findMany({
    where: {
      type: "WEEKLY",
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });

  const formattedPackages: PublicPackageItem[] = packages.map((pkg) => ({
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
    vehicleCount: pkg._count.vehicles,
  }));

  return (
    <PackageListingClient
      title="Weekly Rental Packages"
      subtitle="Exclusive 7-day deals for road trips, weekend staycations, and short-term mobility with maximum savings."
      categoryTag="Weekly Savings"
      packages={formattedPackages}
      currentType="WEEKLY"
    />
  );
}

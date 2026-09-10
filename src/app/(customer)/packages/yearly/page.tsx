import { prisma } from "@/lib/prisma";
import PackageListingClient, { PublicPackageItem } from "@/components/customer/PackageListingClient";

export const revalidate = 0;

export default async function YearlyPackagesPage() {
  const packages = await prisma.package.findMany({
    where: {
      type: "YEARLY",
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
      title="Yearly Subscription Packages"
      subtitle="Annual mobility contracts with white-glove concierge, vehicle swapping, zero maintenance hassle, and maximum discounts."
      categoryTag="Annual Mobility"
      packages={formattedPackages}
      currentType="YEARLY"
    />
  );
}

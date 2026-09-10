import { prisma } from "@/lib/prisma";
import PackageListingClient, { PublicPackageItem } from "@/components/customer/PackageListingClient";

export const revalidate = 0;

export default async function MonthlyPackagesPage() {
  const packages = await prisma.package.findMany({
    where: {
      type: "MONTHLY",
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
      title="Monthly Rental Packages"
      subtitle="Flexible long-term 30-day subscriptions with doorstep service, full maintenance, and priority support."
      categoryTag="Long-Term Subscription"
      packages={formattedPackages}
      currentType="MONTHLY"
    />
  );
}

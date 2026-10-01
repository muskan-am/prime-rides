import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import CarDetailClient, {
  DetailVehicle,
} from "@/components/customer/CarDetailClient";
import {
  calculateApprovedReviews,
  formatFuelType,
  formatTransmission,
  formatVehicleCategory,
} from "@/lib/rating";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CarDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  let vehicle;
  try {
    vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        features: true,
        specifications: true,
        rentalPackages: {
          where: { isActive: true },
          orderBy: { duration: "asc" },
        },
        monthlyPlans: {
          where: { isActive: true },
          orderBy: { months: "asc" },
        },
        inventory: {
          where: { isActive: true },
          include: { location: true },
        },
        reviews: {
          where: { status: "APPROVED" },
          select: {
            id: true,
            rating: true,
            comment: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to query vehicle from database:", error);
    notFound();
  }

  if (!vehicle) {
    notFound();
  }

  const locationNames = vehicle.inventory
    .filter((inv) => inv.isActive && inv.location?.name)
    .map((inv) => inv.location.name);

  const primaryLocation = locationNames[0] || "Main Hub";

  const primaryImage =
    vehicle.primaryImage ||
    vehicle.images.find((img) => img.isPrimary)?.url ||
    vehicle.images[0]?.url ||
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80";

  const isAvailable =
    vehicle.availabilityStatus === "AVAILABLE" &&
    vehicle.maintenanceStatus === "GOOD";

  const approvedReviews = (vehicle.reviews || []).filter(
    (r: any) => !r.status || r.status === "APPROVED"
  );

  const { averageRating: avgNum, reviewCount, ratingDistribution } = calculateApprovedReviews(vehicle.reviews);
  const averageRating = avgNum !== null ? avgNum.toFixed(1) : null;

  const defaultFeatures = [
    `${formatTransmission(vehicle.transmission)} Transmission`,
    "Air Conditioning",
    "Bluetooth & Touchscreen Infotainment",
    "Android Auto & Apple CarPlay",
    "GPS Navigation",
    "Rear Parking Sensors / Camera",
    "Fast USB Charging Ports",
    "Cruise Control",
  ];

  const featuresList =
    vehicle.features.length > 0
      ? vehicle.features.map((f) => ({ id: f.id, name: f.name }))
      : defaultFeatures.map((f, idx) => ({ id: `def-${idx}`, name: f }));

  const detailVehicle: DetailVehicle = {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    variant: vehicle.variant,
    vehicleType: vehicle.vehicleType || formatVehicleCategory(vehicle.variant, vehicle.model, vehicle.brand),
    fuelType: formatFuelType(vehicle.fuelType),
    transmission: formatTransmission(vehicle.transmission),
    seatingCapacity: vehicle.seatingCapacity || 5,
    hasAirConditioning: vehicle.hasAirConditioning !== false,
    basePrice: Number(vehicle.basePrice),
    deposit: Number(vehicle.deposit),
    speedLimit: vehicle.speedLimit,
    rentalTerms: vehicle.rentalTerms,
    isAvailable,
    primaryImage,
    images: vehicle.images.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
    })),
    features: featuresList,
    specifications: vehicle.specifications.map((s) => ({
      id: s.id,
      name: s.name,
      value: s.value,
    })),
    rentalPackages: vehicle.rentalPackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      price: Number(pkg.price),
    })),
    monthlyPlans: vehicle.monthlyPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      months: plan.months,
      price: Number(plan.price),
    })),
    primaryLocation,
    averageRating,
    reviewCount,
    ratingDistribution,
    reviews: approvedReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user?.name || undefined,
      userImage: r.user?.image || undefined,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const searchParamsState = {
    location:
      typeof resolvedSearchParams.location === "string"
        ? resolvedSearchParams.location
        : undefined,
    startDate:
      typeof resolvedSearchParams.startDate === "string"
        ? resolvedSearchParams.startDate
        : undefined,
    endDate:
      typeof resolvedSearchParams.endDate === "string"
        ? resolvedSearchParams.endDate
        : undefined,
    rentalPackageId:
      typeof resolvedSearchParams.rentalPackageId === "string"
        ? resolvedSearchParams.rentalPackageId
        : undefined,
    monthlyPlanId:
      typeof resolvedSearchParams.monthlyPlanId === "string"
        ? resolvedSearchParams.monthlyPlanId
        : undefined,
  };

  return (
    <CarDetailClient
      vehicle={detailVehicle}
      isLoggedIn={!!session?.user}
      searchParamsState={searchParamsState}
    />
  );
}
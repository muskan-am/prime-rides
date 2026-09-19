import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminCreateBookingClient from "@/components/admin/AdminCreateBookingClient";

export default async function AdminCreateBookingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch active database entities for booking creation
  const vehicles = await prisma.vehicle.findMany({
    where: {
      availabilityStatus: "AVAILABLE",
      maintenanceStatus: "GOOD",
    },
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      registrationNumber: true,
      basePrice: true,
      primaryImage: true,
    },
    orderBy: {
      brand: "asc",
    },
  });

  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      address: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const pickupOptions = await prisma.pickupOption.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      vehicles: {
        select: {
          id: true,
        },
      },
    },
  });

  const rentalPackages = await prisma.rentalPackage.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      vehicleId: true,
      name: true,
      duration: true,
      price: true,
    },
  });

  const monthlyPlans = await prisma.monthlyPlan.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      vehicleId: true,
      name: true,
      months: true,
      price: true,
    },
  });

  const deliveryCharges = await prisma.deliveryCharge.findMany({
    where: {
      isActive: true,
    },
    select: {
      locationId: true,
      charge: true,
    },
  });

  const taxConfig = await prisma.taxConfiguration.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Decimal objects to standard Numbers for React Client Component serialization
  const serializedVehicles = vehicles.map((v) => ({
    ...v,
    basePrice: Number(v.basePrice),
  }));

  const serializedPackages = packages.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  const serializedRentalPackages = rentalPackages.map((rp) => ({
    ...rp,
    price: Number(rp.price),
  }));

  const serializedMonthlyPlans = monthlyPlans.map((mp) => ({
    ...mp,
    price: Number(mp.price),
  }));

  const serializedDeliveryCharges = deliveryCharges.map((dc) => ({
    ...dc,
    charge: Number(dc.charge),
  }));

  const taxRate = taxConfig ? Number(taxConfig.rate) : 0;

  return (
    <AdminCreateBookingClient
      vehicles={serializedVehicles}
      locations={locations}
      pickupOptions={pickupOptions}
      packages={serializedPackages}
      rentalPackages={serializedRentalPackages}
      monthlyPlans={serializedMonthlyPlans}
      deliveryCharges={serializedDeliveryCharges}
      taxRate={taxRate}
    />
  );
}

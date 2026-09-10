import { prisma } from "@/lib/prisma";
import CarsCatalogClient, {
  FormattedVehicle,
  FormattedLocation,
} from "@/components/customer/CarsCatalogClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export const revalidate = 0;

function formatFuelType(fuel: string | null | undefined): string {
  if (!fuel) return "Petrol";
  const upper = fuel.toUpperCase();
  if (upper === "PETROL") return "Petrol";
  if (upper === "DIESEL") return "Diesel";
  if (upper === "ELECTRIC") return "Electric";
  if (upper === "HYBRID") return "Hybrid";
  if (upper === "CNG") return "CNG";
  return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
}

function formatTransmission(trans: string | null | undefined): string {
  if (!trans) return "Automatic";
  const upper = trans.toUpperCase();
  if (upper === "AUTOMATIC") return "Automatic";
  if (upper === "MANUAL") return "Manual";
  return trans.charAt(0).toUpperCase() + trans.slice(1).toLowerCase();
}

type CarsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const resolvedParams = await searchParams;

  const locationParam =
    typeof resolvedParams.location === "string"
      ? resolvedParams.location
      : typeof resolvedParams.locationId === "string"
      ? resolvedParams.locationId
      : "All";

  const startDateStr =
    typeof resolvedParams.startDate === "string"
      ? resolvedParams.startDate
      : undefined;

  const endDateStr =
    typeof resolvedParams.endDate === "string"
      ? resolvedParams.endDate
      : undefined;

  let unavailableVehicleIds: string[] = [];
  let isDateFilterActive = false;
  let startDateText: string | undefined;
  let endDateText: string | undefined;

  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      isDateFilterActive = true;
      startDateText = start.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      endDateText = end.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          startDate: { lt: end },
          endDate: { gt: start },
        },
        select: { vehicleId: true },
      });

      unavailableVehicleIds = Array.from(
        new Set(overlappingBookings.map((b) => b.vehicleId))
      );
    }
  }

  try {
    const [vehicles, dbLocations] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          availabilityStatus: "AVAILABLE",
          maintenanceStatus: "GOOD",
          ...(unavailableVehicleIds.length > 0
            ? { id: { notIn: unavailableVehicleIds } }
            : {}),
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          inventory: {
            where: { isActive: true },
            include: { location: true },
          },
        },
        orderBy: [
          { searchPriority: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.location.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const formattedVehicles: FormattedVehicle[] = vehicles.map((v) => {
      const locationNames = v.inventory
        .filter((inv) => inv.isActive && inv.location?.name)
        .map((inv) => inv.location.name);

      const locationIds = v.inventory
        .filter((inv) => inv.isActive && inv.locationId)
        .map((inv) => inv.locationId);

      const primaryLocation = locationNames[0] || "Main Hub";

      const primaryImage =
        v.primaryImage ||
        v.images.find((img) => img.isPrimary)?.url ||
        v.images[0]?.url ||
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80";

      const isAvailable =
        v.availabilityStatus === "AVAILABLE" && v.maintenanceStatus === "GOOD";

      const badge =
        v.variant || (v.searchPriority > 0 ? "Popular" : "Verified");

      return {
        id: v.id,
        brand: v.brand,
        name: `${v.brand} ${v.model}`,
        model: v.model,
        variant: v.variant || "",
        fuel: formatFuelType(v.fuelType),
        transmission: formatTransmission(v.transmission),
        seats: v.seatingCapacity || 5,
        price: Number(v.basePrice),
        deposit: Number(v.deposit),
        location: primaryLocation,
        locationIds,
        locationNames,
        isAvailable,
        image: primaryImage,
        badge,
        searchPriority: v.searchPriority,
      };
    });

    const locations: FormattedLocation[] = dbLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
    }));

    return (
      <CarsCatalogClient
        initialVehicles={formattedVehicles}
        locations={locations}
        initialLocationQuery={locationParam}
        isDateFilterActive={isDateFilterActive}
        startDateText={startDateText}
        endDateText={endDateText}
      />
    );
  } catch (error) {
    console.error("Failed to load vehicle catalog from database:", error);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="py-24 text-center px-4">
          <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 border border-slate-200 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Unable to Load Vehicles
            </h2>
            <p className="text-sm text-slate-600">
              We encountered a temporary database issue while retrieving the vehicle fleet. Please try refreshing or check back in a moment.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
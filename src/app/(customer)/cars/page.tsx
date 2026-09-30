import { prisma } from "@/lib/prisma";
import CarsCatalogClient, {
  FormattedVehicle,
  FormattedLocation,
} from "@/components/customer/CarsCatalogClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from "@/lib/filterSettings";
import {
  calculateApprovedReviews,
  formatFuelType,
  formatTransmission,
  formatVehicleCategory,
} from "@/lib/rating";

export const revalidate = 0;

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

  let filterSettings: FilterSettings = DEFAULT_FILTER_SETTINGS;

  try {
    const [vehicles, dbLocations, dbFilterSetting] = await Promise.all([
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
          reviews: {
            select: { rating: true },
          },
          specifications: true,
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
      prisma.systemSetting.findUnique({
        where: { key: "filter_settings" },
      }),
    ]);

    if (dbFilterSetting?.value) {
      try {
        const parsed = JSON.parse(dbFilterSetting.value);
        filterSettings = {
          ...DEFAULT_FILTER_SETTINGS,
          ...parsed,
          distance: { ...DEFAULT_FILTER_SETTINGS.distance, ...(parsed.distance || {}) },
          deliveryType: { ...DEFAULT_FILTER_SETTINGS.deliveryType, ...(parsed.deliveryType || {}) },
          priceRange: { ...DEFAULT_FILTER_SETTINGS.priceRange, ...(parsed.priceRange || {}) },
          carType: { ...DEFAULT_FILTER_SETTINGS.carType, ...(parsed.carType || {}) },
          transmission: { ...DEFAULT_FILTER_SETTINGS.transmission, ...(parsed.transmission || {}) },
          fuelType: { ...DEFAULT_FILTER_SETTINGS.fuelType, ...(parsed.fuelType || {}) },
          seats: { ...DEFAULT_FILTER_SETTINGS.seats, ...(parsed.seats || {}) },
          userRatings: { ...DEFAULT_FILTER_SETTINGS.userRatings, ...(parsed.userRatings || {}) },
          modelYear: { ...DEFAULT_FILTER_SETTINGS.modelYear, ...(parsed.modelYear || {}) },
        };
      } catch {
        filterSettings = DEFAULT_FILTER_SETTINGS;
      }
    }

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

      const allImages = Array.from(
        new Set([
          primaryImage,
          ...(v.images?.map((img) => img.url) || [])
        ].filter(Boolean))
      );

      const isAvailable =
        v.availabilityStatus === "AVAILABLE" && v.maintenanceStatus === "GOOD";

      // Calculate approved rating from centralized helper
      const { averageRating, reviewCount } = calculateApprovedReviews(v.reviews);

      const badge =
        v.variant || (v.searchPriority > 0 ? "Popular" : "Verified");

      // Extract Year
      const yearSpec = v.specifications?.find((s) =>
        s.name.toLowerCase().includes("year")
      )?.value;
      const modelYear = yearSpec ? parseInt(yearSpec, 10) : 2023;

      return {
        id: v.id,
        brand: v.brand,
        name: `${v.brand} ${v.model}`,
        model: v.model,
        variant: v.variant || "",
        type: v.vehicleType || formatVehicleCategory(v.variant, v.model, v.brand),
        vehicleType: v.vehicleType || formatVehicleCategory(v.variant, v.model, v.brand),
        fuel: formatFuelType(v.fuelType),
        transmission: formatTransmission(v.transmission),
        seats: v.seatingCapacity || 5,
        hasAirConditioning: v.hasAirConditioning !== false,
        price: Number(v.basePrice),
        deposit: Number(v.deposit),
        location: primaryLocation,
        locationIds,
        locationNames,
        isAvailable,
        image: primaryImage,
        images: allImages,
        badge,
        searchPriority: v.searchPriority,
        rating: averageRating,
        reviewCount,
        modelYear,
      };
    });

    const locations: FormattedLocation[] = dbLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
    }));

    const rawVehicleType =
      typeof resolvedParams.vehicleType === "string"
        ? resolvedParams.vehicleType
        : typeof resolvedParams.type === "string"
        ? resolvedParams.type
        : typeof resolvedParams.category === "string"
        ? resolvedParams.category
        : undefined;

    const initialParams = {
      location: locationParam,
      vehicleType: rawVehicleType,
      type: rawVehicleType,
      category: rawVehicleType,
      fuel: typeof resolvedParams.fuel === "string" ? resolvedParams.fuel : undefined,
      transmission: typeof resolvedParams.transmission === "string" ? resolvedParams.transmission : undefined,
      seats: typeof resolvedParams.seats === "string" ? resolvedParams.seats : undefined,
      minPrice: typeof resolvedParams.minPrice === "string" ? parseInt(resolvedParams.minPrice, 10) : undefined,
      maxPrice: typeof resolvedParams.maxPrice === "string" ? parseInt(resolvedParams.maxPrice, 10) : undefined,
      rating: typeof resolvedParams.rating === "string" ? parseFloat(resolvedParams.rating) : undefined,
      search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
      sort: typeof resolvedParams.sort === "string" ? resolvedParams.sort : undefined,
    };

    return (
      <CarsCatalogClient
        initialVehicles={formattedVehicles}
        locations={locations}
        initialLocationQuery={locationParam}
        initialParams={initialParams}
        isDateFilterActive={isDateFilterActive}
        startDateText={startDateText}
        endDateText={endDateText}
        filterSettings={filterSettings}
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
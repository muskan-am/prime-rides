import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from "@/lib/filterSettings";
import AdminFilterSettingsClient from "@/components/admin/AdminFilterSettingsClient";

export default async function AdminFilterSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let filterSettings: FilterSettings = DEFAULT_FILTER_SETTINGS;

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: "filter_settings" },
    });

    if (record?.value) {
      const parsed = JSON.parse(record.value);
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
    }
  } catch (error) {
    console.error("Failed to load filter settings for admin:", error);
  }

  return <AdminFilterSettingsClient initialSettings={filterSettings} />;
}

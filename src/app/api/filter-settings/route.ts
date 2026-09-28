import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from "@/lib/filterSettings";

const SETTING_KEY = "filter_settings";

export async function GET() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    let settings: FilterSettings = DEFAULT_FILTER_SETTINGS;

    if (record?.value) {
      try {
        const parsed = JSON.parse(record.value);
        settings = {
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
        settings = DEFAULT_FILTER_SETTINGS;
      }
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Failed to retrieve filter settings:", error);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_FILTER_SETTINGS,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updatedSettings: FilterSettings = {
      ...DEFAULT_FILTER_SETTINGS,
      ...body,
    };

    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: {
        value: JSON.stringify(updatedSettings),
      },
      create: {
        key: SETTING_KEY,
        value: JSON.stringify(updatedSettings),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Filter settings saved successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Failed to update filter settings:", error);
    return NextResponse.json(
      { error: "Failed to save filter settings" },
      { status: 500 }
    );
  }
}

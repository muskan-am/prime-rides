import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateApprovedReviews,
  formatFuelType,
  formatTransmission,
  formatVehicleCategory,
} from "@/lib/rating";

async function getAuthenticatedDbUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.email) {
    return null;
  }

  let dbUser = session.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true },
      })
    : null;

  if (!dbUser && session.user.email) {
    dbUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: session.user.email,
          mode: "insensitive",
        },
      },
      select: { id: true, email: true },
    });
  }

  return dbUser;
}

export async function GET() {
  try {
    const dbUser = await getAuthenticatedDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Please sign in to view favorites." },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        vehicle: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            specifications: true,
            reviews: {
              where: { status: "APPROVED" },
              select: { rating: true },
            },
            inventory: {
              where: { isActive: true },
              include: { location: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedVehicles = favorites.map((fav) => {
      const v = fav.vehicle;
      const primaryLocation =
        v.inventory?.find((inv) => inv.isActive && inv.location?.name)?.location
          ?.name || "Main Hub";

      const primaryImg =
        v.primaryImage ||
        v.images?.find((img) => img.isPrimary)?.url ||
        v.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80";

      const allImages =
        v.images && v.images.length > 0
          ? v.images.map((img) => img.url)
          : [primaryImg];

      const { averageRating, reviewCount } = calculateApprovedReviews(
        v.reviews || []
      );

      return {
        id: v.id,
        favoriteId: fav.id,
        savedAt: fav.createdAt,
        brand: v.brand,
        name: `${v.brand} ${v.model}`,
        model: v.model,
        variant: v.variant || "",
        type:
          v.vehicleType ||
          formatVehicleCategory(v.variant, v.model, v.brand),
        vehicleType:
          v.vehicleType ||
          formatVehicleCategory(v.variant, v.model, v.brand),
        fuel: formatFuelType(v.fuelType),
        transmission: formatTransmission(v.transmission),
        seats: v.seatingCapacity || 5,
        hasAirConditioning: v.hasAirConditioning !== false,
        price: Number(v.basePrice),
        deposit: Number(v.deposit),
        location: primaryLocation,
        locationIds: v.inventory?.map((inv) => inv.locationId) || [],
        locationNames:
          v.inventory
            ?.map((inv) => inv.location?.name)
            .filter((name): name is string => Boolean(name)) || [],
        isAvailable: v.availabilityStatus === "AVAILABLE",
        image: primaryImg,
        images: allImages,
        badge: v.variant || (v.searchPriority > 0 ? "Popular" : "Verified"),
        searchPriority: v.searchPriority,
        rating: averageRating,
        reviewCount,
      };
    });

    return NextResponse.json({
      success: true,
      favorites: formattedVehicles,
      count: formattedVehicles.length,
    });
  } catch (error) {
    console.error("Fetch Favorites Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve favorites." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const dbUser = await getAuthenticatedDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Please sign in to save favorite vehicles." },
        { status: 401 }
      );
    }

    let body: { vehicleId?: string; id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const vehicleId = (body.vehicleId || body.id)?.trim();

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, brand: true, model: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found in fleet." },
        { status: 404 }
      );
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_vehicleId: {
          userId: dbUser.id,
          vehicleId,
        },
      },
      update: {},
      create: {
        userId: dbUser.id,
        vehicleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${vehicle.brand} ${vehicle.model} added to your favorites.`,
      favoriteId: favorite.id,
      isFavorite: true,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle to favorites." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const dbUser = await getAuthenticatedDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Please sign in to modify favorites." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let vehicleId = searchParams.get("vehicleId")?.trim();

    if (!vehicleId) {
      try {
        const body = await request.json();
        vehicleId = (body.vehicleId || body.id)?.trim();
      } catch {
        // body may be empty for DELETE query param
      }
    }

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required." },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: dbUser.id,
        vehicleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites.",
      isFavorite: false,
    });
  } catch (error) {
    console.error("Delete Favorite Error:", error);
    return NextResponse.json(
      { error: "Failed to remove vehicle from favorites." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({
        success: true,
        favoriteVehicleIds: [],
        count: 0,
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: dbUser.id },
      select: { vehicleId: true },
    });

    const favoriteVehicleIds = favorites.map((f) => f.vehicleId);

    return NextResponse.json({
      success: true,
      favoriteVehicleIds,
      count: favoriteVehicleIds.length,
    });
  } catch (error) {
    console.error("Get Favorite IDs Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite IDs." },
      { status: 500 }
    );
  }
}

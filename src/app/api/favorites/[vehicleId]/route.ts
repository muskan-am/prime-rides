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

export async function GET(
  request: Request,
  props: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await props.params;

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required." },
        { status: 400 }
      );
    }

    const dbUser = await getAuthenticatedDbUser();

    if (!dbUser) {
      return NextResponse.json({
        isFavorite: false,
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId: dbUser.id,
          vehicleId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    console.error("Check Favorite Error:", error);
    return NextResponse.json(
      { error: "Failed to check favorite status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await props.params;

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required." },
        { status: 400 }
      );
    }

    const dbUser = await getAuthenticatedDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Please sign in to modify favorites." },
        { status: 401 }
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
      { error: "Failed to remove favorite." },
      { status: 500 }
    );
  }
}

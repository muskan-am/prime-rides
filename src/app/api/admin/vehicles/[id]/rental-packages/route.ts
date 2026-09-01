import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * GET /api/admin/vehicles/[id]/rental-packages
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const packages = await prisma.rentalPackage.findMany({
      where: {
        vehicleId: id,
      },
      orderBy: {
        duration: "asc",
      },
    });

    return NextResponse.json({
      packages,
    });
  } catch (error) {
    console.error("GET rental packages error:", error);

    return NextResponse.json(
      { error: "Failed to fetch rental packages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles/[id]/rental-packages
 */
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const duration = Number(body.duration);
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        { error: "Duration must be a positive number of days" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Valid package price is required" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const existingPackage =
      await prisma.rentalPackage.findFirst({
        where: {
          vehicleId: id,
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (existingPackage) {
      return NextResponse.json(
        { error: "A package with this name already exists" },
        { status: 409 }
      );
    }

    const rentalPackage =
      await prisma.rentalPackage.create({
        data: {
          vehicleId: id,
          name,
          description: description || null,
          duration,
          price: new Prisma.Decimal(price),
          isActive: true,
        },
      });

    return NextResponse.json(
      {
        message: "Rental package added successfully",
        package: rentalPackage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST rental package error:", error);

    return NextResponse.json(
      { error: "Failed to add rental package" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]/rental-packages
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const body = await request.json();

    const packageId =
      typeof body.packageId === "string"
        ? body.packageId
        : "";

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    const rentalPackage =
      await prisma.rentalPackage.findFirst({
        where: {
          id: packageId,
          vehicleId: id,
        },
      });

    if (!rentalPackage) {
      return NextResponse.json(
        { error: "Rental package not found" },
        { status: 404 }
      );
    }

    await prisma.rentalPackage.delete({
      where: {
        id: packageId,
      },
    });

    return NextResponse.json({
      message: "Rental package deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE rental package error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete rental package" },
      { status: 500 }
    );
  }
}
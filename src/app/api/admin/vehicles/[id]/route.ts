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

/**
 * Check admin authentication
 *
 * Returns:
 * - null -> authorized
 * - NextResponse -> unauthorized/forbidden response
 */
async function checkAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

/**
 * GET /api/admin/vehicles/[id]
 *
 * Fetch single vehicle
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
      where: {
        id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        {
          error: "Vehicle not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      vehicle,
    });
  } catch (error) {
    console.error("GET vehicle error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch vehicle",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PUT /api/admin/vehicles/[id]
 *
 * Update vehicle
 */
export async function PUT(
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

    const {
      brand,
      model,
      variant,
      registrationNumber,
      fuelType,
      transmission,
      seatingCapacity,
      basePrice,
      deposit,
      speedLimit,
      rentalTerms,
      availabilityStatus,
      maintenanceStatus,
      searchPriority,
      primaryImage,
    } = body;

    /* ----------------------------- */
    /* Validation */
    /* ----------------------------- */

    if (!brand || !brand.trim()) {
      return NextResponse.json(
        {
          error: "Brand is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!model || !model.trim()) {
      return NextResponse.json(
        {
          error: "Model is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      basePrice === undefined ||
      basePrice === null ||
      Number.isNaN(Number(basePrice))
    ) {
      return NextResponse.json(
        {
          error: "Valid base price is required",
        },
        {
          status: 400,
        }
      );
    }

    /* ----------------------------- */
    /* Check existing vehicle */
    /* ----------------------------- */

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        {
          error: "Vehicle not found",
        },
        {
          status: 404,
        }
      );
    }

    /* ----------------------------- */
    /* Duplicate registration check */
    /* ----------------------------- */

    if (registrationNumber?.trim()) {
      const duplicateVehicle =
        await prisma.vehicle.findFirst({
          where: {
            registrationNumber: registrationNumber.trim(),
            NOT: {
              id,
            },
          },
        });

      if (duplicateVehicle) {
        return NextResponse.json(
          {
            error:
              "A vehicle with this registration number already exists",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* ----------------------------- */
    /* Update vehicle */
    /* ----------------------------- */

    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },

      data: {
        brand: brand.trim(),

        model: model.trim(),

        variant: variant?.trim() || null,

        registrationNumber:
          registrationNumber?.trim() || null,

        fuelType: fuelType || null,

        transmission: transmission || null,

        seatingCapacity:
          seatingCapacity !== null &&
          seatingCapacity !== undefined &&
          seatingCapacity !== ""
            ? Number(seatingCapacity)
            : null,

        basePrice: new Prisma.Decimal(Number(basePrice)),

        deposit:
          deposit !== null &&
          deposit !== undefined &&
          deposit !== ""
            ? new Prisma.Decimal(Number(deposit))
            : new Prisma.Decimal(0),

        speedLimit:
          speedLimit !== null &&
          speedLimit !== undefined &&
          speedLimit !== ""
            ? Number(speedLimit)
            : null,

        rentalTerms: rentalTerms?.trim() || null,

        availabilityStatus:
          availabilityStatus || "AVAILABLE",

        maintenanceStatus:
          maintenanceStatus || "GOOD",

        searchPriority:
          searchPriority !== null &&
          searchPriority !== undefined &&
          searchPriority !== ""
            ? Number(searchPriority)
            : 0,

        primaryImage:
          primaryImage?.trim() || null,
      },
    });

    return NextResponse.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("PUT vehicle error:", error);

    return NextResponse.json(
      {
        error: "Failed to update vehicle",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]
 *
 * Delete vehicle
 */
export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    /* ----------------------------- */
    /* Check existing vehicle */
    /* ----------------------------- */

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        {
          error: "Vehicle not found",
        },
        {
          status: 404,
        }
      );
    }

    /* ----------------------------- */
    /* Delete vehicle */
    /* ----------------------------- */

    await prisma.vehicle.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("DELETE vehicle error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete vehicle",
      },
      {
        status: 500,
      }
    );
  }
}
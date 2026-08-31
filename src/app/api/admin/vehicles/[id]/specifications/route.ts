import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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
 * GET /api/admin/vehicles/[id]/specifications
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
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const specifications =
      await prisma.vehicleSpecification.findMany({
        where: {
          vehicleId: id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json({
      specifications,
    });
  } catch (error) {
    console.error("GET specifications error:", error);

    return NextResponse.json(
      { error: "Failed to fetch specifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles/[id]/specifications
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

    const value =
      typeof body.value === "string"
        ? body.value.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Specification name is required" },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json(
        { error: "Specification value is required" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const existingSpecification =
      await prisma.vehicleSpecification.findFirst({
        where: {
          vehicleId: id,
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (existingSpecification) {
      return NextResponse.json(
        {
          error:
            "A specification with this name already exists",
        },
        { status: 409 }
      );
    }

    const specification =
      await prisma.vehicleSpecification.create({
        data: {
          vehicleId: id,
          name,
          value,
        },
      });

    return NextResponse.json(
      {
        message: "Specification added successfully",
        specification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST specification error:", error);

    return NextResponse.json(
      { error: "Failed to add specification" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]/specifications
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

    const specificationId =
      typeof body.specificationId === "string"
        ? body.specificationId
        : "";

    if (!specificationId) {
      return NextResponse.json(
        { error: "Specification ID is required" },
        { status: 400 }
      );
    }

    const specification =
      await prisma.vehicleSpecification.findFirst({
        where: {
          id: specificationId,
          vehicleId: id,
        },
      });

    if (!specification) {
      return NextResponse.json(
        { error: "Specification not found" },
        { status: 404 }
      );
    }

    await prisma.vehicleSpecification.delete({
      where: {
        id: specificationId,
      },
    });

    return NextResponse.json({
      message: "Specification deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE specification error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete specification" },
      { status: 500 }
    );
  }
}
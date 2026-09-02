import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

// GET - Get single delivery charge
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const deliveryCharge = await prisma.deliveryCharge.findUnique({
      where: {
        id,
      },
      include: {
        location: true,
      },
    });

    if (!deliveryCharge) {
      return NextResponse.json(
        { message: "Delivery charge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      deliveryCharge,
    });
  } catch (error) {
    console.error("GET delivery charge error:", error);

    return NextResponse.json(
      { message: "Failed to fetch delivery charge" },
      { status: 500 }
    );
  }
}

// PATCH - Update delivery charge
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingCharge = await prisma.deliveryCharge.findUnique({
      where: {
        id,
      },
    });

    if (!existingCharge) {
      return NextResponse.json(
        { message: "Delivery charge not found" },
        { status: 404 }
      );
    }

    const locationId =
      body.locationId !== undefined
        ? body.locationId?.trim()
        : existingCharge.locationId;

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : existingCharge.isActive;

    let charge: Prisma.Decimal = new Prisma.Decimal(
      existingCharge.charge
    );

    if (
      body.charge !== undefined &&
      body.charge !== null &&
      body.charge !== ""
    ) {
      try {
        charge = new Prisma.Decimal(body.charge);
      } catch {
        return NextResponse.json(
          { message: "Invalid delivery charge" },
          { status: 400 }
        );
      }
    }

    if (charge.lessThan(0)) {
      return NextResponse.json(
        { message: "Delivery charge cannot be negative" },
        { status: 400 }
      );
    }

    // Check location
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        isActive: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Active location not found" },
        { status: 404 }
      );
    }

    // Prevent duplicate active charge
    if (isActive) {
      const duplicate = await prisma.deliveryCharge.findFirst({
        where: {
          locationId,
          isActive: true,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            message:
              "Another active delivery charge already exists for this location",
          },
          { status: 409 }
        );
      }
    }

    const deliveryCharge = await prisma.deliveryCharge.update({
      where: {
        id,
      },
      data: {
        locationId,
        charge,
        isActive,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json({
      message: "Delivery charge updated successfully",
      deliveryCharge,
    });
  } catch (error) {
    console.error("PATCH delivery charge error:", error);

    return NextResponse.json(
      { message: "Failed to update delivery charge" },
      { status: 500 }
    );
  }
}

// DELETE - Delete delivery charge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingCharge = await prisma.deliveryCharge.findUnique({
      where: {
        id,
      },
    });

    if (!existingCharge) {
      return NextResponse.json(
        { message: "Delivery charge not found" },
        { status: 404 }
      );
    }

    await prisma.deliveryCharge.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Delivery charge deleted successfully",
    });
  } catch (error) {
    console.error("DELETE delivery charge error:", error);

    return NextResponse.json(
      { message: "Failed to delete delivery charge" },
      { status: 500 }
    );
  }
}
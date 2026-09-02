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

// GET - Get all delivery charges
export async function GET() {
  try {
    const session = await checkAdmin();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const deliveryCharges = await prisma.deliveryCharge.findMany({
      include: {
        location: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      deliveryCharges,
    });
  } catch (error) {
    console.error("GET delivery charges error:", error);

    return NextResponse.json(
      { message: "Failed to fetch delivery charges" },
      { status: 500 }
    );
  }
}

// POST - Create delivery charge
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const locationId = body.locationId?.trim();
    const chargeValue = body.charge;

    if (!locationId) {
      return NextResponse.json(
        { message: "Location is required" },
        { status: 400 }
      );
    }

    if (
      chargeValue === undefined ||
      chargeValue === null ||
      chargeValue === ""
    ) {
      return NextResponse.json(
        { message: "Delivery charge is required" },
        { status: 400 }
      );
    }

    let charge: Prisma.Decimal;

    try {
      charge = new Prisma.Decimal(chargeValue);
    } catch {
      return NextResponse.json(
        { message: "Invalid delivery charge" },
        { status: 400 }
      );
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

    // Prevent duplicate active charge for same location
    const existingCharge = await prisma.deliveryCharge.findFirst({
      where: {
        locationId,
        isActive: true,
      },
    });

    if (existingCharge) {
      return NextResponse.json(
        {
          message:
            "An active delivery charge already exists for this location",
        },
        { status: 409 }
      );
    }

    const deliveryCharge = await prisma.deliveryCharge.create({
      data: {
        locationId,
        charge,
        isActive: true,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(
      {
        message: "Delivery charge created successfully",
        deliveryCharge,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST delivery charge error:", error);

    return NextResponse.json(
      { message: "Failed to create delivery charge" },
      { status: 500 }
    );
  }
}
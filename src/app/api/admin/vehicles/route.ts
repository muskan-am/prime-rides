import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check login session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin access
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Read request body
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

    // Required fields
    if (
      typeof brand !== "string" ||
      !brand.trim() ||
      typeof model !== "string" ||
      !model.trim() ||
      basePrice === undefined ||
      basePrice === ""
    ) {
      return NextResponse.json(
        {
          error: "Brand, model and base price are required",
        },
        { status: 400 }
      );
    }

    // Convert numeric values
    const parsedBasePrice = Number(basePrice);
    const parsedDeposit =
      deposit === undefined || deposit === ""
        ? 0
        : Number(deposit);

    const parsedSeatingCapacity =
      seatingCapacity === undefined || seatingCapacity === ""
        ? null
        : Number(seatingCapacity);

    const parsedSpeedLimit =
      speedLimit === undefined || speedLimit === ""
        ? null
        : Number(speedLimit);

    const parsedSearchPriority =
      searchPriority === undefined || searchPriority === ""
        ? 0
        : Number(searchPriority);

    // Validate numbers
    if (
      !Number.isFinite(parsedBasePrice) ||
      parsedBasePrice < 0
    ) {
      return NextResponse.json(
        { error: "Invalid base price" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(parsedDeposit) ||
      parsedDeposit < 0
    ) {
      return NextResponse.json(
        { error: "Invalid security deposit" },
        { status: 400 }
      );
    }

    if (
      parsedSeatingCapacity !== null &&
      (!Number.isFinite(parsedSeatingCapacity) ||
        parsedSeatingCapacity < 1)
    ) {
      return NextResponse.json(
        { error: "Invalid seating capacity" },
        { status: 400 }
      );
    }

    if (
      parsedSpeedLimit !== null &&
      (!Number.isFinite(parsedSpeedLimit) ||
        parsedSpeedLimit < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid speed limit" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(parsedSearchPriority) ||
      parsedSearchPriority < 0
    ) {
      return NextResponse.json(
        { error: "Invalid search priority" },
        { status: 400 }
      );
    }

    // Clean registration number
    const cleanRegistrationNumber =
      typeof registrationNumber === "string" &&
      registrationNumber.trim()
        ? registrationNumber.trim().toUpperCase()
        : null;

    // Check duplicate registration number
    if (cleanRegistrationNumber) {
      const existingVehicle =
        await prisma.vehicle.findUnique({
          where: {
            registrationNumber: cleanRegistrationNumber,
          },
        });

      if (existingVehicle) {
        return NextResponse.json(
          {
            error:
              "A vehicle with this registration number already exists",
          },
          { status: 409 }
        );
      }
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        brand: brand.trim(),
        model: model.trim(),

        variant:
          typeof variant === "string" && variant.trim()
            ? variant.trim()
            : null,

        registrationNumber:
          cleanRegistrationNumber,

        fuelType:
          typeof fuelType === "string" && fuelType
            ? fuelType
            : null,

        transmission:
          typeof transmission === "string" && transmission
            ? transmission
            : null,

        seatingCapacity: parsedSeatingCapacity,

        basePrice: parsedBasePrice,

        deposit: parsedDeposit,

        speedLimit: parsedSpeedLimit,

        rentalTerms:
          typeof rentalTerms === "string" &&
          rentalTerms.trim()
            ? rentalTerms.trim()
            : null,

        availabilityStatus:
          availabilityStatus || "AVAILABLE",

        maintenanceStatus:
          maintenanceStatus || "GOOD",

        searchPriority: parsedSearchPriority,

        primaryImage:
          typeof primaryImage === "string" &&
          primaryImage.trim()
            ? primaryImage.trim()
            : null,
      },
    });

    return NextResponse.json(
      {
        message: "Vehicle created successfully",
        vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create vehicle error:", error);

    return NextResponse.json(
      {
        error: "Failed to create vehicle",
      },
      { status: 500 }
    );
  }
}
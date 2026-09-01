import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type BookingRequest = {
  vehicleId?: string;
  rentalPackageId?: string;
  monthlyPlanId?: string;
  pickupOptionId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
};

/* =========================================================
   GET /api/bookings
   Admin: Get all bookings
========================================================= */

export async function GET() {
  try {
    /* -------------------------------- */
    /* Authentication */
    /* -------------------------------- */

    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to view bookings",
        },
        { status: 401 }
      );
    }

    /* -------------------------------- */
    /* Admin Authorization */
    /* -------------------------------- */

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "You are not authorized to view all bookings",
        },
        { status: 403 }
      );
    }

    /* -------------------------------- */
    /* Fetch All Bookings */
    /* -------------------------------- */

    const bookings =
      await prisma.booking.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          /* Customer */

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },

          /* Vehicle */

          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              variant: true,
              primaryImage: true,
            },
          },

          /* Rental Package */

          rentalPackage: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
            },
          },

          /* Monthly Plan */

          monthlyPlan: {
            select: {
              id: true,
              name: true,
              months: true,
              price: true,
            },
          },

          /* Pickup Option */

          pickupOption: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },

          /* Pickup Location */

          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

    /* -------------------------------- */
    /* Response */
    /* -------------------------------- */

    return NextResponse.json(
      {
        bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Get admin bookings error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST /api/bookings
   Customer: Create Booking
========================================================= */

export async function POST(
  request: Request
) {
  try {
    /* -------------------------------- */
    /* Authentication */
    /* -------------------------------- */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to create a booking",
        },
        { status: 401 }
      );
    }

    const userId =
      session.user.id;

    /* -------------------------------- */
    /* Request Body */
    /* -------------------------------- */

    const body =
      (await request.json()) as BookingRequest;

    const vehicleId =
      body.vehicleId?.trim();

    const rentalPackageId =
      body.rentalPackageId?.trim();

    const monthlyPlanId =
      body.monthlyPlanId?.trim();

    const pickupOptionId =
      body.pickupOptionId?.trim();

    const locationId =
      body.locationId?.trim();

    if (
      !vehicleId ||
      !locationId ||
      !body.startDate ||
      !body.endDate
    ) {
      return NextResponse.json(
        {
          error:
            "Vehicle, location, start date and end date are required",
        },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Package Validation */
    /* -------------------------------- */

    if (
      rentalPackageId &&
      monthlyPlanId
    ) {
      return NextResponse.json(
        {
          error:
            "Select either a rental package or a monthly plan, not both",
        },
        { status: 400 }
      );
    }

    if (
      !rentalPackageId &&
      !monthlyPlanId
    ) {
      return NextResponse.json(
        {
          error:
            "A rental package or monthly plan is required",
        },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Date Validation */
    /* -------------------------------- */

    const startDate =
      new Date(body.startDate);

    const endDate =
      new Date(body.endDate);

    if (
      Number.isNaN(
        startDate.getTime()
      ) ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid booking dates",
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          error:
            "End date must be after start date",
        },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        {
          error:
            "Booking start date cannot be in the past",
        },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Vehicle */
    /* -------------------------------- */

    const vehicle =
      await prisma.vehicle.findUnique({
        where: {
          id: vehicleId,
        },
      });

    if (!vehicle) {
      return NextResponse.json(
        {
          error:
            "Vehicle not found",
        },
        { status: 404 }
      );
    }

    if (
      vehicle.availabilityStatus !==
      "AVAILABLE"
    ) {
      return NextResponse.json(
        {
          error:
            "This vehicle is currently unavailable",
        },
        { status: 409 }
      );
    }

    if (
      vehicle.maintenanceStatus ===
      "MAINTENANCE"
    ) {
      return NextResponse.json(
        {
          error:
            "This vehicle is currently under maintenance",
        },
        { status: 409 }
      );
    }

    /* -------------------------------- */
    /* Location */
    /* -------------------------------- */

    const location =
      await prisma.location.findFirst({
        where: {
          id: locationId,
          isActive: true,
        },
      });

    if (!location) {
      return NextResponse.json(
        {
          error:
            "Selected location is not available",
        },
        { status: 404 }
      );
    }

    /* -------------------------------- */
    /* Pickup Option */
    /* -------------------------------- */

    if (pickupOptionId) {
      const pickupOption =
        await prisma.pickupOption.findFirst(
          {
            where: {
              id: pickupOptionId,
              isActive: true,
            },
          }
        );

      if (!pickupOption) {
        return NextResponse.json(
          {
            error:
              "Selected pickup option is not available",
          },
          { status: 404 }
        );
      }
    }

    /* -------------------------------- */
    /* Existing Booking Check */
    /* -------------------------------- */

    const overlappingBooking =
      await prisma.booking.findFirst({
        where: {
          vehicleId,

          status: {
            in: [
              "PENDING",
              "CONFIRMED",
            ],
          },

          startDate: {
            lt: endDate,
          },

          endDate: {
            gt: startDate,
          },
        },
      });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          error:
            "This vehicle is already booked for the selected dates",
        },
        { status: 409 }
      );
    }

    /* -------------------------------- */
    /* Rental Amount */
    /* -------------------------------- */

    let rentalAmount =
      new Prisma.Decimal(0);

    if (rentalPackageId) {
      const rentalPackage =
        await prisma.rentalPackage.findFirst(
          {
            where: {
              id: rentalPackageId,
              vehicleId,
              isActive: true,
            },
          }
        );

      if (!rentalPackage) {
        return NextResponse.json(
          {
            error:
              "Selected rental package is not available",
          },
          { status: 404 }
        );
      }

      const millisecondsPerDay =
        1000 * 60 * 60 * 24;

      const durationInDays =
        Math.ceil(
          (endDate.getTime() -
            startDate.getTime()) /
            millisecondsPerDay
        );

      if (
        durationInDays !==
        rentalPackage.duration
      ) {
        return NextResponse.json(
          {
            error:
              `Selected package requires ${rentalPackage.duration} day(s)`,
          },
          { status: 400 }
        );
      }

      rentalAmount =
        rentalPackage.price;
    }

    /* -------------------------------- */
    /* Monthly Plan */
    /* -------------------------------- */

    if (monthlyPlanId) {
      const monthlyPlan =
        await prisma.monthlyPlan.findFirst(
          {
            where: {
              id: monthlyPlanId,
              vehicleId,
              isActive: true,
            },
          }
        );

      if (!monthlyPlan) {
        return NextResponse.json(
          {
            error:
              "Selected monthly plan is not available",
          },
          { status: 404 }
        );
      }

      rentalAmount =
        monthlyPlan.price;

      const expectedEndDate =
        new Date(startDate);

      expectedEndDate.setMonth(
        expectedEndDate.getMonth() +
          monthlyPlan.months
      );

      if (
        expectedEndDate.getTime() !==
        endDate.getTime()
      ) {
        return NextResponse.json(
          {
            error:
              `Selected plan requires ${monthlyPlan.months} month(s)`,
          },
          { status: 400 }
        );
      }
    }

    /* -------------------------------- */
    /* Delivery Charge */
    /* -------------------------------- */

    const deliveryCharge =
      new Prisma.Decimal(0);

    /* -------------------------------- */
    /* Tax */
    /* -------------------------------- */

    const activeTax =
      await prisma.taxConfiguration.findFirst(
        {
          where: {
            isActive: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        }
      );

    let taxAmount =
      new Prisma.Decimal(0);

    if (activeTax) {
      taxAmount = rentalAmount
        .mul(activeTax.rate)
        .div(100);
    }

    /* -------------------------------- */
    /* Discount */
    /* -------------------------------- */

    const discountAmount =
      new Prisma.Decimal(0);

    /* -------------------------------- */
    /* Total */
    /* -------------------------------- */

    const totalAmount =
      rentalAmount
        .add(deliveryCharge)
        .add(taxAmount)
        .sub(discountAmount);

    /* -------------------------------- */
    /* Create Booking */
    /* -------------------------------- */

    const booking =
      await prisma.booking.create({
        data: {
          userId,
          vehicleId,

          rentalPackageId:
            rentalPackageId || null,

          monthlyPlanId:
            monthlyPlanId || null,

          pickupOptionId:
            pickupOptionId || null,

          locationId,

          startDate,
          endDate,

          status: "PENDING",

          rentalAmount,
          deliveryCharge,
          taxAmount,
          discountAmount,
          totalAmount,
        },

        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              primaryImage: true,
            },
          },

          rentalPackage: true,
          monthlyPlan: true,
          location: true,
          pickupOption: true,
        },
      });

    return NextResponse.json(
      {
        message:
          "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
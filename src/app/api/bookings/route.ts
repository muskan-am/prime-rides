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

/* =========================================
   GET - Admin: Get All Bookings
========================================= */

export async function GET() {
  try {
    const session =
      await getServerSession(authOptions);

    if (
      !session?.user ||
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const bookings =
      await prisma.booking.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: true,
          vehicle: true,
          rentalPackage: true,
          monthlyPlan: true,
          pickupOption: true,
          location: true,
        },
      });

    return NextResponse.json({
      bookings,
    });
  } catch (error) {
    console.error(
      "Get Bookings Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch bookings.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   POST - Create Booking
========================================= */

export async function POST(
  request: Request
) {
  try {
    /* -----------------------------------------
       Authentication
    ----------------------------------------- */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "Please login to create a booking.",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Read Request Body
    ----------------------------------------- */

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

    const startDateValue =
      body.startDate?.trim();

    const endDateValue =
      body.endDate?.trim();

    /* -----------------------------------------
       Basic Validation
    ----------------------------------------- */

    if (
      !vehicleId ||
      !locationId ||
      !startDateValue ||
      !endDateValue
    ) {
      return NextResponse.json(
        {
          error:
            "Vehicle, location, start date and end date are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Package + Monthly Validation
    ----------------------------------------- */

    if (
      rentalPackageId &&
      monthlyPlanId
    ) {
      return NextResponse.json(
        {
          error:
            "Rental package and monthly plan cannot be selected together.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Parse Dates
    ----------------------------------------- */

    const startDate =
      new Date(startDateValue);

    const endDate =
      new Date(endDateValue);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide valid booking dates.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Date Validation
    ----------------------------------------- */

    if (endDate <= startDate) {
      return NextResponse.json(
        {
          error:
            "End date must be after start date.",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    if (startDate < now) {
      return NextResponse.json(
        {
          error:
            "Start date cannot be in the past.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Calculate Rental Duration
    ----------------------------------------- */

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil(
      (endDate.getTime() -
        startDate.getTime()) /
        millisecondsPerDay
    );

    if (rentalDays <= 0) {
      return NextResponse.json(
        {
          error:
            "Booking duration must be at least 1 day.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Get Vehicle
    ----------------------------------------- */

    const vehicle =
      await prisma.vehicle.findUnique({
        where: {
          id: vehicleId,
        },
      });

    if (!vehicle) {
      return NextResponse.json(
        {
          error: "Vehicle not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------
       Vehicle Availability
    ----------------------------------------- */

    if (
      vehicle.availabilityStatus !==
      "AVAILABLE"
    ) {
      return NextResponse.json(
        {
          error:
            "This vehicle is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      vehicle.maintenanceStatus !==
      "GOOD"
    ) {
      return NextResponse.json(
        {
          error:
            "This vehicle is currently under maintenance.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Validate Location
    ----------------------------------------- */

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
            "Selected pickup location is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Get Delivery Charge
    ----------------------------------------- */

    const deliveryChargeConfig =
      await prisma.deliveryCharge.findFirst({
        where: {
          locationId,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const deliveryCharge =
      deliveryChargeConfig
        ? new Prisma.Decimal(
            deliveryChargeConfig.charge
          )
        : new Prisma.Decimal(0);

    /* -----------------------------------------
       Validate Pickup Option
    ----------------------------------------- */

    let pickupOption = null;

    if (pickupOptionId) {
      pickupOption =
        await prisma.pickupOption.findFirst({
          where: {
            id: pickupOptionId,
            isActive: true,
          },
        });

      if (!pickupOption) {
        return NextResponse.json(
          {
            error:
              "Selected pickup option is unavailable.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* -----------------------------------------
       Check Vehicle Booking Overlap
    ----------------------------------------- */

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
            "This vehicle is already booked for the selected dates.",
        },
        {
          status: 409,
        }
      );
    }

    /* -----------------------------------------
       Rental Amount
    ----------------------------------------- */

    let rentalAmount =
      new Prisma.Decimal(0);

    let rentalPackage = null;
    let monthlyPlan = null;

    /* =========================================
       RENTAL PACKAGE
    ========================================= */

    if (rentalPackageId) {
      rentalPackage =
        await prisma.rentalPackage.findFirst({
          where: {
            id: rentalPackageId,
            vehicleId,
            isActive: true,
          },
        });

      if (!rentalPackage) {
        return NextResponse.json(
          {
            error:
              "Selected rental package is unavailable.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        rentalDays !==
        rentalPackage.duration
      ) {
        return NextResponse.json(
          {
            error: `Selected package is for ${rentalPackage.duration} day(s). Please select the correct dates.`,
          },
          {
            status: 400,
          }
        );
      }

      rentalAmount =
        new Prisma.Decimal(
          rentalPackage.price
        );
    }

    /* =========================================
       MONTHLY PLAN
    ========================================= */

    else if (monthlyPlanId) {
      monthlyPlan =
        await prisma.monthlyPlan.findFirst({
          where: {
            id: monthlyPlanId,
            vehicleId,
            isActive: true,
          },
        });

      if (!monthlyPlan) {
        return NextResponse.json(
          {
            error:
              "Selected monthly plan is unavailable.",
          },
          {
            status: 400,
          }
        );
      }

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
            error: `Selected monthly plan is for ${monthlyPlan.months} month(s). Please select the correct dates.`,
          },
          {
            status: 400,
          }
        );
      }

      rentalAmount =
        new Prisma.Decimal(
          monthlyPlan.price
        );
    }

    /* =========================================
       NORMAL DAYS
    ========================================= */

    else {
      rentalAmount =
        new Prisma.Decimal(
          vehicle.basePrice
        ).mul(rentalDays);
    }

    /* -----------------------------------------
       Tax
    ----------------------------------------- */

    const taxConfiguration =
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

    if (taxConfiguration) {
      taxAmount =
        rentalAmount
          .mul(taxConfiguration.rate)
          .div(100);
    }

    /* -----------------------------------------
       Discount
    ----------------------------------------- */

    const discountAmount =
      new Prisma.Decimal(0);

    /* -----------------------------------------
       Total Amount
    ----------------------------------------- */

    const totalAmount =
      rentalAmount
        .add(deliveryCharge)
        .add(taxAmount)
        .sub(discountAmount);

    /* -----------------------------------------
       Create Booking
    ----------------------------------------- */

    const booking =
      await prisma.booking.create({
        data: {
          userId:
            session.user.id,

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
          vehicle: true,
          rentalPackage: true,
          monthlyPlan: true,
          location: true,
          pickupOption: true,
        },
      });

    /* -----------------------------------------
       Success
    ----------------------------------------- */

    return NextResponse.json(
      {
        message:
          "Booking created successfully.",

        booking,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the booking.",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { buildAdminNewBookingContent } from "@/lib/admin-notification-context";
import {
  sendBookingCreatedEmails,
  sendPaymentPendingEmail,
} from "@/lib/email-events";

type BookingRequest = {
  vehicleId?: string;
  rentalPackageId?: string;
  monthlyPlanId?: string;
  packageId?: string;
  pickupOptionId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  couponCode?: string;
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
          package: true,
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

    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        {
          error: "Please login to create a booking.",
        },
        {
          status: 401,
        }
      );
    }

    /* Authoritative User Resolution from Database */
    let dbUser = session.user.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true },
        })
      : null;

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        {
          error: "User account not found in database. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    const userId = dbUser.id;

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

    const packageId =
      body.packageId?.trim();

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

    const nowWithBuffer = new Date(Date.now() - 5 * 60 * 1000);

    if (startDate < nowWithBuffer) {
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
       Check Vehicle Booking Overlap & Existing Pending Booking
    ----------------------------------------- */

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // 1. Check for overlapping CONFIRMED bookings or active PENDING bookings from OTHER users
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        OR: [
          { status: "CONFIRMED" },
          {
            status: "PENDING",
            userId: { not: userId },
            createdAt: { gte: fifteenMinutesAgo },
          },
        ],
      },
    });

    if (conflictingBooking) {
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

    // 2. Find any existing PENDING booking owned by the current user for this vehicle that overlaps
    const existingUserPendingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    /* -----------------------------------------
       Rental Amount
    ----------------------------------------- */

    let rentalAmount =
      new Prisma.Decimal(0);

    let rentalPackage = null;
    let monthlyPlan = null;
    let globalPackage = null;

    /* =========================================
       GLOBAL PACKAGE
    ========================================= */

    if (packageId) {
      globalPackage =
        await prisma.package.findFirst({
          where: {
            id: packageId,
            isActive: true,
            vehicles: {
              some: {
                id: vehicleId,
              },
            },
          },
        });

      if (!globalPackage) {
        return NextResponse.json(
          {
            error:
              "Selected package is unavailable or does not apply to this vehicle.",
          },
          {
            status: 400,
          }
        );
      }

      if (rentalDays !== globalPackage.duration) {
        return NextResponse.json(
          {
            error: `Selected package is for ${globalPackage.duration} day(s). Please select the correct dates.`,
          },
          {
            status: 400,
          }
        );
      }

      rentalAmount = new Prisma.Decimal(globalPackage.price);
    }

    /* =========================================
       RENTAL PACKAGE
    ========================================= */

    else if (rentalPackageId) {
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
        Math.abs(
          expectedEndDate.getTime() -
            endDate.getTime()
        ) > 60000
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
       Discount (Server-Authoritative Coupon Validation)
    ----------------------------------------- */

    let discountAmount = new Prisma.Decimal(0);
    const couponCode = body.couponCode?.trim();

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: {
            equals: couponCode,
            mode: "insensitive",
          },
        },
        include: {
          _count: { select: { usages: true } },
        },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid or expired coupon code." },
          { status: 400 }
        );
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          { error: "This coupon is currently inactive." },
          { status: 400 }
        );
      }

      const now = new Date();
      if (now < coupon.validFrom) {
        return NextResponse.json(
          { error: "This coupon is not active yet." },
          { status: 400 }
        );
      }

      if (now > coupon.validUntil) {
        return NextResponse.json(
          { error: "This coupon has expired." },
          { status: 400 }
        );
      }

      const rentalVal = Number(rentalAmount);
      const minVal = coupon.minBookingValue ? Number(coupon.minBookingValue) : null;
      if (minVal !== null && rentalVal < minVal) {
        return NextResponse.json(
          { error: `Minimum booking value for coupon "${coupon.code}" is ₹${minVal.toLocaleString("en-IN")}.` },
          { status: 400 }
        );
      }

      if (coupon.usageLimit !== null && coupon._count.usages >= coupon.usageLimit) {
        return NextResponse.json(
          { error: `Coupon "${coupon.code}" has reached its usage limit.` },
          { status: 400 }
        );
      }

      const existingUserUsage = await prisma.couponUsage.findFirst({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (existingUserUsage) {
        return NextResponse.json(
          { error: `You have already used coupon "${coupon.code}".` },
          { status: 400 }
        );
      }

      let calcDiscount = 0;
      const discountVal = Number(coupon.discountValue);
      const maxDiscountVal = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;

      if (coupon.discountType === "PERCENTAGE") {
        calcDiscount = (rentalVal * discountVal) / 100;
        if (maxDiscountVal !== null && calcDiscount > maxDiscountVal) {
          calcDiscount = maxDiscountVal;
        }
      } else {
        calcDiscount = discountVal;
      }

      if (calcDiscount > rentalVal) {
        calcDiscount = rentalVal;
      }

      discountAmount = new Prisma.Decimal(Math.round(calcDiscount * 100) / 100);
    }

    /* -----------------------------------------
       Total Amount
    ----------------------------------------- */

    const totalAmount =
      rentalAmount
        .add(deliveryCharge)
        .add(taxAmount)
        .sub(discountAmount);

    /* -----------------------------------------
       Create or Update Pending Booking
    ----------------------------------------- */

    let booking;
    let isNewBooking = false;

    if (existingUserPendingBooking) {
      booking = await prisma.booking.update({
        where: { id: existingUserPendingBooking.id },
        data: {
          rentalPackageId: rentalPackageId || null,
          monthlyPlanId: monthlyPlanId || null,
          packageId: packageId || null,
          pickupOptionId: pickupOptionId || null,
          locationId,
          startDate,
          endDate,
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
          package: true,
          location: true,
          pickupOption: true,
        },
      });
    } else {
      booking = await prisma.booking.create({
        data: {
          userId,
          vehicleId,
          rentalPackageId: rentalPackageId || null,
          monthlyPlanId: monthlyPlanId || null,
          packageId: packageId || null,
          pickupOptionId: pickupOptionId || null,
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
          package: true,
          location: true,
          pickupOption: true,
        },
      });
      isNewBooking = true;
    }

    /* -----------------------------------------
       Trigger Automatic Notifications
    ----------------------------------------- */
    await createNotification({
      userId,
      type: "BOOKING_CREATED",
      title: "Booking Received",
      message: "Your Prime Rides booking request has been received successfully.",
      link: `/dashboard?bookingId=${booking.id}`,
    });

    if (booking.status === "PENDING" || booking.paymentStatus === "PENDING") {
      await createNotification({
        userId,
        type: "PAYMENT_PENDING",
        title: "Payment Pending",
        message: "Your Prime Rides booking is waiting for payment completion.",
        link: `/dashboard?bookingId=${booking.id}`,
      });
    }

    const adminContent = buildAdminNewBookingContent({
      ...booking,
      user: session.user,
    });

    await notifyAdmins({
      type: "ADMIN_NEW_BOOKING",
      title: adminContent.title,
      message: adminContent.message,
      link: adminContent.link,
    });

    /* -----------------------------------------
       Trigger Email Notifications (Asynchronous)
    ----------------------------------------- */
    if (isNewBooking) {
      void sendBookingCreatedEmails(booking.id);

      if (
        booking.status === "PENDING" ||
        booking.paymentStatus === "PENDING"
      ) {
        void sendPaymentPendingEmail(booking.id);
      }
    }

    /* -----------------------------------------
       Success
    ----------------------------------------- */

    return NextResponse.json(
      {
        message: "Booking created successfully.",
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
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, BookingSource, PaymentStatus, BookingStatus } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { buildAdminNewBookingContent } from "@/lib/admin-notification-context";
import {
  sendBookingCreatedEmails,
  sendPaymentPendingEmail,
  sendPaymentSuccessEmail,
  sendBookingConfirmedEmail,
} from "@/lib/email-events";

type AdminBookingRequest = {
  // Customer identification
  userId?: string;
  newCustomer?: {
    name: string;
    email: string;
    mobile?: string;
  };

  // Booking details
  vehicleId: string;
  locationId: string;
  startDate: string;
  endDate: string;
  rentalPackageId?: string;
  monthlyPlanId?: string;
  packageId?: string;
  pickupOptionId?: string;
  couponCode?: string;

  // Assisted/Offline fields
  bookingSource?: BookingSource;
  paymentMethod?: string; // "CASH", "UPI", "CARD", "BANK_TRANSFER", "ONLINE"
  paymentStatus?: PaymentStatus; // "PENDING", "SUCCESS"
  bookingStatus?: BookingStatus; // "PENDING", "CONFIRMED"
  paymentReference?: string; // Optional manual receipt / reference ID
};

export async function POST(request: Request) {
  try {
    /* -----------------------------------------
       1. Admin Authorization Check
    ----------------------------------------- */
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Authenticated admin ID
    const adminUserId = session.user.id
      ? session.user.id
      : (
          await prisma.user.findUnique({
            where: { email: session.user.email || "" },
            select: { id: true },
          })
        )?.id;

    if (!adminUserId) {
      return NextResponse.json(
        { error: "Admin account session invalid." },
        { status: 401 }
      );
    }

    /* -----------------------------------------
       2. Read & Validate Request Body
    ----------------------------------------- */
    const body = (await request.json()) as AdminBookingRequest;

    const {
      vehicleId,
      locationId,
      startDate: startDateStr,
      endDate: endDateStr,
      rentalPackageId,
      monthlyPlanId,
      packageId,
      pickupOptionId,
      couponCode,
      paymentMethod = "CASH",
      paymentStatus = "PENDING",
      bookingStatus = "PENDING",
      paymentReference,
    } = body;

    let source = body.bookingSource || BookingSource.ADMIN;
    if (!Object.values(BookingSource).includes(source)) {
      source = BookingSource.ADMIN;
    }

    if (!vehicleId || !locationId || !startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "Vehicle, location, start date, and end date are required." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       3. Resolve Customer User ID
    ----------------------------------------- */
    let customerUserId: string | null = null;

    if (body.userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { id: true },
      });
      if (!existingUser) {
        return NextResponse.json(
          { error: "Selected customer account not found." },
          { status: 404 }
        );
      }
      customerUserId = existingUser.id;
    } else if (body.newCustomer?.name && body.newCustomer?.email) {
      const email = body.newCustomer.email.trim().toLowerCase();
      const mobile = body.newCustomer.mobile?.trim() || null;
      const name = body.newCustomer.name.trim();

      // Check existing email
      let user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user && mobile) {
        user = await prisma.user.findFirst({
          where: { mobile },
          select: { id: true },
        });
      }

      if (user) {
        customerUserId = user.id;
      } else {
        const createdUser = await prisma.user.create({
          data: {
            name,
            email,
            mobile,
            role: "CUSTOMER",
          },
          select: { id: true },
        });
        customerUserId = createdUser.id;
      }
    }

    if (!customerUserId) {
      return NextResponse.json(
        { error: "Please select an existing customer or provide new customer details." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       4. Parse & Validate Dates
    ----------------------------------------- */
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Please provide valid booking dates." },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      );
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const rentalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / millisecondsPerDay
    );

    if (rentalDays <= 0) {
      return NextResponse.json(
        { error: "Booking duration must be at least 1 day." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       5. Validate Vehicle & Status
    ----------------------------------------- */
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Selected vehicle not found." },
        { status: 404 }
      );
    }

    if (vehicle.availabilityStatus !== "AVAILABLE") {
      return NextResponse.json(
        { error: "This vehicle is currently marked as unavailable." },
        { status: 400 }
      );
    }

    if (vehicle.maintenanceStatus !== "GOOD") {
      return NextResponse.json(
        { error: "This vehicle is currently under maintenance." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       6. Validate Location & Pickup Option
    ----------------------------------------- */
    const location = await prisma.location.findFirst({
      where: { id: locationId, isActive: true },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Selected pickup location is inactive or invalid." },
        { status: 400 }
      );
    }

    let pickupOption = null;
    if (pickupOptionId) {
      pickupOption = await prisma.pickupOption.findFirst({
        where: { id: pickupOptionId, isActive: true },
      });
      if (!pickupOption) {
        return NextResponse.json(
          { error: "Selected pickup option is inactive or invalid." },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------
       7. Vehicle Availability & Overlap Protection
    ----------------------------------------- */
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        OR: [
          { status: "CONFIRMED" },
          {
            status: "PENDING",
            createdAt: { gte: fifteenMinutesAgo },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Vehicle is already booked for the selected dates." },
        { status: 409 }
      );
    }

    /* -----------------------------------------
       8. Delivery Charge Calculation
    ----------------------------------------- */
    const deliveryChargeConfig = await prisma.deliveryCharge.findFirst({
      where: { locationId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const deliveryCharge = deliveryChargeConfig
      ? new Prisma.Decimal(deliveryChargeConfig.charge)
      : new Prisma.Decimal(0);

    /* -----------------------------------------
       9. Authoritative Rental Pricing Calculation
    ----------------------------------------- */
    let rentalAmount = new Prisma.Decimal(0);

    if (packageId) {
      const globalPackage = await prisma.package.findFirst({
        where: {
          id: packageId,
          isActive: true,
          vehicles: { some: { id: vehicleId } },
        },
      });

      if (!globalPackage) {
        return NextResponse.json(
          { error: "Selected package is unavailable or does not apply to this vehicle." },
          { status: 400 }
        );
      }

      if (rentalDays !== globalPackage.duration) {
        return NextResponse.json(
          { error: `Selected package is for ${globalPackage.duration} day(s). Selected dates cover ${rentalDays} day(s).` },
          { status: 400 }
        );
      }

      rentalAmount = new Prisma.Decimal(globalPackage.price);
    } else if (rentalPackageId) {
      const rentalPackage = await prisma.rentalPackage.findFirst({
        where: { id: rentalPackageId, vehicleId, isActive: true },
      });

      if (!rentalPackage) {
        return NextResponse.json(
          { error: "Selected rental package is unavailable." },
          { status: 400 }
        );
      }

      if (rentalDays !== rentalPackage.duration) {
        return NextResponse.json(
          { error: `Selected rental package is for ${rentalPackage.duration} day(s).` },
          { status: 400 }
        );
      }

      rentalAmount = new Prisma.Decimal(rentalPackage.price);
    } else if (monthlyPlanId) {
      const monthlyPlan = await prisma.monthlyPlan.findFirst({
        where: { id: monthlyPlanId, vehicleId, isActive: true },
      });

      if (!monthlyPlan) {
        return NextResponse.json(
          { error: "Selected monthly plan is unavailable." },
          { status: 400 }
        );
      }

      rentalAmount = new Prisma.Decimal(monthlyPlan.price);
    } else {
      rentalAmount = new Prisma.Decimal(vehicle.basePrice).mul(rentalDays);
    }

    /* -----------------------------------------
       10. Tax Calculation
    ----------------------------------------- */
    const taxConfig = await prisma.taxConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    let taxAmount = new Prisma.Decimal(0);
    if (taxConfig) {
      taxAmount = rentalAmount.mul(taxConfig.rate).div(100);
    }

    /* -----------------------------------------
       11. Authoritative Coupon Validation
    ----------------------------------------- */
    let discountAmount = new Prisma.Decimal(0);
    let matchedCouponId: string | null = null;

    if (couponCode?.trim()) {
      const cleanCode = couponCode.trim();
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: { equals: cleanCode, mode: "insensitive" },
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
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return NextResponse.json(
          { error: "This coupon is not valid for the current date." },
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
          { error: `Coupon "${coupon.code}" has reached its maximum usage limit.` },
          { status: 400 }
        );
      }

      const existingUsage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId: customerUserId },
      });

      if (existingUsage) {
        return NextResponse.json(
          { error: `Customer has already used coupon "${coupon.code}".` },
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
      matchedCouponId = coupon.id;
    }

    /* -----------------------------------------
       12. Authoritative Total Calculation
    ----------------------------------------- */
    const totalAmount = rentalAmount
      .add(deliveryCharge)
      .add(taxAmount)
      .sub(discountAmount);

    /* -----------------------------------------
       13. Determine Final Statuses & Payment Details
    ----------------------------------------- */
    const isPaid = paymentStatus === "SUCCESS";
    const finalBookingStatus: BookingStatus = isPaid
      ? bookingStatus === "PENDING"
        ? "CONFIRMED"
        : bookingStatus
      : bookingStatus;

    const paidAt = isPaid ? new Date() : null;

    /* -----------------------------------------
       14. Create Booking Record in Database
    ----------------------------------------- */
    const booking = await prisma.booking.create({
      data: {
        userId: customerUserId,
        vehicleId,
        locationId,
        rentalPackageId: rentalPackageId || null,
        monthlyPlanId: monthlyPlanId || null,
        packageId: packageId || null,
        pickupOptionId: pickupOptionId || null,
        startDate,
        endDate,
        bookingSource: source,
        createdById: adminUserId,
        status: finalBookingStatus,
        rentalAmount,
        deliveryCharge,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentStatus: isPaid ? "SUCCESS" : "PENDING",
        paidAt,
      },
      include: {
        user: true,
        vehicle: true,
        location: true,
        pickupOption: true,
        rentalPackage: true,
        monthlyPlan: true,
        package: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    /* -----------------------------------------
       15. Create Payment Record (Offline / Manual)
    ----------------------------------------- */
    const generatedTxnId =
      paymentReference?.trim() ||
      `OFFLINE_${paymentMethod.toUpperCase()}_${Date.now()}`;

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        status: isPaid ? "SUCCESS" : "PENDING",
        gateway: paymentMethod,
        transactionId: generatedTxnId,
      },
    });

    /* -----------------------------------------
       16. Record Coupon Usage (if coupon applied)
    ----------------------------------------- */
    if (matchedCouponId) {
      await prisma.couponUsage.create({
        data: {
          couponId: matchedCouponId,
          userId: customerUserId,
          bookingId: booking.id,
          discountAmount,
        },
      });
    }

    /* -----------------------------------------
       17. Trigger Notifications
    ----------------------------------------- */
    await createNotification({
      userId: customerUserId,
      type: "BOOKING_CREATED",
      title: "Booking Created (Assisted)",
      message: `Your reservation for ${vehicle.brand} ${vehicle.model} has been created by Prime Rides staff.`,
      link: `/dashboard?bookingId=${booking.id}`,
    });

    if (isPaid || finalBookingStatus === "CONFIRMED") {
      await createNotification({
        userId: customerUserId,
        type: "BOOKING_CONFIRMED",
        title: "Booking Confirmed",
        message: `Your booking for ${vehicle.brand} ${vehicle.model} is confirmed!`,
        link: `/dashboard?bookingId=${booking.id}`,
      });
    } else {
      await createNotification({
        userId: customerUserId,
        type: "PAYMENT_PENDING",
        title: "Payment Pending",
        message: "Your Prime Rides booking is waiting for payment completion.",
        link: `/dashboard?bookingId=${booking.id}`,
      });
    }

    const adminContent = buildAdminNewBookingContent({
      ...booking,
      user: booking.user,
    });

    await notifyAdmins({
      type: "ADMIN_NEW_BOOKING",
      title: adminContent.title,
      message: `${adminContent.message} (Source: ${source}, Created by staff)`,
      link: adminContent.link,
    });

    /* -----------------------------------------
       18. Trigger Email Notifications
    ----------------------------------------- */
    void sendBookingCreatedEmails(booking.id);

    if (isPaid || finalBookingStatus === "CONFIRMED") {
      void sendBookingConfirmedEmail(booking.id);
      void sendPaymentSuccessEmail(booking.id);
    } else {
      void sendPaymentPendingEmail(booking.id);
    }

    /* -----------------------------------------
       19. Return Success Response
    ----------------------------------------- */
    return NextResponse.json(
      {
        message: "Assisted booking created successfully.",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Create Booking Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the assisted booking." },
      { status: 500 }
    );
  }
}

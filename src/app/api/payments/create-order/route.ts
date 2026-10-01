import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayConfig, getRazorpayInstance } from "@/lib/razorpay";

type CreateOrderRequest = {
  bookingId?: string;
};

export async function POST(request: Request) {
  try {
    /* -----------------------------------------
       Authentication Check
    ----------------------------------------- */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to proceed with payment." },
        { status: 401 }
      );
    }

    let dbUser = session.user.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, email: true },
        })
      : null;

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true },
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 401 }
      );
    }

    /* -----------------------------------------
       Parse and Validate Request Body
    ----------------------------------------- */
    let body: CreateOrderRequest;
    try {
      body = (await request.json()) as CreateOrderRequest;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const bookingId = body.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Fetch Authoritative Booking from Database
    ----------------------------------------- */
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "You are not authorized to pay for this booking." },
        { status: 403 }
      );
    }

    if (booking.status === "CONFIRMED" && booking.paymentStatus === "SUCCESS") {
      return NextResponse.json(
        { error: "This booking is already paid and confirmed." },
        { status: 409 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot create payment order for a cancelled booking." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Re-check Double Booking Overlap
    ----------------------------------------- */
    const overlappingConfirmedBooking = await prisma.booking.findFirst({
      where: {
        vehicleId: booking.vehicleId,
        id: { not: booking.id },
        status: "CONFIRMED",
        paymentStatus: "SUCCESS",
        startDate: { lt: booking.endDate },
        endDate: { gt: booking.startDate },
      },
    });

    if (overlappingConfirmedBooking) {
      return NextResponse.json(
        { error: "This vehicle is no longer available for the selected dates." },
        { status: 409 }
      );
    }

    /* -----------------------------------------
       Authoritative Amount Calculation in Paise
    ----------------------------------------- */
    const totalAmountInRupees = Number(booking.totalAmount);
    const amountInPaise = Math.round(totalAmountInRupees * 100);

    if (amountInPaise <= 0 || isNaN(amountInPaise)) {
      return NextResponse.json(
        { error: "Invalid booking amount calculated." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Validate Gateway Configuration
    ----------------------------------------- */
    const config = getRazorpayConfig();

    if (!config.isConfigured) {
      console.error("[PAYMENT_ERROR] Missing Razorpay server credentials:", {
        hasKeyId: config.hasKeyId,
        hasKeySecret: config.hasKeySecret,
        environment: process.env.NODE_ENV,
      });
      return NextResponse.json(
        {
          error:
            "Payment Gateway is not configured. Please verify server environment variables (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET).",
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       Create Real Razorpay Order
    ----------------------------------------- */
    let razorpayOrderId = "";

    try {
      const razorpay = getRazorpayInstance();

      // Ensure receipt string does not exceed 40 chars
      const receiptId = booking.id.length > 40 ? booking.id.slice(-40) : booking.id;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          bookingId: booking.id,
          userId: dbUser.id,
        },
      });

      razorpayOrderId = order.id;
    } catch (razorpayErr: any) {
      const statusCode = razorpayErr?.statusCode || razorpayErr?.status || 500;
      const errorDescription =
        razorpayErr?.error?.description ||
        (razorpayErr instanceof Error ? razorpayErr.message : "Razorpay error");

      console.error("[PAYMENT_DIAGNOSTIC] Razorpay Order Creation Failed:", {
        bookingId: booking.id,
        amountInPaise,
        keyIdPrefix: config.maskedKeyId,
        statusCode,
        description: errorDescription,
        code: razorpayErr?.error?.code,
      });

      if (
        statusCode === 401 ||
        errorDescription?.toLowerCase().includes("authentication failed")
      ) {
        return NextResponse.json(
          {
            error:
              "Razorpay Order Creation Failed: Authentication failed. Please check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel match and have no extraneous spaces or quotes.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error: `Razorpay Order Creation Failed: ${errorDescription}`,
        },
        { status: statusCode >= 400 && statusCode < 600 ? statusCode : 502 }
      );
    }

    /* -----------------------------------------
       Store Order ID in Prisma
    ----------------------------------------- */
    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId },
    });

    return NextResponse.json({
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: config.keyId,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Create Razorpay Order Unhandled Exception:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error creating payment order.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type CreateOrderRequest = {
  bookingId?: string;
};

export async function POST(request: Request) {
  try {
    /* -----------------------------------------
       Authentication
    ----------------------------------------- */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Please login to proceed with payment." },
        { status: 401 }
      );
    }

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
        { error: "User account not found." },
        { status: 401 }
      );
    }

    /* -----------------------------------------
       Parse Request Body
    ----------------------------------------- */
    const body = (await request.json()) as CreateOrderRequest;
    const bookingId = body.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Fetch Booking
    ----------------------------------------- */
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
        { error: "Cannot create payment for a cancelled booking." },
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
       Calculate Authoritative Amount in Paise
    ----------------------------------------- */
    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Create Razorpay Order
    ----------------------------------------- */
    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(
        "Create Order Error: Razorpay API keys missing in server environment."
      );
      return NextResponse.json(
        {
          error:
            "Razorpay Payment Gateway is not configured. Missing API keys on server.",
        },
        { status: 500 }
      );
    }

    let razorpayOrderId = "";

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: booking.id,
        notes: {
          bookingId: booking.id,
          userId: dbUser.id,
        },
      });

      razorpayOrderId = order.id;

      // Safe diagnostic logging (RAZORPAY_KEY_SECRET is NEVER logged)
      const maskedKey = `${keyId.slice(0, 8)}...${keyId.slice(-4)}`;
      const amountInRupees = Number(booking.totalAmount);
      console.log("[PAYMENT_DIAGNOSTIC] Razorpay Order Creation Success:", {
        flow: "Pay Now / Booking Checkout",
        bookingId: booking.id,
        amountRupees: `₹${amountInRupees}`,
        amountPaise: amountInPaise,
        currency: "INR",
        orderId: razorpayOrderId,
        keyId: maskedKey,
      });
    } catch (razorpayErr: any) {
      const maskedKey = keyId ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : "MISSING";
      console.error("[PAYMENT_DIAGNOSTIC] Razorpay SDK Order Creation Failed:", {
        bookingId: booking.id,
        amountPaise: amountInPaise,
        keyId: maskedKey,
        error: razorpayErr?.error || razorpayErr?.message || razorpayErr,
        code: razorpayErr?.statusCode || razorpayErr?.code,
        description: razorpayErr?.error?.description,
        reason: razorpayErr?.error?.reason,
        source: razorpayErr?.error?.source,
      });
      return NextResponse.json(
        {
          error: `Razorpay Order Creation Failed: ${
            razorpayErr?.error?.description ||
            (razorpayErr instanceof Error ? razorpayErr.message : "Gateway error")
          }`,
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       Store Order ID in Prisma
    ----------------------------------------- */
    await prisma.booking.update({
      where: { id: bookingId },
      data: { razorpayOrderId },
    });

    return NextResponse.json({
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { buildAdminPaymentReceivedContent } from "@/lib/admin-notification-context";
import { sendPaymentSuccessEmails, sendBookingConfirmedEmail } from "@/lib/email-events";

type VerifyPaymentRequest = {
  bookingId?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  couponCode?: string;
};

export async function POST(request: Request) {
  try {
    /* -----------------------------------------
       Authentication
    ----------------------------------------- */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Please login to verify payment." },
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
    const body = (await request.json()) as VerifyPaymentRequest;
    const bookingId = body.bookingId?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const orderId = body.razorpay_order_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!bookingId || !paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: "Payment verification details are incomplete." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Fetch Booking
    ----------------------------------------- */
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
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
        { error: "You are not authorized to verify this payment." },
        { status: 403 }
      );
    }

    /* -----------------------------------------
       Idempotency Check
    ----------------------------------------- */
    if (booking.status === "CONFIRMED" && booking.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        message: "Payment already verified and booking confirmed.",
        bookingId: booking.id,
      });
    }

    /* -----------------------------------------
       Order ID Validation
    ----------------------------------------- */
    if (booking.razorpayOrderId && booking.razorpayOrderId !== orderId) {
      return NextResponse.json(
        { error: "Order ID mismatch. Payment verification failed." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Signature Verification (HMAC-SHA256)
    ----------------------------------------- */
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error(
        "Verify Payment Error: Missing RAZORPAY_KEY_SECRET in server environment."
      );
      return NextResponse.json(
        { error: "Razorpay Key Secret is missing on the server." },
        { status: 500 }
      );
    }

    const payloadText = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payloadText)
      .digest("hex");

    const isSignatureValid =
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      ) || signature === expectedSignature;

    if (!isSignatureValid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: "FAILED" },
      });

      return NextResponse.json(
        { error: "Invalid Razorpay payment signature." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       Re-check Double Booking Conflict
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
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: "FAILED" },
      });

      return NextResponse.json(
        { error: "Vehicle was booked by another customer in the meantime." },
        { status: 409 }
      );
    }

    /* -----------------------------------------
       Coupon Usage Resolution (If Coupon Applied)
    ----------------------------------------- */
    let couponToRecord = null;
    const inputCouponCode = body.couponCode?.trim();

    if (inputCouponCode && Number(booking.discountAmount) > 0) {
      couponToRecord = await prisma.coupon.findFirst({
        where: {
          code: {
            equals: inputCouponCode,
            mode: "insensitive",
          },
        },
        include: {
          _count: { select: { usages: true } },
        },
      });
    }

    /* -----------------------------------------
       Update DB (Booking + Payment + CouponUsage)
    ----------------------------------------- */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactionOperations: any[] = [
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: paymentId,
          paidAt: new Date(),
        },
      }),
      prisma.payment.upsert({
        where: { bookingId },
        update: {
          amount: booking.totalAmount,
          status: "SUCCESS",
          transactionId: paymentId,
          gateway: "RAZORPAY",
        },
        create: {
          bookingId,
          amount: booking.totalAmount,
          status: "SUCCESS",
          transactionId: paymentId,
          gateway: "RAZORPAY",
        },
      }),
    ];

    if (couponToRecord && Number(booking.discountAmount) > 0) {
      transactionOperations.push(
        prisma.couponUsage.upsert({
          where: { bookingId },
          update: {
            discountAmount: booking.discountAmount,
          },
          create: {
            couponId: couponToRecord.id,
            userId: session.user.id,
            bookingId,
            discountAmount: booking.discountAmount,
          },
        })
      );
    }

    await prisma.$transaction(transactionOperations);

    /* -----------------------------------------
       Trigger Automatic Notifications
    ----------------------------------------- */
    await createNotification({
      userId: dbUser.id,
      type: "PAYMENT_SUCCESS",
      title: "Payment Successful",
      message: "Your payment for the Prime Rides booking was successful.",
      link: `/dashboard?bookingId=${booking.id}`,
    });

    await createNotification({
      userId: dbUser.id,
      type: "BOOKING_CONFIRMED",
      title: "Booking Confirmed",
      message: "Your Prime Rides booking has been confirmed. Get ready for your ride!",
      link: `/dashboard?bookingId=${booking.id}`,
    });

    const adminPaymentContent = buildAdminPaymentReceivedContent(booking);

    await notifyAdmins({
      type: "ADMIN_PAYMENT_RECEIVED",
      title: adminPaymentContent.title,
      message: adminPaymentContent.message,
      link: adminPaymentContent.link,
    });

    /* -----------------------------------------
       Trigger Transactional Email Notifications
    ----------------------------------------- */
    try {
      await sendPaymentSuccessEmails({ bookingId: booking.id });
      await sendBookingConfirmedEmail({ bookingId: booking.id });
    } catch (emailErr) {
      console.error("Payment verify email dispatch error (isolated):", emailErr);
    }


    return NextResponse.json({
      message: "Payment verified successfully and booking confirmed.",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}

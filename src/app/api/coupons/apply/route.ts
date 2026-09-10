import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type ApplyCouponRequest = {
  code?: string;
  bookingValue?: number | string;
};

export async function POST(request: Request) {
  try {
    /* 1. Authentication Check */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please login to apply a coupon code." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = (await request.json()) as ApplyCouponRequest;

    const rawCode = body.code?.toString().trim();
    const bookingValue = Number(body.bookingValue);

    if (!rawCode) {
      return NextResponse.json(
        { error: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    if (isNaN(bookingValue) || bookingValue <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount for coupon calculation." },
        { status: 400 }
      );
    }

    /* 2. Case-Insensitive Coupon Fetch */
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: rawCode,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code." },
        { status: 400 }
      );
    }

    /* 3. Active Status Check */
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is currently inactive." },
        { status: 400 }
      );
    }

    /* 4. Validity Date Range Check */
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

    /* 5. Minimum Booking Value Check */
    const minVal = coupon.minBookingValue ? Number(coupon.minBookingValue) : null;
    if (minVal !== null && bookingValue < minVal) {
      return NextResponse.json(
        {
          error: `Minimum booking value for this coupon is ₹${minVal.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    /* 6. Total Usage Limit Check */
    if (coupon.usageLimit !== null && coupon._count.usages >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }

    /* 7. Per-Customer Usage Check (One use per customer) */
    const existingUserUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (existingUserUsage) {
      return NextResponse.json(
        { error: "You have already used this coupon." },
        { status: 400 }
      );
    }

    /* 8. Calculate Server-Authoritative Discount */
    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);
    const maxDiscountVal = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (bookingValue * discountVal) / 100;
      if (maxDiscountVal !== null && discountAmount > maxDiscountVal) {
        discountAmount = maxDiscountVal;
      }
    } else {
      // FIXED
      discountAmount = discountVal;
    }

    /* 9. Ensure discount does not exceed booking amount */
    if (discountAmount > bookingValue) {
      discountAmount = bookingValue;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    /* 10. Return Validation Result */
    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: discountVal,
      discountAmount,
      message: "Coupon applied successfully.",
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while applying the coupon." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

/* =========================================
   GET - List All Coupons (Admin Only)
========================================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    const formattedCoupons = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minBookingValue: c.minBookingValue ? Number(c.minBookingValue) : null,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      validFrom: c.validFrom.toISOString(),
      validUntil: c.validUntil.toISOString(),
      usageLimit: c.usageLimit,
      usageCount: c._count.usages,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ coupons: formattedCoupons });
  } catch (error) {
    console.error("Fetch Admin Coupons Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons." },
      { status: 500 }
    );
  }
}

/* =========================================
   POST - Create New Coupon (Admin Only)
========================================= */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const codeInput = body.code?.toString().trim().toUpperCase();
    const titleInput = body.title?.toString().trim() || null;
    const descriptionInput = body.description?.toString().trim() || null;

    const discountType = body.discountType as DiscountType;
    const discountValue = Number(body.discountValue);
    const minBookingValue =
      body.minBookingValue !== undefined && body.minBookingValue !== null && body.minBookingValue !== ""
        ? Number(body.minBookingValue)
        : null;
    const maxDiscount =
      body.maxDiscount !== undefined && body.maxDiscount !== null && body.maxDiscount !== ""
        ? Number(body.maxDiscount)
        : null;
    const validFromInput = body.validFrom;
    const validUntilInput = body.validUntil;
    const usageLimit =
      body.usageLimit !== undefined && body.usageLimit !== null && body.usageLimit !== ""
        ? parseInt(body.usageLimit, 10)
        : null;
    const isActive = body.isActive !== false;

    /* Validation */
    if (!codeInput) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    if (titleInput && titleInput.length > 100) {
      return NextResponse.json({ error: "Coupon title cannot exceed 100 characters." }, { status: 400 });
    }

    if (descriptionInput && descriptionInput.length > 300) {
      return NextResponse.json({ error: "Coupon description cannot exceed 300 characters." }, { status: 400 });
    }

    if (!Object.values(DiscountType).includes(discountType)) {
      return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be a number greater than 0." },
        { status: 400 }
      );
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    if (minBookingValue !== null && (isNaN(minBookingValue) || minBookingValue < 0)) {
      return NextResponse.json(
        { error: "Minimum booking value cannot be negative." },
        { status: 400 }
      );
    }

    if (maxDiscount !== null && (isNaN(maxDiscount) || maxDiscount < 0)) {
      return NextResponse.json(
        { error: "Maximum discount cannot be negative." },
        { status: 400 }
      );
    }

    if (!validFromInput || !validUntilInput) {
      return NextResponse.json(
        { error: "Valid From and Valid Until dates are required." },
        { status: 400 }
      );
    }

    const validFrom = new Date(validFromInput);
    const validUntil = new Date(validUntilInput);

    if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format provided for validity range." },
        { status: 400 }
      );
    }

    if (validUntil <= validFrom) {
      return NextResponse.json(
        { error: "Valid Until date must be strictly after Valid From date." },
        { status: 400 }
      );
    }

    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit <= 0)) {
      return NextResponse.json(
        { error: "Usage limit must be a positive integer." },
        { status: 400 }
      );
    }

    /* Check uniqueness */
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: codeInput },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: `Coupon code "${codeInput}" already exists.` },
        { status: 409 }
      );
    }

    /* Create Coupon */
    const newCoupon = await prisma.coupon.create({
      data: {
        code: codeInput,
        title: titleInput,
        description: descriptionInput,
        discountType,
        discountValue,
        minBookingValue,
        maxDiscount,
        validFrom,
        validUntil,
        usageLimit,
        isActive,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/(customer)", "page");
      revalidatePath("/admin/coupons");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json(
      {
        message: "Coupon created successfully.",
        coupon: {
          id: newCoupon.id,
          code: newCoupon.code,
          title: newCoupon.title,
          description: newCoupon.description,
          discountType: newCoupon.discountType,
          discountValue: Number(newCoupon.discountValue),
          minBookingValue: newCoupon.minBookingValue ? Number(newCoupon.minBookingValue) : null,
          maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
          validFrom: newCoupon.validFrom.toISOString(),
          validUntil: newCoupon.validUntil.toISOString(),
          usageLimit: newCoupon.usageLimit,
          isActive: newCoupon.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Admin Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================
   GET - Fetch Single Coupon (Admin Only)
========================================= */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { usedAt: "desc" },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            booking: {
              select: {
                id: true,
                totalAmount: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }

    return NextResponse.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minBookingValue: coupon.minBookingValue ? Number(coupon.minBookingValue) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        validFrom: coupon.validFrom.toISOString(),
        validUntil: coupon.validUntil.toISOString(),
        usageLimit: coupon.usageLimit,
        usageCount: coupon._count.usages,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
        usages: coupon.usages.map((u) => ({
          id: u.id,
          userId: u.userId,
          userName: u.user?.name || "Customer",
          userEmail: u.user?.email || "—",
          bookingId: u.bookingId,
          discountAmount: Number(u.discountAmount),
          usedAt: u.usedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Get Single Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon details." },
      { status: 500 }
    );
  }
}

/* =========================================
   PATCH - Update Coupon (Admin Only)
========================================= */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.code !== undefined) {
      const codeInput = body.code?.toString().trim().toUpperCase();
      if (!codeInput) {
        return NextResponse.json({ error: "Coupon code cannot be empty." }, { status: 400 });
      }
      if (codeInput !== existing.code) {
        const dup = await prisma.coupon.findUnique({ where: { code: codeInput } });
        if (dup) {
          return NextResponse.json({ error: `Coupon code "${codeInput}" is already taken.` }, { status: 409 });
        }
      }
      updateData.code = codeInput;
    }

    if (body.title !== undefined) {
      const titleInput = body.title !== null ? body.title.toString().trim() : null;
      if (titleInput && titleInput.length > 100) {
        return NextResponse.json({ error: "Coupon title cannot exceed 100 characters." }, { status: 400 });
      }
      updateData.title = titleInput || null;
    }

    if (body.description !== undefined) {
      const descInput = body.description !== null ? body.description.toString().trim() : null;
      if (descInput && descInput.length > 300) {
        return NextResponse.json({ error: "Coupon description cannot exceed 300 characters." }, { status: 400 });
      }
      updateData.description = descInput || null;
    }

    if (body.discountType !== undefined) {
      if (!Object.values(DiscountType).includes(body.discountType)) {
        return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
      }
      updateData.discountType = body.discountType;
    }

    if (body.discountValue !== undefined) {
      const val = Number(body.discountValue);
      if (isNaN(val) || val <= 0) {
        return NextResponse.json({ error: "Discount value must be greater than 0." }, { status: 400 });
      }
      const typeToCheck = (body.discountType || existing.discountType) as DiscountType;
      if (typeToCheck === "PERCENTAGE" && val > 100) {
        return NextResponse.json({ error: "Percentage discount cannot exceed 100%." }, { status: 400 });
      }
      updateData.discountValue = val;
    }

    if (body.minBookingValue !== undefined) {
      if (body.minBookingValue === null || body.minBookingValue === "") {
        updateData.minBookingValue = null;
      } else {
        const val = Number(body.minBookingValue);
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: "Minimum booking value cannot be negative." }, { status: 400 });
        }
        updateData.minBookingValue = val;
      }
    }

    if (body.maxDiscount !== undefined) {
      if (body.maxDiscount === null || body.maxDiscount === "") {
        updateData.maxDiscount = null;
      } else {
        const val = Number(body.maxDiscount);
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: "Maximum discount cannot be negative." }, { status: 400 });
        }
        updateData.maxDiscount = val;
      }
    }

    if (body.validFrom !== undefined) {
      const d = new Date(body.validFrom);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid Valid From date." }, { status: 400 });
      }
      updateData.validFrom = d;
    }

    if (body.validUntil !== undefined) {
      const d = new Date(body.validUntil);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid Valid Until date." }, { status: 400 });
      }
      updateData.validUntil = d;
    }

    /* Date range validation */
    const finalValidFrom = (updateData.validFrom as Date) || existing.validFrom;
    const finalValidUntil = (updateData.validUntil as Date) || existing.validUntil;

    if (finalValidUntil <= finalValidFrom) {
      return NextResponse.json(
        { error: "Valid Until date must be strictly after Valid From date." },
        { status: 400 }
      );
    }

    if (body.usageLimit !== undefined) {
      if (body.usageLimit === null || body.usageLimit === "") {
        updateData.usageLimit = null;
      } else {
        const val = parseInt(body.usageLimit, 10);
        if (isNaN(val) || val <= 0) {
          return NextResponse.json({ error: "Usage limit must be a positive integer." }, { status: 400 });
        }
        updateData.usageLimit = val;
      }
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/");
      revalidatePath("/(customer)", "page");
      revalidatePath("/admin/coupons");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      message: "Coupon updated successfully.",
      coupon: {
        id: updatedCoupon.id,
        code: updatedCoupon.code,
        title: updatedCoupon.title,
        description: updatedCoupon.description,
        discountType: updatedCoupon.discountType,
        discountValue: Number(updatedCoupon.discountValue),
        minBookingValue: updatedCoupon.minBookingValue ? Number(updatedCoupon.minBookingValue) : null,
        maxDiscount: updatedCoupon.maxDiscount ? Number(updatedCoupon.maxDiscount) : null,
        validFrom: updatedCoupon.validFrom.toISOString(),
        validUntil: updatedCoupon.validUntil.toISOString(),
        usageLimit: updatedCoupon.usageLimit,
        isActive: updatedCoupon.isActive,
      },
    });
  } catch (error) {
    console.error("Update Admin Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon." },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE - Delete Coupon (Admin Only)
========================================= */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }

    /* Safely prevent deleting coupons with historical usages */
    if (coupon._count.usages > 0) {
      return NextResponse.json(
        {
          error:
            "This coupon has usage history. Deactivate it instead to preserve historical booking records.",
        },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
      revalidatePath("/(customer)", "page");
      revalidatePath("/admin/coupons");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      message: `Coupon "${coupon.code}" was deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete Admin Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon." },
      { status: 500 }
    );
  }
}

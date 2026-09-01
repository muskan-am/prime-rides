import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type BookingStatus = (typeof VALID_STATUSES)[number];

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    /* ----------------------------- */
    /* Authentication */
    /* ----------------------------- */

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    /* ----------------------------- */
    /* Admin Authorization */
    /* ----------------------------- */

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    /* ----------------------------- */
    /* Get Booking ID */
    /* ----------------------------- */

    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* Request Body */
    /* ----------------------------- */

    const body = await request.json();

    const status = body?.status as string;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* Validate Status */
    /* ----------------------------- */

    if (
      !VALID_STATUSES.includes(
        status as BookingStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status",
        },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* Check Booking */
    /* ----------------------------- */

    const existingBooking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    /* ----------------------------- */
    /* Update Booking */
    /* ----------------------------- */

    const booking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: status as any,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "ADMIN BOOKING STATUS UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking status",
      },
      { status: 500 }
    );
  }
}
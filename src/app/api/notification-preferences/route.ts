import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ALLOWED_PREFERENCE_FIELDS } from "@/lib/notification-preferences";

const DEFAULT_PREFERENCES = {
  bookingCreated: true,
  paymentPending: true,
  paymentSuccess: true,
  bookingConfirmed: true,
  bookingCancelled: true,
  bookingCompleted: true,
  adminNewBooking: true,
  adminPaymentReceived: true,
  adminBookingCancelled: true,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const preference = await prisma.notificationPreference.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!preference) {
      return NextResponse.json({
        userId: session.user.id,
        ...DEFAULT_PREFERENCES,
      });
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Bad Request: Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize and validate fields strictly
    const sanitizedData: Record<string, boolean> = {};

    for (const key of Object.keys(body)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(ALLOWED_PREFERENCE_FIELDS as readonly string[]).includes(key)) {
        return NextResponse.json(
          { error: `Bad Request: Field '${key}' is not an allowed preference field.` },
          { status: 400 }
        );
      }

      if (typeof body[key] !== "boolean") {
        return NextResponse.json(
          { error: `Bad Request: Field '${key}' must be a boolean value.` },
          { status: 400 }
        );
      }

      sanitizedData[key] = body[key];
    }

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json(
        { error: "Bad Request: No valid preference fields provided" },
        { status: 400 }
      );
    }

    const updatedPreference = await prisma.notificationPreference.upsert({
      where: {
        userId: session.user.id,
      },
      update: sanitizedData,
      create: {
        userId: session.user.id,
        ...DEFAULT_PREFERENCES,
        ...sanitizedData,
      },
    });

    return NextResponse.json(updatedPreference);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

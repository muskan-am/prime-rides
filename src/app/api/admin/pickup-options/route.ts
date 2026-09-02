import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET
 * Fetch all pickup options
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const pickupOptions = await prisma.pickupOption.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return NextResponse.json(pickupOptions);
  } catch (error) {
    console.error("GET pickup options error:", error);

    return NextResponse.json(
      { error: "Failed to fetch pickup options" },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Create a new pickup option
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Pickup option name is required" },
        { status: 400 }
      );
    }

    // Check duplicate name
    const existingOption = await prisma.pickupOption.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingOption) {
      return NextResponse.json(
        { error: "Pickup option with this name already exists" },
        { status: 409 }
      );
    }

    const pickupOption = await prisma.pickupOption.create({
      data: {
        name,
        description: description || null,
        isActive,
      },
    });

    return NextResponse.json(
      pickupOption,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST pickup option error:", error);

    return NextResponse.json(
      { error: "Failed to create pickup option" },
      { status: 500 }
    );
  }
}
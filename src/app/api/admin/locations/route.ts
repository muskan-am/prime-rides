import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    const locations = await prisma.location.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error(
      "GET LOCATIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch locations",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    const latitude =
      body.latitude !== undefined &&
      body.latitude !== null &&
      body.latitude !== ""
        ? Number(body.latitude)
        : null;

    const longitude =
      body.longitude !== undefined &&
      body.longitude !== null &&
      body.longitude !== ""
        ? Number(body.longitude)
        : null;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Location name is required",
        },
        { status: 400 }
      );
    }

    if (
      latitude !== null &&
      !Number.isFinite(latitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude",
        },
        { status: 400 }
      );
    }

    if (
      longitude !== null &&
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid longitude",
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        latitude,
        longitude,
        isActive,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Location created successfully",
        location,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create location",
      },
      { status: 500 }
    );
  }
}
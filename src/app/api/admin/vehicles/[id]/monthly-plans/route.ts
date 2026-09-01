import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdmin(): Promise<NextResponse | null> {
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

  return null;
}

/**
 * GET /api/admin/vehicles/[id]/monthly-plans
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const plans = await prisma.monthlyPlan.findMany({
      where: {
        vehicleId: id,
      },
      orderBy: {
        months: "asc",
      },
    });

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error("GET monthly plans error:", error);

    return NextResponse.json(
      { error: "Failed to fetch monthly plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles/[id]/monthly-plans
 */
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const months = Number(body.months);
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json(
        { error: "Plan name is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(months) || months <= 0) {
      return NextResponse.json(
        {
          error: "Months must be a positive number",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          error: "Valid plan price is required",
        },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const existingPlan =
      await prisma.monthlyPlan.findFirst({
        where: {
          vehicleId: id,
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (existingPlan) {
      return NextResponse.json(
        {
          error:
            "A monthly plan with this name already exists",
        },
        { status: 409 }
      );
    }

    const monthlyPlan =
      await prisma.monthlyPlan.create({
        data: {
          vehicleId: id,
          name,
          months,
          price: new Prisma.Decimal(price),
          isActive: true,
        },
      });

    return NextResponse.json(
      {
        message: "Monthly plan added successfully",
        plan: monthlyPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST monthly plan error:", error);

    return NextResponse.json(
      { error: "Failed to add monthly plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]/monthly-plans
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const authResponse = await checkAdmin();

    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;

    const body = await request.json();

    const planId =
      typeof body.planId === "string"
        ? body.planId
        : "";

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const plan = await prisma.monthlyPlan.findFirst({
      where: {
        id: planId,
        vehicleId: id,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Monthly plan not found" },
        { status: 404 }
      );
    }

    await prisma.monthlyPlan.delete({
      where: {
        id: planId,
      },
    });

    return NextResponse.json({
      message: "Monthly plan deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE monthly plan error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete monthly plan" },
      { status: 500 }
    );
  }
}
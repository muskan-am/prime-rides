import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET
 * Fetch one pickup option
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Pickup option ID is required" },
        { status: 400 }
      );
    }

    const pickupOption = await prisma.pickupOption.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!pickupOption) {
      return NextResponse.json(
        { error: "Pickup option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pickupOption);
  } catch (error) {
    console.error("GET pickup option error:", error);

    return NextResponse.json(
      { error: "Failed to fetch pickup option" },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Update pickup option
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Pickup option ID is required" },
        { status: 400 }
      );
    }

    const existingOption =
      await prisma.pickupOption.findUnique({
        where: {
          id,
        },
      });

    if (!existingOption) {
      return NextResponse.json(
        { error: "Pickup option not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};

    // Name
    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 }
        );
      }

      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          { error: "Pickup option name is required" },
          { status: 400 }
        );
      }

      // Check duplicate name
      const duplicateOption =
        await prisma.pickupOption.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
            NOT: {
              id,
            },
          },
        });

      if (duplicateOption) {
        return NextResponse.json(
          {
            error:
              "Another pickup option with this name already exists",
          },
          { status: 409 }
        );
      }

      data.name = name;
    }

    // Description
    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          { error: "Description must be a string" },
          { status: 400 }
        );
      }

      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    // Active status
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean" },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedOption =
      await prisma.pickupOption.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error("PATCH pickup option error:", error);

    return NextResponse.json(
      { error: "Failed to update pickup option" },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * Delete pickup option
 */
export async function DELETE(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Pickup option ID is required" },
        { status: 400 }
      );
    }

    const pickupOption =
      await prisma.pickupOption.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

    if (!pickupOption) {
      return NextResponse.json(
        { error: "Pickup option not found" },
        { status: 404 }
      );
    }

    // Don't delete if bookings are connected
    if (pickupOption._count.bookings > 0) {
      return NextResponse.json(
        {
          error:
            "This pickup option cannot be deleted because it is used by existing bookings. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.pickupOption.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Pickup option deleted successfully",
    });
  } catch (error) {
    console.error("DELETE pickup option error:", error);

    return NextResponse.json(
      { error: "Failed to delete pickup option" },
      { status: 500 }
    );
  }
}
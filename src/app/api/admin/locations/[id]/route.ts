import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await checkAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;

    const location =
      await prisma.location.findUnique({
        where: {
          id,
        },
      });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error) {
    console.error(
      "GET LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch location",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await checkAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;

    const existingLocation =
      await prisma.location.findUnique({
        where: {
          id,
        },
      });

    if (!existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      address?: string | null;
      phone?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Location name is required",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (body.address !== undefined) {
      data.address =
        typeof body.address === "string"
          ? body.address.trim() || null
          : null;
    }

    if (body.phone !== undefined) {
      data.phone =
        typeof body.phone === "string"
          ? body.phone.trim() || null
          : null;
    }

    if (body.latitude !== undefined) {
      if (
        body.latitude === null ||
        body.latitude === ""
      ) {
        data.latitude = null;
      } else {
        const latitude = Number(
          body.latitude
        );

        if (!Number.isFinite(latitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid latitude",
            },
            { status: 400 }
          );
        }

        data.latitude = latitude;
      }
    }

    if (body.longitude !== undefined) {
      if (
        body.longitude === null ||
        body.longitude === ""
      ) {
        data.longitude = null;
      } else {
        const longitude = Number(
          body.longitude
        );

        if (!Number.isFinite(longitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid longitude",
            },
            { status: 400 }
          );
        }

        data.longitude = longitude;
      }
    }

    if (body.isActive !== undefined) {
      if (
        typeof body.isActive !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid active status",
          },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    const location =
      await prisma.location.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      location,
    });
  } catch (error) {
    console.error(
      "UPDATE LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update location",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await checkAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;

    const existingLocation =
      await prisma.location.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              bookings: true,
              inventory: true,
            },
          },
        },
      });

    if (!existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found",
        },
        { status: 404 }
      );
    }

    /*
     * Do not delete locations that are already
     * referenced by bookings or inventory.
     *
     * Deactivate them instead.
     */

    if (
      existingLocation._count.bookings > 0 ||
      existingLocation._count.inventory > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Location is already in use. Deactivate it instead of deleting it.",
        },
        { status: 409 }
      );
    }

    await prisma.location.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete location",
      },
      { status: 500 }
    );
  }
}
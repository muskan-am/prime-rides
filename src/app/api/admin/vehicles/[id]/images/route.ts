import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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
 * GET /api/admin/vehicles/[id]/images
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

    const images = await prisma.vehicleImage.findMany({
      where: {
        vehicleId: id,
      },
      orderBy: [
        {
          isPrimary: "desc",
        },
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json({
      images,
    });
  } catch (error) {
    console.error("GET vehicle images error:", error);

    return NextResponse.json(
      { error: "Failed to fetch vehicle images" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles/[id]/images
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

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    const requestedPrimary = body.isPrimary === true;

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
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

    const existingImage =
      await prisma.vehicleImage.findFirst({
        where: {
          vehicleId: id,
          url,
        },
      });

    if (existingImage) {
      return NextResponse.json(
        { error: "This image already exists" },
        { status: 409 }
      );
    }

    const imageCount =
      await prisma.vehicleImage.count({
        where: {
          vehicleId: id,
        },
      });

    /*
     * If this is the first image, automatically
     * make it primary.
     */
    const isPrimary =
      imageCount === 0 || requestedPrimary;

    /*
     * If this image becomes primary,
     * remove primary status from other images.
     */
    if (isPrimary) {
      await prisma.vehicleImage.updateMany({
        where: {
          vehicleId: id,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const image = await prisma.vehicleImage.create({
      data: {
        vehicleId: id,
        url,
        isPrimary,
        sortOrder: imageCount,
      },
    });

    /*
     * Keep Vehicle.primaryImage synchronized.
     */
    if (isPrimary) {
      await prisma.vehicle.update({
        where: {
          id,
        },
        data: {
          primaryImage: url,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Image added successfully",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST vehicle image error:", error);

    return NextResponse.json(
      { error: "Failed to add vehicle image" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/vehicles/[id]/images
 *
 * Set an image as primary.
 */
export async function PATCH(
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

    const imageId =
      typeof body.imageId === "string"
        ? body.imageId
        : "";

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image =
      await prisma.vehicleImage.findFirst({
        where: {
          id: imageId,
          vehicleId: id,
        },
      });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    /*
     * Remove primary from all images.
     */
    await prisma.vehicleImage.updateMany({
      where: {
        vehicleId: id,
      },
      data: {
        isPrimary: false,
      },
    });

    /*
     * Make selected image primary.
     */
    const updatedImage =
      await prisma.vehicleImage.update({
        where: {
          id: imageId,
        },
        data: {
          isPrimary: true,
        },
      });

    /*
     * Keep Vehicle.primaryImage synchronized.
     */
    await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        primaryImage: image.url,
      },
    });

    return NextResponse.json({
      message: "Primary image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    console.error(
      "PATCH vehicle image error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update primary image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]/images
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

    const imageId =
      typeof body.imageId === "string"
        ? body.imageId
        : "";

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image =
      await prisma.vehicleImage.findFirst({
        where: {
          id: imageId,
          vehicleId: id,
        },
      });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    /*
     * If deleting primary image, choose another
     * image as the new primary image.
     */
    if (image.isPrimary) {
      const nextImage =
        await prisma.vehicleImage.findFirst({
          where: {
            vehicleId: id,
            NOT: {
              id: imageId,
            },
          },
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
        });

      await prisma.vehicleImage.delete({
        where: {
          id: imageId,
        },
      });

      if (nextImage) {
        await prisma.vehicleImage.update({
          where: {
            id: nextImage.id,
          },
          data: {
            isPrimary: true,
          },
        });

        await prisma.vehicle.update({
          where: {
            id,
          },
          data: {
            primaryImage: nextImage.url,
          },
        });
      } else {
        await prisma.vehicle.update({
          where: {
            id,
          },
          data: {
            primaryImage: null,
          },
        });
      }
    } else {
      await prisma.vehicleImage.delete({
        where: {
          id: imageId,
        },
      });
    }

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE vehicle image error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete vehicle image" },
      { status: 500 }
    );
  }
}
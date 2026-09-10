import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackageType } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            variant: true,
            basePrice: true,
            primaryImage: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error("Get Package Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch package details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      name,
      slug: customSlug,
      type,
      shortDescription,
      description,
      duration,
      price,
      image,
      features,
      terms,
      isActive,
      sortOrder,
      vehicleIds,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Package name cannot be empty." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (type !== undefined) {
      if (!["WEEKLY", "MONTHLY", "YEARLY"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid package type." },
          { status: 400 }
        );
      }
      updateData.type = type as PackageType;
    }

    if (duration !== undefined) {
      const numericDuration = Number(duration);
      if (!Number.isInteger(numericDuration) || numericDuration <= 0) {
        return NextResponse.json(
          { error: "Duration must be a positive integer." },
          { status: 400 }
        );
      }
      updateData.duration = numericDuration;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          { error: "Price must be a non-negative number." },
          { status: 400 }
        );
      }
      updateData.price = numericPrice;
    }

    if (customSlug !== undefined) {
      let slug = slugify(customSlug || (name || existingPackage.name));
      if (!slug) slug = `package-${Date.now()}`;

      if (slug !== existingPackage.slug) {
        const slugExists = await prisma.package.findUnique({
          where: { slug },
        });

        if (slugExists && slugExists.id !== id) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }
      updateData.slug = slug;
    }

    if (shortDescription !== undefined) {
      updateData.shortDescription = shortDescription ? String(shortDescription).trim() : null;
    }

    if (description !== undefined) {
      updateData.description = description ? String(description).trim() : null;
    }

    if (image !== undefined) {
      updateData.image = image ? String(image).trim() : null;
    }

    if (features !== undefined) {
      let featuresList: string[] = [];
      if (Array.isArray(features)) {
        featuresList = features.map((f: unknown) => String(f).trim()).filter(Boolean);
      } else if (typeof features === "string") {
        featuresList = features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean);
      }
      updateData.features = featuresList;
    }

    if (terms !== undefined) {
      updateData.terms = terms ? String(terms).trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0;
    }

    if (Array.isArray(vehicleIds)) {
      updateData.vehicles = {
        set: vehicleIds.map((vId: string) => ({ id: vId })),
      };
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        vehicles: true,
      },
    });

    return NextResponse.json({
      message: "Package updated successfully.",
      package: updatedPackage,
    });
  } catch (error) {
    console.error("Update Package Error:", error);
    return NextResponse.json(
      { error: "Failed to update package." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Safety check: preserve historical booking references!
    if (existingPackage._count.bookings > 0) {
      return NextResponse.json(
        {
          error:
            "This package cannot be deleted because historical bookings reference it. Please deactivate the package instead to preserve booking history.",
        },
        { status: 400 }
      );
    }

    await prisma.package.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Package deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Package Error:", error);
    return NextResponse.json(
      { error: "Failed to delete package." },
      { status: 500 }
    );
  }
}

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packages = await prisma.package.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
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

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Get Admin Packages Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Basic Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Package name is required." }, { status: 400 });
    }

    if (!type || !["WEEKLY", "MONTHLY", "YEARLY"].includes(type)) {
      return NextResponse.json(
        { error: "Valid package type (WEEKLY, MONTHLY, YEARLY) is required." },
        { status: 400 }
      );
    }

    const numericDuration = Number(duration);
    if (!Number.isInteger(numericDuration) || numericDuration <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive integer (number of days)." },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Valid package price is required." }, { status: 400 });
    }

    // Slug generation and uniqueness check
    let slug = customSlug ? slugify(customSlug) : slugify(name);
    if (!slug) {
      slug = `package-${Date.now()}`;
    }

    const existingPackage = await prisma.package.findUnique({
      where: { slug },
    });

    if (existingPackage) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Process features
    let featuresList: string[] = [];
    if (Array.isArray(features)) {
      featuresList = features.map((f: unknown) => String(f).trim()).filter(Boolean);
    } else if (typeof features === "string") {
      featuresList = features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    // Vehicle connection array
    let vehicleConnections: { id: string }[] = [];
    if (Array.isArray(vehicleIds) && vehicleIds.length > 0) {
      vehicleConnections = vehicleIds.map((vId: string) => ({ id: vId }));
    }

    const newPackage = await prisma.package.create({
      data: {
        name: name.trim(),
        slug,
        type: type as PackageType,
        shortDescription: shortDescription ? String(shortDescription).trim() : null,
        description: description ? String(description).trim() : null,
        duration: numericDuration,
        price: numericPrice,
        image: image ? String(image).trim() : null,
        features: featuresList,
        terms: terms ? String(terms).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0,
        vehicles: {
          connect: vehicleConnections,
        },
      },
      include: {
        vehicles: true,
      },
    });

    return NextResponse.json(
      { message: "Package created successfully.", package: newPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Package Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating package." },
      { status: 500 }
    );
  }
}

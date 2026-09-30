import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "ALL";
    const rating = searchParams.get("rating") || "ALL";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const skip = (page - 1) * limit;

    // Build Prisma Where Clause
    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (rating !== "ALL") {
      const ratingNum = parseInt(rating, 10);
      if (!isNaN(ratingNum)) {
        where.rating = ratingNum;
      }
    }

    if (search) {
      where.OR = [
        { bookingId: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          vehicle: {
            OR: [
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { variant: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Build OrderBy Clause
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "highest") orderBy = { rating: "desc" };
    if (sort === "lowest") orderBy = { rating: "asc" };

    const [reviews, totalCount, statsReviews] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              variant: true,
              primaryImage: true,
            },
          },
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.findMany({
        select: {
          id: true,
          rating: true,
          status: true,
        },
      }),
    ]);

    // Format stats summary
    let pending = 0;
    let approved = 0;
    let hidden = 0;
    let sumRating = 0;

    statsReviews.forEach((r) => {
      const s = (r as any).status || "PENDING";
      if (s === "APPROVED") approved++;
      else if (s === "HIDDEN") hidden++;
      else pending++;

      sumRating += r.rating;
    });

    const summary = {
      total: statsReviews.length,
      pending,
      approved,
      hidden,
      averageRating:
        statsReviews.length > 0
          ? Number((sumRating / statsReviews.length).toFixed(1))
          : 0,
    };

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Admin reviews query error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve reviews for admin portal" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      vehicleId,
      rating,
      comment,
      reviewerName,
      reviewerEmail,
      status = "APPROVED",
    } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle is required" }, { status: 400 });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { inventory: { where: { isActive: true }, take: 1 } },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Determine location for booking relation
    let locationId = vehicle.inventory[0]?.locationId || "";
    if (!locationId) {
      const anyLoc = await prisma.location.findFirst({ where: { isActive: true } });
      if (anyLoc) {
        locationId = anyLoc.id;
      } else {
        const createdLoc = await prisma.location.create({
          data: { name: "Main Hub", address: "Main Hub Location" },
        });
        locationId = createdLoc.id;
      }
    }

    // Find or create reviewer user
    let reviewerUserId = (session.user as any)?.id as string;
    if (!reviewerUserId) {
      const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      reviewerUserId = adminUser?.id || "";
    }

    if (reviewerEmail && reviewerEmail.trim()) {
      const email = reviewerEmail.trim().toLowerCase();
      let existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name: reviewerName?.trim() || "Verified Customer",
            email,
            role: "CUSTOMER",
          },
        });
      }
      reviewerUserId = existingUser.id;
    } else if (reviewerName && reviewerName.trim()) {
      const cleanName = reviewerName.trim();
      const tempEmail = `customer_${Date.now()}_${Math.floor(Math.random() * 10000)}@primerides.in`;
      const newUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: tempEmail,
          role: "CUSTOMER",
        },
      });
      reviewerUserId = newUser.id;
    }

    // Create a completed administrative booking relation for review schema integrity
    const booking = await prisma.booking.create({
      data: {
        userId: reviewerUserId,
        vehicleId,
        locationId,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "COMPLETED",
        bookingSource: "ADMIN",
        rentalAmount: 0,
        totalAmount: 0,
      },
    });

    // Create the Review
    const newReview = await prisma.review.create({
      data: {
        userId: reviewerUserId,
        vehicleId,
        bookingId: booking.id,
        rating: Math.round(parsedRating),
        comment: comment?.trim() || null,
        status: ["PENDING", "APPROVED", "HIDDEN"].includes(status)
          ? (status as any)
          : "APPROVED",
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            variant: true,
            primaryImage: true,
          },
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review created and published successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Admin create review error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

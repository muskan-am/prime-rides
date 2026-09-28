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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";
import { calculateApprovedReviews } from "@/lib/rating";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId query parameter is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Fetch only APPROVED reviews for public display
    const [approvedReviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          vehicleId,
          status: "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          vehicleId,
          status: "APPROVED",
        },
      }),
    ]);

    // Calculate rating distribution and average dynamically using centralized helper
    const allApproved = await prisma.review.findMany({
      where: {
        vehicleId,
      },
      select: {
        rating: true,
        status: true,
      },
    });

    const { averageRating, reviewCount: totalApproved, ratingDistribution: distribution } =
      calculateApprovedReviews(allApproved);

    return NextResponse.json({
      success: true,
      reviews: approvedReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          name: r.user?.name || "Verified Customer",
          image: r.user?.image || null,
        },
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating,
        totalReviews: totalApproved,
        distribution,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle reviews:", error);
    return NextResponse.json(
      { error: "Failed to retrieve reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to submit a review." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    // 1. Validation
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Please provide a valid rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (!trimmedComment) {
      return NextResponse.json(
        { error: "Please write a review describing your experience." },
        { status: 400 }
      );
    }

    if (trimmedComment.length > 1000) {
      return NextResponse.json(
        { error: "Review cannot exceed 1000 characters." },
        { status: 400 }
      );
    }

    // 2. Lookup booking and verify ownership & completion
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    // Security check: Customer must own this booking
    const isOwner =
      booking.userId === session.user.id ||
      booking.user?.email === session.user.email;

    if (!isOwner) {
      return NextResponse.json(
        { error: "You can only review bookings made from your own account." },
        { status: 403 }
      );
    }

    // Security check: Booking must be COMPLETED
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error:
            "Reviews can only be submitted for completed car rentals.",
        },
        { status: 400 }
      );
    }

    // 3. Upsert Review (one review per booking constraint)
    const review = await prisma.review.upsert({
      where: { bookingId },
      update: {
        rating: parsedRating,
        comment: trimmedComment,
        status: "PENDING", // Edited reviews re-enter moderation queue
        updatedAt: new Date(),
      },
      create: {
        userId: booking.userId,
        vehicleId: booking.vehicleId,
        bookingId: booking.id,
        rating: parsedRating,
        comment: trimmedComment,
        status: "PENDING",
      },
      include: {
        vehicle: {
          select: { brand: true, model: true },
        },
      },
    });

    // 4. Send Admin In-App Notification
    await notifyAdmins({
      type: "REVIEW_SUBMITTED",
      title: "New vehicle review submitted",
      message: `${session.user.name || "A customer"} submitted a ${parsedRating}★ review for ${booking.vehicle.brand} ${booking.vehicle.model}.`,
      link: `/admin/reviews`,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for sharing your experience! Your review has been submitted for moderation.",
      review,
    });
  } catch (error) {
    console.error("Error submitting customer review:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again later." },
      { status: 500 }
    );
  }
}

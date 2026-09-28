import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const isOwner =
      review.userId === session.user.id ||
      review.user?.email === session.user.email;

    if (!isOwner && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    const dataToUpdate: any = { updatedAt: new Date() };

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5 stars" },
          { status: 400 }
        );
      }
      dataToUpdate.rating = parsedRating;
    }

    if (comment !== undefined) {
      const trimmed = typeof comment === "string" ? comment.trim() : "";
      if (!trimmed) {
        return NextResponse.json(
          { error: "Comment cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmed.length > 1000) {
        return NextResponse.json(
          { error: "Comment cannot exceed 1000 characters" },
          { status: 400 }
        );
      }
      dataToUpdate.comment = trimmed;
    }

    // Reset customer edits to PENDING status if not edited by admin
    if (session.user.role !== "ADMIN") {
      dataToUpdate.status = "PENDING";
    }

    const updated = await prisma.review.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review: updated,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const isOwner =
      review.userId === session.user.id ||
      review.user?.email === session.user.email;

    if (!isOwner && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

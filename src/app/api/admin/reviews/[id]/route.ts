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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, rating, comment } = body;

    const dataToUpdate: any = { updatedAt: new Date() };

    if (status && ["PENDING", "APPROVED", "HIDDEN"].includes(status)) {
      dataToUpdate.status = status;
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (parsedRating >= 1 && parsedRating <= 5) {
        dataToUpdate.rating = parsedRating;
      }
    }

    if (comment !== undefined && typeof comment === "string") {
      dataToUpdate.comment = comment.trim();
    }

    const updated = await prisma.review.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { brand: true, model: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Review marked as ${updated.status}`,
      review: updated,
    });
  } catch (error) {
    console.error("Error updating review by admin:", error);
    return NextResponse.json(
      { error: "Failed to update review status" },
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review by admin:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

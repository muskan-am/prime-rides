import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let summary = {
    total: 0,
    pending: 0,
    approved: 0,
    hidden: 0,
    averageRating: 0,
  };

  let vehicles: Array<{
    id: string;
    brand: string;
    model: string;
    variant: string | null;
    primaryImage: string | null;
  }> = [];

  try {
    const [allReviews, dbVehicles] = await Promise.all([
      prisma.review.findMany({
        select: {
          id: true,
          rating: true,
          status: true,
        },
      }),
      prisma.vehicle.findMany({
        select: {
          id: true,
          brand: true,
          model: true,
          variant: true,
          primaryImage: true,
        },
        orderBy: [{ brand: "asc" }, { model: "asc" }],
      }),
    ]);

    vehicles = dbVehicles;

    let pending = 0;
    let approved = 0;
    let hidden = 0;
    let sumRating = 0;

    allReviews.forEach((r) => {
      const s = (r as any).status || "PENDING";
      if (s === "APPROVED") approved++;
      else if (s === "HIDDEN") hidden++;
      else pending++;

      sumRating += r.rating;
    });

    summary = {
      total: allReviews.length,
      pending,
      approved,
      hidden,
      averageRating:
        allReviews.length > 0
          ? Number((sumRating / allReviews.length).toFixed(1))
          : 0,
    };
  } catch (error) {
    console.error("Failed to load review stats for admin:", error);
  }

  return <AdminReviewsClient initialSummary={summary} vehicles={vehicles} />;
}

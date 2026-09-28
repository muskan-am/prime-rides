export type ReviewRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
  ratingDistribution: Record<number, number>;
};

/**
 * Single source of truth for calculating approved ratings across Prime Rides.
 * Only reviews with status === "APPROVED" (or legacy null/undefined) contribute to public ratings.
 * If 0 approved reviews exist, returns averageRating: null, reviewCount: 0.
 */
export function calculateApprovedReviews(
  reviews?: Array<{ rating: number; status?: string | null }> | null
): ReviewRatingSummary {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return {
      averageRating: null,
      reviewCount: 0,
      ratingDistribution: distribution,
    };
  }

  // Filter approved reviews only
  const approved = reviews.filter(
    (r) => !r.status || r.status === "APPROVED"
  );

  if (approved.length === 0) {
    return {
      averageRating: null,
      reviewCount: 0,
      ratingDistribution: distribution,
    };
  }

  let sum = 0;
  for (const r of approved) {
    const star = Math.min(Math.max(Math.round(r.rating || 0), 1), 5);
    distribution[star] = (distribution[star] || 0) + 1;
    sum += Number(r.rating || 0);
  }

  const avg = Number((sum / approved.length).toFixed(1));

  return {
    averageRating: avg,
    reviewCount: approved.length,
    ratingDistribution: distribution,
  };
}

export function formatFuelType(fuel: string | null | undefined): string {
  if (!fuel) return "Petrol";
  const upper = fuel.toUpperCase();
  if (upper === "PETROL") return "Petrol";
  if (upper === "DIESEL") return "Diesel";
  if (upper === "ELECTRIC") return "Electric";
  if (upper === "HYBRID") return "Hybrid";
  if (upper === "CNG") return "CNG";
  return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
}

export function formatTransmission(trans: string | null | undefined): string {
  if (!trans) return "Automatic";
  const upper = trans.toUpperCase();
  if (upper === "AUTOMATIC") return "Automatic";
  if (upper === "MANUAL") return "Manual";
  return trans.charAt(0).toUpperCase() + trans.slice(1).toLowerCase();
}

export function formatVehicleCategory(
  variant?: string | null,
  model?: string | null,
  brand?: string | null
): string {
  const combined = `${variant || ""} ${model || ""} ${brand || ""}`.toLowerCase();
  if (combined.includes("compact suv") || combined.includes("creta") || combined.includes("seltos")) return "SUV";
  if (combined.includes("luxury suv") || combined.includes("kodiaq")) return "Luxury SUV";
  if (combined.includes("luxury sedan") || combined.includes("3 series") || combined.includes("bmw")) return "Luxury Sedan";
  if (combined.includes("suv") || combined.includes("fortuner") || combined.includes("xuv") || combined.includes("harrier") || combined.includes("hector")) return "SUV";
  if (combined.includes("sedan") || combined.includes("city") || combined.includes("verna") || combined.includes("ciaz")) return "Sedan";
  if (combined.includes("hatchback") || combined.includes("i20") || combined.includes("swift") || combined.includes("baleno")) return "Hatchback";
  if (combined.includes("mpv") || combined.includes("muv") || combined.includes("innova") || combined.includes("ertiga") || combined.includes("hycross")) return "MUV/MPV";
  return "SUV";
}

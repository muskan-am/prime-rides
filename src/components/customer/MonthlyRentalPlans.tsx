"use client";

export type PublicMonthlyPackage = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  duration: number;
  price: number;
  shortDescription?: string | null;
  description?: string | null;
  image?: string | null;
  features: string[];
  sortOrder?: number;
  isPopular?: boolean;
};

type MonthlyRentalPlansProps = {
  packages?: PublicMonthlyPackage[];
};

export default function MonthlyRentalPlans(_props?: MonthlyRentalPlansProps) {
  return null;
}
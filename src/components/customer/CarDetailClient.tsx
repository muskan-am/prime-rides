"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
  Check,
  Star,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  XCircle,
  Package,
  CalendarCheck,
  Wind,
} from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import CarDetailFAQ from "@/components/customer/CarDetailFAQ";


export type ImageItem = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export type FeatureItem = {
  id: string;
  name: string;
};

export type SpecificationItem = {
  id: string;
  name: string;
  value: string;
};

export type RentalPackageItem = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
};

export type MonthlyPlanItem = {
  id: string;
  name: string;
  months: number;
  price: number;
};

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  userName?: string;
};

export type DetailVehicle = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  hasAirConditioning?: boolean;
  basePrice: number;
  deposit: number;
  speedLimit: number | null;
  rentalTerms: string | null;
  isAvailable: boolean;
  primaryImage: string;
  images: ImageItem[];
  features: FeatureItem[];
  specifications: SpecificationItem[];
  rentalPackages: RentalPackageItem[];
  monthlyPlans: MonthlyPlanItem[];
  primaryLocation: string;
  averageRating: string | null;
  reviewCount: number;
  reviews: ReviewItem[];
};

type CarDetailClientProps = {
  vehicle: DetailVehicle;
  isLoggedIn: boolean;
  searchParamsState?: {
    location?: string;
    startDate?: string;
    endDate?: string;
    rentalPackageId?: string;
    monthlyPlanId?: string;
  };
};

export default function CarDetailClient({
  vehicle,
  isLoggedIn,
  searchParamsState = {},
}: CarDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(vehicle.primaryImage);

  const galleryImages =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [{ id: "primary", url: vehicle.primaryImage, isPrimary: true }];

  const currentImageIndex = galleryImages.findIndex(
    (img) => img.url === selectedImage
  );
  const activeImageIndex = currentImageIndex >= 0 ? currentImageIndex : 0;

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setSelectedImage(galleryImages[activeImageIndex - 1].url);
    }
  };

  const handleNextImage = () => {
    if (activeImageIndex < galleryImages.length - 1) {
      setSelectedImage(galleryImages[activeImageIndex + 1].url);
    }
  };

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    searchParamsState.rentalPackageId || null
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    searchParamsState.monthlyPlanId || null
  );

  // 1. Short-Term Special Rental Packages (< 30 days)
  const shortTermPackages = vehicle.rentalPackages.filter(
    (p) => p.duration < 30 && !p.name.toLowerCase().includes("month")
  );

  // 2. Long-Term Monthly Packages & Plans (>= 30 days or monthly subscriptions)
  const monthlyPackages = [
    ...vehicle.rentalPackages.filter(
      (p) => p.duration >= 30 || p.name.toLowerCase().includes("month")
    ),
  ];

  if (vehicle.monthlyPlans && vehicle.monthlyPlans.length > 0) {
    vehicle.monthlyPlans.forEach((plan) => {
      if (!monthlyPackages.some((p) => p.id === plan.id)) {
        monthlyPackages.push({
          id: plan.id,
          name: plan.name || `${plan.months} Month Subscription`,
          description: `Discounted long-term monthly rental (${plan.months} Month/s)`,
          duration: plan.months * 30,
          price: plan.price,
        });
      }
    });
  }

  // Ensure every vehicle has a Monthly Package option if missing
  if (monthlyPackages.length === 0) {
    const monthlyRate = Math.round(vehicle.basePrice * 30 * 0.70);
    monthlyPackages.push({
      id: `monthly-30-${vehicle.id}`,
      name: "1 Month (30 Days Package)",
      description: "Discounted monthly self-drive rental plan with full flexibility",
      duration: 30,
      price: monthlyRate,
    });
  }

  const displayPackages = [...shortTermPackages, ...monthlyPackages];

  // Active pricing calculation based on selected package/plan
  const selectedPackage = displayPackages.find(
    (p) => p.id === selectedPackageId
  );
  const selectedPlan = vehicle.monthlyPlans.find(
    (p) => p.id === selectedPlanId
  );

  let activePrice = vehicle.basePrice;
  let activePriceLabel = "/ day";

  if (selectedPackage) {
    activePrice = selectedPackage.price;
    activePriceLabel = selectedPackage.duration >= 30
      ? ` / 30 days pkg`
      : ` / ${selectedPackage.duration} days pkg`;
  } else if (selectedPlan) {
    activePrice = selectedPlan.price;
    activePriceLabel = ` / month`;
  }

  // Construct URL for Booking, preserving searchParams
  const bookingParams = new URLSearchParams();
  if (searchParamsState.startDate) {
    bookingParams.set("startDate", searchParamsState.startDate);
  }
  if (searchParamsState.endDate) {
    bookingParams.set("endDate", searchParamsState.endDate);
  }
  if (searchParamsState.location) {
    bookingParams.set("location", searchParamsState.location);
  }
  if (selectedPackageId) {
    bookingParams.set("rentalPackageId", selectedPackageId);
  }
  if (selectedPlanId) {
    bookingParams.set("monthlyPlanId", selectedPlanId);
  }

  const queryString = bookingParams.toString();
  const bookingUrl = `/booking/${vehicle.id}${
    queryString ? `?${queryString}` : ""
  }`;

  const bookingHref = isLoggedIn
    ? bookingUrl
    : `/login?callbackUrl=${encodeURIComponent(bookingUrl)}`;

  const fullName = `${vehicle.brand} ${vehicle.model}`;
  const variantText =
    vehicle.variant || `${vehicle.fuelType} ${vehicle.transmission}`;

  const rentalTermsList = vehicle.rentalTerms
    ? vehicle.rentalTerms.split("\n").filter((t) => t.trim().length > 0)
    : [
        "Valid original driving license (min 1 year old) is required.",
        "Minimum rental age is 21 years.",
        "Fuel is not included (return with same fuel level).",
        vehicle.speedLimit
          ? `Speed limit of ${vehicle.speedLimit} km/h strictly enforced.`
          : "Speed limit of 120 km/h strictly enforced.",
        "Vehicle must be returned at agreed location and time.",
      ];

  const documentsList = [
    "Original Driving License",
    "Aadhaar Card / Passport (ID Proof)",
    "DigiLocker Verification Supported",
  ];

  return (
    <div className="min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="pb-16 sm:pb-24">
        {/* Breadcrumb Header */}
        <section className="bg-slate-950 px-4 py-6 text-slate-300 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 min-w-0">
              <Link
                href="/cars"
                className="hover:text-white transition-colors flex items-center gap-1 shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All Cars
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-bold truncate max-w-[180px] sm:max-w-none">{fullName}</span>
            </div>

            {vehicle.averageRating && (
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/60 rounded-full px-3 py-1 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>
                  {vehicle.averageRating} ({vehicle.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-10">
          {/* Hero Section */}
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-12 items-start">
            {/* Left: Image Gallery & Included Features */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-xl group">
                <img
                  src={selectedImage}
                  alt={fullName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Image Counter Badge (Top Right) */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                    <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] sm:text-xs font-extrabold text-white border border-white/20 shadow-md">
                      {activeImageIndex + 1} / {galleryImages.length}
                    </span>
                  </div>
                )}

                {/* Left & Right Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      disabled={activeImageIndex === 0}
                      aria-label="Previous image"
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-slate-900 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      disabled={activeImageIndex === galleryImages.length - 1}
                      aria-label="Next image"
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-slate-900 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails list if multiple images exist */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full max-w-full">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImage(img.url)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative h-14 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                        selectedImage === img.url
                          ? "border-blue-600 ring-2 ring-blue-400 opacity-100"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Vehicle Included Features */}
              {vehicle.features.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm">
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>Vehicle Features & Equipment</span>
                  </h3>

                  <div className="mt-4 sm:mt-6 grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    {vehicle.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 sm:px-3.5 sm:py-2.5 border border-slate-100"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                          ✓
                        </span>
                        <span className="text-xs font-bold text-slate-700 break-words">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents & Verification */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm">
                <h3 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-3 sm:mb-4">
                  <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Required Verification Documents</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {documentsList.map((doc) => (
                    <div key={doc} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 break-words">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking Summary Sticky Sidebar */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
                <div>
                  <div className="mb-1">
                    <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-blue-600">
                      {variantText}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {fullName}
                  </h1>
                </div>

                {/* 5 Key Specification Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 text-center shadow-xs transition-all hover:border-blue-300 hover:shadow-md min-w-0">
                    <Fuel className="mx-auto h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Fuel Type</p>
                    <p className="mt-0.5 text-xs font-extrabold text-slate-900 truncate">
                      {vehicle.fuelType}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 text-center shadow-xs transition-all hover:border-blue-300 hover:shadow-md min-w-0">
                    <Gauge className="mx-auto h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Transmission</p>
                    <p className="mt-0.5 text-xs font-extrabold text-slate-900 truncate">
                      {vehicle.transmission}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 text-center shadow-xs transition-all hover:border-blue-300 hover:shadow-md min-w-0">
                    <Users className="mx-auto h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Seating</p>
                    <p className="mt-0.5 text-xs font-extrabold text-slate-900 truncate">
                      {vehicle.seatingCapacity} Seats
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 text-center shadow-xs transition-all hover:border-blue-300 hover:shadow-md min-w-0">
                    <Wind className="mx-auto h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">AC / Climate</p>
                    <p className="mt-0.5 text-xs font-extrabold text-slate-900 truncate">
                      {vehicle.hasAirConditioning !== false ? "AC" : "Non-AC"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 text-center shadow-xs transition-all hover:border-blue-300 hover:shadow-md col-span-2 sm:col-span-2 min-w-0">
                    <ShieldCheck className="mx-auto h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Speed Limit</p>
                    <p className="mt-0.5 text-xs font-extrabold text-slate-900 truncate">
                      {vehicle.speedLimit ? `${vehicle.speedLimit} km/h` : "120 km/h"}
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="rounded-2xl bg-slate-900 p-3.5 sm:p-5 text-white grid grid-cols-2 gap-2 items-center shadow-md min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block uppercase tracking-wider truncate">
                      {selectedPackage
                        ? selectedPackage.name
                        : selectedPlan
                        ? selectedPlan.name
                        : "Base Daily Rate"}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
                      <span className="text-lg sm:text-3xl font-black text-white">
                        ₹{activePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                        {activePriceLabel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right min-w-0 border-l border-slate-800 pl-2.5">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
                      Security Deposit
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-blue-400 block mt-0.5 truncate">
                      ₹{vehicle.deposit.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Status Callout (Only if Unavailable) */}
                {!vehicle.isAvailable && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-rose-900">
                        Currently Unavailable for Booking
                      </p>
                      <p className="text-xs font-semibold text-rose-700">
                        Vehicle is under maintenance or temporarily reserved
                      </p>
                    </div>
                  </div>
                )}

                {/* Book CTA */}
                {vehicle.isAvailable ? (
                  <Link
                    href={bookingHref}
                    className="flex h-12 sm:h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-900 to-blue-600 text-xs sm:text-base font-extrabold text-white shadow-xl transition-all hover:scale-[1.01] hover:shadow-blue-500/25 active:scale-[0.99]"
                  >
                    <span>Book This Car Now</span>
                    <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex h-12 sm:h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-400 text-xs sm:text-base font-extrabold text-white cursor-not-allowed opacity-80"
                  >
                    <span>Vehicle Currently Unavailable</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Matrix if specifications exist in DB */}
          {vehicle.specifications.length > 0 && (
            <div className="mt-6 sm:mt-12 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm">
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mb-3 sm:mb-6">
                Technical Specifications
              </h3>
              <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {vehicle.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between items-center rounded-xl bg-slate-50 p-3 sm:p-3.5 border border-slate-100 text-xs gap-2 min-w-0 w-full overflow-hidden"
                  >
                    <span className="font-semibold text-slate-500 shrink-0 text-left">
                      {spec.name}
                    </span>
                    <span className="font-extrabold text-slate-900 text-right truncate min-w-0">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages Side-By-Side Grid */}
          {(shortTermPackages.length > 0 || monthlyPackages.length > 0) && (
            <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 items-start">
              {/* Left Column: Special Rental Packages */}
              {shortTermPackages.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm space-y-4 h-full">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Special Rental Packages</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      Short-term discounted daily rental packages
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {shortTermPackages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setSelectedPackageId(isSelected ? null : pkg.id);
                            setSelectedPlanId(null);
                          }}
                          className={`flex flex-wrap cursor-pointer items-center justify-between gap-2 rounded-2xl p-3.5 sm:p-4 transition-all border ${
                            isSelected
                              ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 shadow-sm"
                              : "bg-slate-50 border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {pkg.name}
                            </p>
                            <span className="inline-block text-[11px] sm:text-xs font-bold text-blue-600">
                              {pkg.duration} Day(s) Package
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base sm:text-lg font-black text-slate-900 block">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-blue-600">
                              {isSelected ? "Selected ✓" : "Click to select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Right Column: Monthly Subscription Plans */}
              {monthlyPackages.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm space-y-4 h-full">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Monthly Subscription Plans</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      Long-term discounted monthly subscription options
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {monthlyPackages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setSelectedPackageId(isSelected ? null : pkg.id);
                            setSelectedPlanId(null);
                          }}
                          className={`flex flex-wrap cursor-pointer items-center justify-between gap-2 rounded-2xl p-3.5 sm:p-4 transition-all border ${
                            isSelected
                              ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 shadow-sm"
                              : "bg-slate-50 border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {pkg.name}
                            </p>
                            <span className="inline-block text-[11px] sm:text-xs font-bold text-blue-600">
                              {pkg.duration} Day(s) Package
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base sm:text-lg font-black text-slate-900 block">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-blue-600">
                              {isSelected ? "Selected ✓" : "Click to select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real Customer Reviews Section */}
          {vehicle.reviews.length > 0 && (
            <div className="mt-8 sm:mt-12 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
                <span>Customer Reviews ({vehicle.reviewCount})</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {vehicle.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {rev.userName || "Verified Customer"}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Car Details FAQ Accordion */}
          <CarDetailFAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
}

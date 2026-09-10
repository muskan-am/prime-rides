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
} from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

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

  // Active pricing calculation based on selected package/plan
  const selectedPackage = vehicle.rentalPackages.find(
    (p) => p.id === selectedPackageId
  );
  const selectedPlan = vehicle.monthlyPlans.find(
    (p) => p.id === selectedPlanId
  );

  let activePrice = vehicle.basePrice;
  let activePriceLabel = "/ day";

  if (selectedPackage) {
    activePrice = selectedPackage.price;
    activePriceLabel = ` / ${selectedPackage.duration} days pkg`;
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pb-24">
        {/* Breadcrumb Header */}
        <section className="bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link
                href="/cars"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All Cars
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-bold">{fullName}</span>
            </div>

            {vehicle.averageRating && (
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/60 rounded-full px-3 py-1">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>
                  {vehicle.averageRating} ({vehicle.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Left: Image Gallery & Specs */}
            <div className="lg:col-span-7 space-y-8">
              {/* Image Preview */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-xl group">
                <img
                  src={selectedImage}
                  alt={fullName}
                  className="h-[400px] sm:h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Location Badge (Top Left) */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/20">
                    📍 {vehicle.primaryLocation} Hub
                  </span>
                </div>

                {/* Image Counter Badge (Top Right) */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold text-white border border-white/20">
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
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-slate-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-slate-950/75 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6 text-white" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      disabled={activeImageIndex === galleryImages.length - 1}
                      aria-label="Next image"
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-slate-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-slate-950/75 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails list if multiple images exist */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImage(img.url)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
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

              {/* Specification Grid Pills */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Fuel className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">
                    Fuel Type
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {vehicle.fuelType}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Gauge className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">
                    Transmission
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {vehicle.transmission}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Users className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">
                    Seating
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {vehicle.seatingCapacity} People
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <ShieldCheck className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">
                    Speed Limit
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {vehicle.speedLimit ? `${vehicle.speedLimit} km/h` : "120 km/h"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Booking Summary Sticky Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
                    {variantText}
                  </span>
                  <h1 className="text-3xl font-black text-slate-900 mt-1">
                    {fullName}
                  </h1>
                </div>

                {/* Price Display */}
                <div className="rounded-2xl bg-slate-900 p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      {selectedPackage
                        ? selectedPackage.name
                        : selectedPlan
                        ? selectedPlan.name
                        : "Base Daily Rate"}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">
                        ₹{activePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {activePriceLabel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Security Deposit
                    </span>
                    <span className="text-sm font-bold text-blue-400">
                      ₹{vehicle.deposit.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Status Callout */}
                {vehicle.isAvailable ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">
                        Available for Immediate Self-Drive Booking
                      </p>
                      <p className="text-xs font-semibold text-emerald-700">
                        Instant confirmation in {vehicle.primaryLocation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 flex items-center gap-3">
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
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-900 to-blue-600 text-base font-extrabold text-white shadow-xl transition-all hover:scale-[1.01] hover:shadow-blue-500/25 active:scale-[0.99]"
                  >
                    <span>Book This Car Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-400 text-base font-extrabold text-white cursor-not-allowed opacity-80"
                  >
                    <span>Vehicle Currently Unavailable</span>
                  </button>
                )}

                <p className="text-center text-xs font-semibold text-slate-500">
                  🔒 Free cancellation up to 24h before pickup
                </p>
              </div>
            </div>
          </div>

          {/* Rental Packages & Monthly Plans Sections */}
          {(vehicle.rentalPackages.length > 0 || vehicle.monthlyPlans.length > 0) && (
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {vehicle.rentalPackages.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Special Rental Packages</span>
                  </h3>

                  <div className="grid gap-3">
                    {vehicle.rentalPackages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setSelectedPackageId(isSelected ? null : pkg.id);
                            setSelectedPlanId(null);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border ${
                            isSelected
                              ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40"
                              : "bg-slate-50 border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {pkg.name}
                            </p>
                            {pkg.description && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {pkg.description}
                              </p>
                            )}
                            <span className="inline-block mt-1 text-xs font-bold text-blue-600">
                              {pkg.duration} Day(s) Package
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <span className="block text-[10px] font-bold uppercase text-blue-600">
                              {isSelected ? "Selected ✓" : "Click to select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {vehicle.monthlyPlans.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                    <span>Monthly Subscription Plans</span>
                  </h3>

                  <div className="grid gap-3">
                    {vehicle.monthlyPlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => {
                            setSelectedPlanId(isSelected ? null : plan.id);
                            setSelectedPackageId(null);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border ${
                            isSelected
                              ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40"
                              : "bg-slate-50 border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {plan.name}
                            </p>
                            <span className="inline-block mt-1 text-xs font-bold text-blue-600">
                              {plan.months} Month(s) Duration
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">
                              ₹{plan.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              / month
                            </span>
                            <span className="block text-[10px] font-bold uppercase text-blue-600 mt-0.5">
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

          {/* Specifications Matrix if specifications exist in DB */}
          {vehicle.specifications.length > 0 && (
            <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">
                Technical Specifications
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicle.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-500">
                      {spec.name}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Grid: Features & Documents */}
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {/* Included Features */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                <span>Vehicle Features & Equipment</span>
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents & Rules */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Required Verification Documents</span>
                </h3>

                <ul className="mt-4 space-y-2.5 text-xs font-bold text-slate-700">
                  {documentsList.map((doc) => (
                    <li key={doc} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-sm font-bold text-slate-900">
                  Rental Terms
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {rentalTermsList.map((rule, idx) => (
                    <li key={idx}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Real Customer Reviews Section if present in DB */}
          {vehicle.reviews.length > 0 && (
            <div className="mt-16 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span>Customer Reviews ({vehicle.reviewCount})</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {vehicle.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {rev.userName || "Verified Customer"}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

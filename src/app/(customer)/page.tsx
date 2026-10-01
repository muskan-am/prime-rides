import Link from "next/link";
import Image from "next/image";
import { Car, ShieldCheck, Headphones, MapPin, Tag } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import CouponTicker from "@/components/customer/CouponTicker";
import Footer from "@/components/customer/Footer";
import SearchBox, { SearchLocationItem } from "@/components/customer/SearchBox";
import FeaturedCars, { FeaturedVehicleItem } from "@/components/customer/FeaturedCars";
import PlatformStats from "@/components/customer/PlatformStats";
import OffersSection from "@/components/customer/OffersSection";
import WhyChooseUs from "@/components/customer/WhyChooseUs";
import HowToBookRide from "@/components/customer/HowToBookRide";
import FAQSection from "@/components/customer/FAQSection";
import ContactSection from "@/components/customer/ContactSection";
import ExploringCities, { ExploringCityItem } from "@/components/customer/ExploringCities";
import CustomerReviewsSection from "@/components/customer/CustomerReviewsSection";
import { prisma } from "@/lib/prisma";
import {
  calculateApprovedReviews,
  formatFuelType,
  formatTransmission,
  formatVehicleCategory,
} from "@/lib/rating";

export const revalidate = 0;

export default async function Home() {
  let featuredVehicles: FeaturedVehicleItem[] = [];
  let locations: SearchLocationItem[] = [];
  let coupons: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minBookingValue: number | null;
    maxDiscount: number | null;
    validUntil: Date;
  }[] = [];
  let platformStats: {
    id: string;
    label: string;
    valueNumber: number;
    prefix: string;
    suffix: string;
  }[] = [];
  let exploringCities: ExploringCityItem[] = [];

  let customerReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    user?: { name: string | null; image?: string | null } | null;
    vehicle?: { brand: string; model: string } | null;
  }> = [];

  let isTickerEnabled = true;

  try {
    const [
      dbVehicles,
      dbLocations,
      dbCoupons,
      dbStats,
      dbTickerSetting,
      dbExploringCities,
      dbReviews,
    ] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          availabilityStatus: "AVAILABLE",
          maintenanceStatus: "GOOD",
        },
        include: {
          images: {
            select: { url: true, isPrimary: true },
            orderBy: { sortOrder: "asc" },
          },
          inventory: {
            where: { isActive: true },
            select: {
              isActive: true,
              location: {
                select: { name: true },
              },
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
          specifications: {
            select: { name: true, value: true },
          },
        },
        orderBy: [{ searchPriority: "desc" }, { createdAt: "desc" }],
        take: 24,
      }),
      prisma.location.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.coupon.findMany({
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          discountType: true,
          discountValue: true,
          minBookingValue: true,
          maxDiscount: true,
          validUntil: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.platformStat.findMany({
        where: { isActive: true },
        select: {
          id: true,
          label: true,
          valueNumber: true,
          prefix: true,
          suffix: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.systemSetting.findUnique({
        where: { key: "coupon_ticker_enabled" },
        select: { value: true },
      }),
      prisma.exploringCity.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          subtitle: true,
          image: true,
          locationQuery: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          rating: true,
          comment: true,
          user: { select: { name: true, image: true } },
          vehicle: { select: { brand: true, model: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

    customerReviews = dbReviews;

    isTickerEnabled = dbTickerSetting ? dbTickerSetting.value === "true" : true;

    locations = dbLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
    }));

    coupons = dbCoupons.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minBookingValue: c.minBookingValue ? Number(c.minBookingValue) : null,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      validUntil: c.validUntil,
    }));

    platformStats = dbStats.map((s) => ({
      id: s.id,
      label: s.label,
      valueNumber: s.valueNumber,
      prefix: s.prefix,
      suffix: s.suffix,
    }));

    exploringCities = dbExploringCities.map((ec) => ({
      id: ec.id,
      name: ec.name,
      subtitle: ec.subtitle,
      image: ec.image,
      locationQuery: ec.locationQuery,
    }));

    featuredVehicles = dbVehicles.map((v) => {
      const primaryLocation =
        v.inventory?.find((inv) => inv.isActive && inv.location?.name)?.location?.name || "Main Hub";

      const primaryImg =
        v.primaryImage ||
        v.images.find((img) => img.isPrimary)?.url ||
        v.images[0]?.url ||
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80";

      const allImages = Array.from(
        new Set([
          primaryImg,
          ...(v.images?.map((img) => img.url) || [])
        ].filter(Boolean))
      );

      const { averageRating, reviewCount } = calculateApprovedReviews(v.reviews);

      const yearSpec = v.specifications?.find((s) =>
        s.name.toLowerCase().includes("year")
      )?.value;
      const modelYear = yearSpec ? parseInt(yearSpec, 10) : 2023;

      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        variant: v.variant || "",
        type: v.vehicleType || formatVehicleCategory(v.variant, v.model, v.brand),
        vehicleType: v.vehicleType || formatVehicleCategory(v.variant, v.model, v.brand),
        fuel: formatFuelType(v.fuelType),
        transmission: formatTransmission(v.transmission),
        seats: v.seatingCapacity || 5,
        hasAirConditioning: v.hasAirConditioning !== false,
        price: Number(v.basePrice),
        deposit: Number(v.deposit),
        location: primaryLocation,
        image: primaryImg,
        images: allImages,
        badge: v.variant || (v.searchPriority > 0 ? "Popular" : "Verified"),
        rating: averageRating,
        reviewCount,
        modelYear,
      };
    });
  } catch (error) {
    console.error("Failed to query homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Hero Section with Scenic Car Background & Transparent Navbar */}
      <div className="relative overflow-hidden bg-black text-white min-h-[560px] sm:min-h-[600px] lg:min-h-[640px]">
        {/* Background Image / Video */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/car-hero.png"
            alt="Prime Rides Luxury Car"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center] sm:object-center"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/car-hero.png"
            className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-center -z-10"
            aria-hidden="true"
          >
            <source src="/car.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Adaptive Contrast Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent z-[1] pointer-events-none" />

        {/* Top Promotional Ticker & Transparent Navbar */}
        <div className="relative z-20">
          <CouponTicker coupons={isTickerEnabled ? coupons : []} />
          <Navbar transparent={true} />
        </div>

        {/* Hero Content Section */}
        <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 sm:pt-12 lg:pt-16 pb-24 sm:pb-28 lg:pb-32 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left space-y-3.5 sm:space-y-4">
            {/* Pre-heading Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs lg:text-sm font-bold tracking-wider text-slate-200 uppercase">
                Self-Drive Car Rental
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.05]">
              Your Ride.
              <br />
              <span className="text-[#38BDF8]">
                Your Freedom.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-200 font-normal max-w-xl leading-relaxed">
              Premium self-drive cars for every journey across Delhi NCR, Goa, and Bangalore.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1.5 sm:pt-3">
              <a
                href="#search-section"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-base font-bold text-white shadow-xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
              >
                <Car className="h-4 w-4 shrink-0" />
                <span>Find Your Ride</span>
                <span className="text-sm sm:text-base leading-none">→</span>
              </a>

              <Link
                href="/cars"
                className="inline-flex items-center rounded-full border border-white/30 bg-black/25 hover:bg-black/40 px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:border-white shadow-sm active:scale-95"
              >
                <span>Explore Cars</span>
              </Link>
            </div>

            {/* Feature Badges Grid (Responsive 2-cols on mobile, row on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-5 lg:gap-6 pt-3 sm:pt-4 text-xs sm:text-sm font-medium text-white">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Verified Cars</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Tag className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Transparent Pricing</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Flexible Pickup</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Headphones className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main>
        {/* Floating Search Section */}
        <section id="search-section" className="relative -mt-16 px-4 z-20 sm:px-6 lg:px-8">
          <SearchBox locations={locations} />
        </section>

        {/* Fleet Discovery Section */}
        <FeaturedCars vehicles={featuredVehicles} />

        {/* Platform Stats Section */}
        <PlatformStats stats={platformStats} />

        {/* Why Choose Prime Rides */}
        <WhyChooseUs />

        {/* How to Book a Ride? */}
        <HowToBookRide />

         {/* Cities to Explore in India Carousel */}
        <ExploringCities cities={exploringCities} />

       
        {/* Exclusive Offers */}
        <OffersSection coupons={coupons} />

        {/* Customer Reviews & Testimonials Section */}
        <CustomerReviewsSection reviews={customerReviews} />

        {/* Contact & Enquiry */}
        <ContactSection />

        {/* FAQ Section */}
        <FAQSection />

      </main>

      <Footer />
    </div>
  );
}
import Link from "next/link";
import { Car, ShieldCheck, Headphones, MapPin, Tag } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import CouponTicker from "@/components/customer/CouponTicker";
import Footer from "@/components/customer/Footer";
import SearchBox, { SearchLocationItem } from "@/components/customer/SearchBox";
import FeaturedCars, { FeaturedVehicleItem } from "@/components/customer/FeaturedCars";
import PlatformStats from "@/components/customer/PlatformStats";
import PopularLocations from "@/components/customer/PopularLocations";
import OffersSection from "@/components/customer/OffersSection";
import WhyChooseUs from "@/components/customer/WhyChooseUs";
import HowToBookRide from "@/components/customer/HowToBookRide";
import FAQSection from "@/components/customer/FAQSection";
import ContactSection from "@/components/customer/ContactSection";
import ExploringCities, { ExploringCityItem } from "@/components/customer/ExploringCities";
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

  let isTickerEnabled = true;

  try {
    const [dbVehicles, dbLocations, dbCoupons, dbStats, dbTickerSetting, dbExploringCities] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          availabilityStatus: "AVAILABLE",
          maintenanceStatus: "GOOD",
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          inventory: {
            where: { isActive: true },
            include: { location: true },
          },
          reviews: {
            select: { rating: true },
          },
          specifications: true,
        },
        orderBy: [{ searchPriority: "desc" }, { createdAt: "desc" }],
        take: 24,
      }),
      prisma.location.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.coupon.findMany({
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.platformStat.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.systemSetting.findUnique({
        where: { key: "coupon_ticker_enabled" },
      }),
      prisma.exploringCity.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

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

      const allImages = v.images && v.images.length > 0 ? v.images.map((img) => img.url) : [primaryImg];

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
      <div className="relative overflow-hidden bg-black text-white">
        {/* Background Image / Video */}
        <div className="absolute inset-0 z-0">
          <img
            src="/car-hero.png"
            alt="Prime Rides Luxury Car"
            className="h-full w-full object-cover object-center"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center -z-10"
            aria-hidden="true"
          >
            <source src="/car.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Subtle Neutral Gradient on Left for High Text Legibility */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 lg:w-3/5 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-[1] pointer-events-none" />

        {/* Top Promotional Ticker & Transparent Navbar */}
        <div className="relative z-20">
          <CouponTicker coupons={isTickerEnabled ? coupons : []} />
          <Navbar transparent={true} />
        </div>

        {/* Hero Content Section */}
        <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-4 pb-20 sm:pt-6 sm:pb-24 lg:pb-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left space-y-3.5 sm:space-y-4">
            {/* Pre-heading Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase">
                Self-Drive Car Rental
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Your Ride.
              <br />
              <span className="text-[#38BDF8]">
                Your Freedom.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-normal max-w-xl leading-relaxed">
              Premium self-drive cars for every journey across Delhi NCR, Goa, and Bangalore.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 sm:pt-3">
              <a
                href="#search-section"
                className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 hover:bg-blue-500 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
              >
                <Car className="h-4 w-4 shrink-0" />
                <span>Find Your Ride</span>
                <span className="text-base leading-none">→</span>
              </a>

              <Link
                href="/cars"
                className="inline-flex items-center rounded-full border border-white/30 bg-black/20 hover:bg-black/35 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:border-white shadow-sm active:scale-95"
              >
                <span>Explore Cars</span>
              </Link>
            </div>

            {/* Feature Badges Row (Exact Reference UI) */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs sm:text-sm font-medium text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Verified Cars</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Transparent Pricing</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <span>Flexible Pickup</span>
              </div>

              <div className="flex items-center gap-2">
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


        {/* Contact & Enquiry */}
        <ContactSection />

        {/* FAQ Section */}
        <FAQSection />

      </main>

      <Footer />
    </div>
  );
}
import Link from "next/link";
import { Car, ShieldCheck, Tag, Headphones, Compass, KeyRound } from "lucide-react";
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
        },
        orderBy: [{ searchPriority: "desc" }, { createdAt: "desc" }],
        take: 20,
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
      const fuel = v.fuelType
        ? v.fuelType.toUpperCase() === "PETROL"
          ? "Petrol"
          : v.fuelType.toUpperCase() === "DIESEL"
          ? "Diesel"
          : v.fuelType.charAt(0).toUpperCase() + v.fuelType.slice(1).toLowerCase()
        : "Petrol";

      const transmission = v.transmission
        ? v.transmission.toUpperCase() === "AUTOMATIC"
          ? "Automatic"
          : v.transmission.toUpperCase() === "MANUAL"
          ? "Manual"
          : v.transmission.charAt(0).toUpperCase() + v.transmission.slice(1).toLowerCase()
        : "Automatic";

      const primaryImg =
        v.primaryImage ||
        v.images.find((img) => img.isPrimary)?.url ||
        v.images[0]?.url ||
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80";

      const allImages = v.images && v.images.length > 0 ? v.images.map((img) => img.url) : [primaryImg];

      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        variant: v.variant || "",
        type: v.variant || "SUV",
        fuel,
        transmission,
        seats: v.seatingCapacity || 5,
        hasAirConditioning: v.hasAirConditioning !== false,
        price: Number(v.basePrice),
        image: primaryImg,
        images: allImages,
        badge: v.variant || (v.searchPriority > 0 ? "Popular" : "Verified"),
      };
    });
  } catch (error) {
    console.error("Failed to query homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <CouponTicker coupons={isTickerEnabled ? coupons : []} />

      <main>
        {/* Energetic Automotive Hero Section with Background Video */}
        <section className="relative overflow-hidden bg-[#0A1128] text-white">
          {/* Background Highway Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none z-0"
            aria-hidden="true"
          >
            <source src="/car.mp4" type="video/mp4" />
          </video>

          {/* Clean Subtle Dark Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 pointer-events-none z-1" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-6">
              {/* Headline */}
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-none drop-shadow-md">
                Your Ride.{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                  Your Freedom.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="mx-auto max-w-2xl text-lg text-slate-200 sm:text-xl font-normal leading-relaxed drop-shadow-sm">
                Premium self-drive cars for every journey across Delhi NCR, Goa, and Bangalore. Book your car. Hit the road. Enjoy the journey.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="#search-section"
                  className="flex h-13 items-center gap-2.5 rounded-2xl bg-blue-600 px-7 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/50 hover:scale-[1.02]"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Find Your Ride</span>
                </a>

                <Link
                  href="/cars"
                  className="flex h-13 items-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-900/80 px-7 text-sm font-bold text-slate-200 backdrop-blur-md transition-all hover:bg-slate-800 hover:border-slate-600 hover:text-white"
                >
                  <Compass className="h-4 w-4 text-blue-400" />
                  <span>Explore Cars</span>
                </Link>
              </div>

              {/* Text Feature Row */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 max-w-4xl mx-auto text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Trusted Service</span>
                </div>

                <span className="hidden sm:inline text-slate-600 font-light">|</span>

                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Wide Car Selection</span>
                </div>

                <span className="hidden sm:inline text-slate-600 font-light">|</span>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Best Prices</span>
                </div>

                <span className="hidden sm:inline text-slate-600 font-light">|</span>

                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
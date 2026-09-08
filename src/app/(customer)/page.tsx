import Link from "next/link";
import { Car, ShieldCheck, Sparkles, Compass, KeyRound, MapPin } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import SearchBox from "@/components/customer/SearchBox";
import FeaturedCars from "@/components/customer/FeaturedCars";
import PopularLocations from "@/components/customer/PopularLocations";
import MonthlyRentalPlans from "@/components/customer/MonthlyRentalPlans";
import OffersSection from "@/components/customer/OffersSection";
import WhyChooseUs from "@/components/customer/WhyChooseUs";
import FAQSection from "@/components/customer/FAQSection";
import ContactSection from "@/components/customer/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

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

          {/* Clean Subtle Dark Overlay for Text Contrast (NO Blue Tint / NO Blue Shadow) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 pointer-events-none z-1" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-6">



              {/* Headline */}
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-none drop-shadow-md">
                Your Ride. <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">Your Freedom.</span>
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

              {/* Quick Feature Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8 text-left sm:grid-cols-4 max-w-3xl mx-auto border-t border-slate-700/60 backdrop-blur-sm rounded-xl p-4 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-white">500+ Fleet</p>
                    <p className="text-xs text-slate-300">Verified Cars</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-white">3 Major Hubs</p>
                    <p className="text-xs text-slate-300">Delhi, Goa, BLR</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-white">Zero Deposit</p>
                    <p className="text-xs text-slate-300">Verified Deals</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-white">24/7 Service</p>
                    <p className="text-xs text-slate-300">Roadside Assist</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Floating Search Section */}
        <section id="search-section" className="relative -mt-16 px-4 z-20 sm:px-6 lg:px-8">
          <SearchBox />
        </section>

        {/* Fleet Discovery Section */}
        <FeaturedCars />

        {/* Popular Locations */}
        <PopularLocations />

        {/* Monthly Subscription Plans */}
        <MonthlyRentalPlans />

        {/* Exclusive Offers */}
        <OffersSection />

        {/* Why Choose Prime Rides */}
        <WhyChooseUs />

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact & Enquiry */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
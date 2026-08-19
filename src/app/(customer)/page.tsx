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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Prime Rides
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Self-Drive Car Rental Made Simple
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Find your perfect car, choose your rental package,
              and book your ride across Delhi, Goa and Bangalore.
            </p>

          </div>

          {/* Search Box */}
          <div className="mt-12">
            <SearchBox />
          </div>
        </section>

        {/* Featured Cars */}
        <FeaturedCars />

        <PopularLocations/>

        <MonthlyRentalPlans/>

        <OffersSection/>

        <WhyChooseUs/>

        <FAQSection/>

        <ContactSection/>
        
      </main>

      <Footer />
    </div>
  );
}
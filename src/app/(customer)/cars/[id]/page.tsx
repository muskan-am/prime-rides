import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";
import { Fuel, Gauge, Users, MapPin, ShieldCheck, Check, Star, ArrowRight, ArrowLeft, FileText, Lock } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

type Car = {
  id: string;
  name: string;
  variant: string;
  fuel: string;
  transmission: string;
  seats: number;
  price: number;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  luggage: string;
  ac: boolean;
  features: string[];
  rentalRules: string[];
  documents: string[];
  deposit: number;
};

const cars: Car[] = [
  {
    id: "hyundai-creta",
    name: "Hyundai Creta",
    variant: "SX Automatic",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    location: "Delhi",
    rating: 4.8,
    reviews: 124,
    luggage: "2 Bags",
    ac: true,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Automatic Transmission",
      "Air Conditioning",
      "Bluetooth Connectivity",
      "Android Auto & Apple CarPlay",
      "GPS Navigation",
      "Rear Parking Camera",
      "Fast USB Charging Ports",
      "Cruise Control",
    ],
    rentalRules: [
      "Valid original driving license (min 1 year old) is required.",
      "Minimum rental age is 21 years.",
      "Fuel is not included (return with same fuel level).",
      "Speed limit of 120 km/h strictly enforced.",
      "Vehicle must be returned at agreed location and time.",
    ],
    documents: [
      "Original Driving License",
      "Aadhaar Card / Passport (ID Proof)",
      "DigiLocker Verification Supported",
    ],
    deposit: 5000,
  },
  {
    id: "kia-seltos",
    name: "Kia Seltos",
    variant: "HTX Turbo",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    location: "Goa",
    rating: 4.7,
    reviews: 98,
    luggage: "2 Bags",
    ac: true,
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Automatic Transmission",
      "Sunroof",
      "Bluetooth & Touchscreen Infotainment",
      "Android Auto & Apple CarPlay",
      "GPS Navigation",
      "Reverse Parking Sensors",
      "Wireless Charger",
    ],
    rentalRules: [
      "Valid original driving license is required.",
      "Minimum rental age is 21 years.",
      "Fuel is not included.",
      "Vehicle must be returned on time.",
    ],
    documents: [
      "Valid Driving License",
      "Government ID Proof",
      "Address Proof",
    ],
    deposit: 5000,
  },
  {
    id: "mahindra-thar",
    name: "Mahindra Thar 4x4",
    variant: "LX Hard Top",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    location: "Bangalore",
    rating: 4.9,
    reviews: 156,
    luggage: "2 Bags",
    ac: true,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
    features: [
      "4x4 All-Terrain Drivetrain",
      "Manual 6-Speed Transmission",
      "Air Conditioning",
      "Bluetooth Audio System",
      "Touchscreen Display",
      "Off-road Roll Cage Safety",
    ],
    rentalRules: [
      "Valid original driving license is required.",
      "Minimum rental age is 21 years.",
      "Fuel is not included.",
      "Strict no-race and off-road safety policy.",
    ],
    documents: [
      "Valid Driving License",
      "Government ID Proof",
      "Address Proof",
    ],
    deposit: 5000,
  },
];

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const car = cars.find((item) => item.id === id) || cars[0];

  const bookingUrl = `/booking?car=${car.id}`;
  const bookingHref = session?.user
    ? bookingUrl
    : `/login?callbackUrl=${encodeURIComponent(bookingUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pb-24">
        {/* Breadcrumb Header */}
        <section className="bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/cars" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> All Cars
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-bold">{car.name}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/60 rounded-full px-3 py-1">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{car.rating} ({car.reviews} reviews)</span>
            </div>
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
                  src={car.image}
                  alt={car.name}
                  className="h-[400px] sm:h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/20">
                    📍 {car.location} Hub
                  </span>
                </div>
              </div>

              {/* Specification Grid Pills */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Fuel className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">Fuel Type</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{car.fuel}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Gauge className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">Transmission</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{car.transmission}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Users className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">Seating</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{car.seats} People</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <ShieldCheck className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">Luggage</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{car.luggage}</p>
                </div>
              </div>

            </div>

            {/* Right: Booking Summary Sticky Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
                
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{car.variant}</span>
                  <h1 className="text-3xl font-black text-slate-900 mt-1">{car.name}</h1>
                </div>

                {/* Price Display */}
                <div className="rounded-2xl bg-slate-900 p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Base Daily Rate</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">₹{car.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs font-semibold text-slate-400"> / day</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Security Deposit</span>
                    <span className="text-sm font-bold text-blue-400">₹{car.deposit.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Status Callout */}
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-extrabold text-emerald-900">Available for Immediate Self-Drive Booking</p>
                    <p className="text-xs font-semibold text-emerald-700">Instant confirmation in {car.location}</p>
                  </div>
                </div>

                {/* Book CTA */}
                <Link
                  href={bookingHref}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-900 to-blue-600 text-base font-extrabold text-white shadow-xl transition-all hover:scale-[1.01] hover:shadow-blue-500/25 active:scale-[0.99]"
                >
                  <span>Book This Car Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <p className="text-center text-xs font-semibold text-slate-500">
                  🔒 Free cancellation up to 24h before pickup
                </p>

              </div>
            </div>

          </div>

          {/* Bottom Grid: Features & Documents */}
          <div className="mt-16 grid gap-10 md:grid-cols-2">

            {/* Included Features */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                <span>Vehicle Features & Equipment</span>
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {car.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">✓</span>
                    <span className="text-xs font-bold text-slate-700">{feature}</span>
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
                  {car.documents.map((doc) => (
                    <li key={doc} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-sm font-bold text-slate-900">Rental Terms</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {car.rentalRules.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
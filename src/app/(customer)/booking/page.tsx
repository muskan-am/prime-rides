"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
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
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
  {
    id: "kia-seltos",
    name: "Kia Seltos",
    variant: "HTX Automatic",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    location: "Goa",
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
  {
    id: "mahindra-thar",
    name: "Mahindra Thar",
    variant: "LX 4x4 Hard Top",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
];

function BookingContent() {
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const searchParams = useSearchParams();

  const carId = searchParams.get("car") || "hyundai-creta";
  const car = cars.find((item) => item.id === carId) || cars[0];

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  const [pickupLocation, setPickupLocation] = useState(car?.location || "Delhi");
  const [returnLocation, setReturnLocation] = useState(car?.location || "Delhi");

  const [error, setError] = useState("");
  const [pickupMethod, setPickupMethod] = useState("office");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const difference = end.getTime() - start.getTime();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [pickupDate, returnDate]);

  const rentalAmount = (rentalDays || 1) * (car?.price || 0);
  const tax = Math.round(rentalAmount * 0.18);

  const deliveryCharges: Record<string, number> = {
    Delhi: 500,
    Goa: 700,
    Bangalore: 600,
  };

  const deliveryCharge = pickupMethod === "delivery" ? deliveryCharges[pickupLocation] || 500 : 0;
  const totalBeforeDiscount = rentalAmount + tax + deliveryCharge;
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - couponDiscount);
  const finalAmount = totalAfterDiscount + (car?.deposit || 0);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Please enter a valid promo code.");
      setCouponDiscount(0);
      return;
    }
    if (code === "PRIME10") {
      const discount = Math.round(rentalAmount * 0.1);
      setCouponDiscount(discount);
      setCouponMessage("🎉 PRIME10 applied! You saved 10%.");
      return;
    }
    setCouponDiscount(0);
    setCouponMessage("Invalid code. Try 'PRIME10'.");
  };

  const handleConfirmBooking = () => {
    setError("");
    if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
      setError("Please select pickup and return dates and times.");
      return;
    }
    if (rentalDays <= 0) {
      setError("Return date must be after pickup date.");
      return;
    }
    setBookingConfirmed(true);
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Breadcrumb */}
      <div className="mb-6 text-xs text-slate-400 flex items-center gap-2">
        <Link href="/cars" className="hover:text-white transition-colors">
          Cars Fleet
        </Link>
        <span>/</span>
        <span className="text-blue-400 font-medium">Checkout Reservation</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30">
          Step 2 of 2: Reservation & Confirmation
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
          Confirm Your Reservation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete your pickup preferences and guest info to book your {car.name}.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Booking Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {/* Dates & Location Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Pickup & Return Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Delhi">Delhi NCR Hub</option>
                  <option value="Goa">Goa Airport / Beach Hub</option>
                  <option value="Bangalore">Bangalore Tech Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Return Location
                </label>
                <select
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Delhi">Delhi NCR Hub</option>
                  <option value="Goa">Goa Airport / Beach Hub</option>
                  <option value="Bangalore">Bangalore Tech Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pickup Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pickup Time
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Return Date
                </label>
                <input
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Return Time
                </label>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Pickup Method */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Pickup Option
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label
                onClick={() => setPickupMethod("office")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  pickupMethod === "office"
                    ? "border-blue-500 bg-blue-600/10 text-white"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input type="radio" name="pickupMethod" value="office" checked={pickupMethod === "office"} onChange={() => {}} className="sr-only" />
                <div className="font-bold text-sm text-white">📍 Self Hub Pickup</div>
                <p className="text-xs text-slate-400 mt-1">Collect from Prime Rides hub in {pickupLocation}.</p>
                <span className="inline-block mt-3 text-xs font-semibold text-emerald-400">FREE</span>
              </label>

              <label
                onClick={() => setPickupMethod("delivery")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  pickupMethod === "delivery"
                    ? "border-blue-500 bg-blue-600/10 text-white"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input type="radio" name="pickupMethod" value="delivery" checked={pickupMethod === "delivery"} onChange={() => {}} className="sr-only" />
                <div className="font-bold text-sm text-white">🚚 Doorstep Delivery</div>
                <p className="text-xs text-slate-400 mt-1">Vehicle delivered directly to your doorstep/hotel.</p>
                <span className="inline-block mt-3 text-xs font-semibold text-blue-400">+₹{deliveryCharges[pickupLocation] || 500}</span>
              </label>
            </div>

            {pickupMethod === "delivery" && (
              <div className="mt-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Delivery Address Details
                </label>
                <input
                  type="text"
                  placeholder="Enter your hotel or house address for car dropoff..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Guest Info Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Customer Contact Info
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Price Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Car Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="relative h-44 w-full bg-slate-950 border-b border-slate-800">
              <Image src={car.image} alt={car.name} fill sizes="(max-width: 1024px) 100vw, 450px" className="object-cover" />
            </div>

            <div className="p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Selected Vehicle</span>
                <h3 className="text-2xl font-black text-white">{car.name}</h3>
                <p className="text-xs text-slate-400">{car.variant} • {car.fuel} • {car.transmission}</p>
              </div>

              {/* Promo Code Input */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Have a Promo Code?</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PRIME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs ${couponDiscount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown Matrix */}
              <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between text-slate-300">
                  <span>Base Rental ({rentalDays || 1} day{rentalDays > 1 ? "s" : ""})</span>
                  <span>₹{rentalAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Estimated Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>

                {pickupMethod === "delivery" && (
                  <div className="flex justify-between text-slate-300">
                    <span>Doorstep Delivery Charge</span>
                    <span>₹{deliveryCharge.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Promo Discount (PRIME10)</span>
                    <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-2">
                  <span>Refundable Deposit</span>
                  <span>₹{car.deposit.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-800 pt-3">
                  <span>Total Payable</span>
                  <span className="text-2xl text-blue-400">₹{finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all text-center"
              >
                Confirm & Reserve Vehicle
              </button>

              {bookingConfirmed && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-1">
                  <span className="text-emerald-400 font-extrabold text-sm block">🎉 Reservation Successful!</span>
                  <p className="text-xs text-slate-300">Your booking ID is <strong className="font-mono text-white">PR-{Date.now().toString().slice(-6)}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading reservation page...</div>}>
        <BookingContent />
      </Suspense>
      <Footer />
    </div>
  );
}
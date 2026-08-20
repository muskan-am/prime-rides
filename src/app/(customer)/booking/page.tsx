"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
    variant: "SX",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    location: "Delhi",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
  {
    id: "kia-seltos",
    name: "Kia Seltos",
    variant: "HTX",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    location: "Goa",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
  {
    id: "mahindra-thar",
    name: "Mahindra Thar",
    variant: "LX",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    location: "Bangalore",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    deposit: 5000,
  },
];

export default function BookingPage() {
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const searchParams = useSearchParams();

  const carId = searchParams.get("car") || "hyundai-creta";

  const car = cars.find((item) => item.id === carId);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  const [pickupLocation, setPickupLocation] = useState(
    car?.location || "Delhi"
  );

  const [returnLocation, setReturnLocation] = useState(
    car?.location || "Delhi"
  );

  const [error, setError] = useState("");

  const [pickupMethod, setPickupMethod] = useState("office");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) {
      return 0;
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    const difference = end.getTime() - start.getTime();

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }, [pickupDate, returnDate]);

  const rentalAmount = rentalDays * (car?.price || 0);

const tax = Math.round(rentalAmount * 0.18);

// Delivery charges — temporary demo values
const deliveryCharges: Record<string, number> = {
  Delhi: 500,
  Goa: 700,
  Bangalore: 600,
};

const deliveryCharge =
  pickupMethod === "delivery"
    ? deliveryCharges[pickupLocation] || 0
    : 0;

    const totalBeforeDiscount = rentalAmount + tax + deliveryCharge;

    const totalAfterDiscount = totalBeforeDiscount - couponDiscount;

    const finalAmount = totalAfterDiscount + (car?.deposit || 0);

  
  if (!car) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Car Not Found</h1>

          <p className="mt-3 text-muted-foreground">
            Please select a valid car before booking.
          </p>

          <Link
            href="/cars"
            className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Browse Cars
          </Link>
        </div>
      </main>
    );
  }

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if(!code) {
      setCouponMessage("Please enter a coupon code.");
      setCouponDiscount(0);
      return;
    }
    if(code === "PRIME10"){
      const discount = Math.round(rentalAmount * 0.10);

      setCouponDiscount(discount);
      setCouponMessage("Coupon applied successfully.");
      return;
    }

    setCouponDiscount(0);
    setCouponMessage("Invalid coupon code.");
  };

  const handleContinue = () => {
    setError("");

    if (
      !pickupDate ||
      !pickupTime ||
      !returnDate ||
      !returnTime
    ) {
      setError("Please select pickup and return date and time.");
      return;
    }

    if (rentalDays <= 0) {
      setError("Return date must be after pickup date.");
      return;
    }

    alert("Booking details are valid. Payment will be added later.");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-muted-foreground">
          <Link href="/cars" className="hover:text-foreground">
            Cars
          </Link>

          <span className="mx-2">/</span>

          <span>Booking</span>
        </div>

        {/* Header */}
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Reserve Your Ride
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Book Your Car
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Select your rental dates and locations to continue with your
            booking.
          </p>
        </section>

        {/* Main Grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Booking Form */}
          <section className="rounded-2xl border p-6 sm:p-8">

            <h2 className="text-2xl font-bold">
              Rental Details
            </h2>

            {/* Pickup */}
            <div className="mt-8">

              <h3 className="text-lg font-semibold">
                Pickup Details
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div>
                  <label className="text-sm font-medium">
                    Pickup Location
                  </label>

                  <select
                    value={pickupLocation}
                    onChange={(e) =>
                      setPickupLocation(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option>Delhi</option>
                    <option>Goa</option>
                    <option>Bangalore</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Pickup Date
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={pickupDate}
                    onChange={(e) =>
                      setPickupDate(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Pickup Time
                  </label>

                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) =>
                      setPickupTime(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  />
                </div>

              </div>
            </div>

            {/* Return */}
            <div className="mt-10">

              <h3 className="text-lg font-semibold">
                Return Details
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div>
                  <label className="text-sm font-medium">
                    Return Location
                  </label>

                  <select
                    value={returnLocation}
                    onChange={(e) =>
                      setReturnLocation(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option>Delhi</option>
                    <option>Goa</option>
                    <option>Bangalore</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Return Date
                  </label>

                  <input
                    type="date"
                    min={pickupDate || today}
                    value={returnDate}
                    onChange={(e) =>
                      setReturnDate(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Return Time
                  </label>

                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) =>
                      setReturnTime(e.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  />
                </div>

              </div>
            </div>

            {/* Rental Duration */}
            <div className="mt-10 rounded-xl bg-muted p-5">

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Rental Duration
                </span>

                <span className="font-semibold">
                  {rentalDays > 0
                    ? `${rentalDays} ${
                        rentalDays === 1 ? "Day" : "Days"
                      }`
                    : "Select dates"}
                </span>
              </div>

            </div>

            {/* Customer Details */}
<section className="mt-10">
  <h3 className="text-lg font-semibold">
    Customer Details
  </h3>

  <p className="mt-2 text-sm text-muted-foreground">
    Enter your details to continue with the booking.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2">

    {/* Full Name */}
    <div>
      <label className="text-sm font-medium">
        Full Name
      </label>

      <input
        type="text"
        placeholder="Enter your full name"
        className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    {/* Mobile */}
    <div>
      <label className="text-sm font-medium">
        Mobile Number
      </label>

      <input
        type="tel"
        placeholder="Enter your mobile number"
        maxLength={10}
        className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    {/* Email */}
    <div className="md:col-span-2">
      <label className="text-sm font-medium">
        Email Address
      </label>

      <input
        type="email"
        placeholder="Enter your email address"
        className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

  </div>
</section>

            {/* Pickup Options */}
<section className="mt-10">
  <h3 className="text-lg font-semibold">
    Pickup Method
  </h3>

  <p className="mt-2 text-sm text-muted-foreground">
    Choose how you would like to receive your vehicle.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2">

    {/* Office Pickup */}
    <label className="cursor-pointer">
      <input
        type="radio"
        name="pickupMethod"
        value="office"
        checked={pickupMethod === "office"}
        onChange={() => setPickupMethod("office")}
        className="peer sr-only"
      />

      <div className="rounded-xl border p-5 transition peer-checked:border-black peer-checked:bg-muted">
        <h4 className="font-semibold">
          Office Pickup
        </h4>

        <p className="mt-2 text-sm text-muted-foreground">
          Collect the vehicle from the selected Prime Rides office.
        </p>

        <p className="mt-4 text-sm font-medium">
          No delivery charge
        </p>
      </div>
    </label>

    {/* Doorstep Delivery */}
    <label className="cursor-pointer">
      <input
        type="radio"
        name="pickupMethod"
        value="delivery"
        checked={pickupMethod === "delivery"}
        onChange={() => setPickupMethod("delivery")}
        className="peer sr-only"
      />

      <div className="rounded-xl border p-5 transition peer-checked:border-black peer-checked:bg-muted">
        <h4 className="font-semibold">
          Doorstep Delivery
        </h4>

        <p className="mt-2 text-sm text-muted-foreground">
          Get the vehicle delivered to your selected location.
        </p>

        <p className="mt-4 text-sm font-medium">
          Delivery charges applicable
        </p>
      </div>


    </label>
  </div>

  {/* {Delivery Address} */}
     {pickupMethod === "delivery" && (
  <div className="mt-5 rounded-xl border p-5">
    <label className="text-sm font-medium">
      Delivery Address
    </label>

    <textarea
      value={deliveryAddress}
      onChange={(e) => setDeliveryAddress(e.target.value)}
      placeholder="Enter your complete delivery address"
      rows={4}
      className="mt-2 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    />

    <p className="mt-2 text-xs text-muted-foreground">
      Delivery charges may vary depending on location.
    </p>
  </div>
)}
</section>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Continue */}
            <button
              type="button"
              onClick={handleContinue}
              className="mt-8 h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Continue to Booking
            </button>

          </section>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border p-6">

            <h2 className="text-xl font-bold">
              Booking Summary
            </h2>

            {/* Car */}
            <div className="mt-6 overflow-hidden rounded-xl border">

              <img
                src={car.image}
                alt={car.name}
                className="h-48 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="text-lg font-semibold">
                  {car.name}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {car.variant} · {car.transmission} ·{" "}
                  {car.seats} Seats
                </p>

              </div>
            </div>

            {/* Price */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Rate</span>
                <span>₹{car.price.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Days</span>
                <span>{rentalDays || 0}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Amount</span>
                <span>₹{rentalAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span>₹{deliveryCharge.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coupon Discount</span>
                <span className="text-green-600">
                  - ₹{couponDiscount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Before Discount</span>
                <span className="font-medium">
                  ₹{totalBeforeDiscount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Total After Discount</span>
                <span className="font-semibold text-green-600">
                  ₹{totalAfterDiscount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6">
              <label className="text-sm font-medium">Coupon Code</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon"
                  className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="h-11 rounded-lg bg-black px-4 text-sm font-medium text-white"
                >
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`mt-2 text-xs ${
                    couponDiscount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Security Deposit</span>
              <span>₹{car.deposit.toLocaleString("en-IN")}</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Final Amount</span>
                <span className="text-2xl font-bold">
                  ₹{finalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 rounded-lg bg-muted p-4 text-xs leading-5 text-muted-foreground">
              Security deposit is refundable after the vehicle is returned and inspected according to the rental policy.
            </div>
          </aside>
        </div>

        <button 
          type="button"
          onClick={() => setBookingConfirmed(true)}
          className="mt-6 h-12 w-full rounded-lg bg-black text-white font-medium hover:bg-zinc-800"
        >
          Confirm Booking
        </button>

        {bookingConfirmed && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-700">
              Booking Confirmed!
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Your car booking has been successfully confirmed.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Booking ID: PR-{Date.now()}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
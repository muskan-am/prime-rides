import Link from "next/link";

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
    variant: "SX",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    location: "Delhi",
    rating: 4.8,
    reviews: 124,
    luggage: "2 Bags",
    ac: true,

    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",

    features: [
      "Automatic Transmission",
      "Air Conditioning",
      "Bluetooth Connectivity",
      "Android Auto",
      "Apple CarPlay",
      "GPS Navigation",
      "Rear Parking Camera",
      "USB Charging",
    ],

    rentalRules: [
      "Valid driving license is required.",
      "Minimum rental age is 21 years.",
      "Fuel charges are not included.",
      "Vehicle must be returned on time.",
      "Late return charges may apply.",
    ],

    documents: [
      "Valid Driving License",
      "Government ID Proof",
      "Address Proof",
    ],

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
    rating: 4.7,
    reviews: 98,
    luggage: "2 Bags",
    ac: true,

    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",

    features: [
      "Automatic Transmission",
      "Air Conditioning",
      "Bluetooth Connectivity",
      "Android Auto",
      "Apple CarPlay",
      "GPS Navigation",
      "Rear Parking Camera",
      "USB Charging",
    ],

    rentalRules: [
      "Valid driving license is required.",
      "Minimum rental age is 21 years.",
      "Fuel charges are not included.",
      "Vehicle must be returned on time.",
      "Late return charges may apply.",
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
    name: "Mahindra Thar",
    variant: "LX",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    location: "Bangalore",
    rating: 4.9,
    reviews: 156,
    luggage: "2 Bags",
    ac: true,

    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",

    features: [
      "Manual Transmission",
      "Air Conditioning",
      "Bluetooth Connectivity",
      "Android Auto",
      "Apple CarPlay",
      "GPS Navigation",
      "Rear Parking Camera",
      "USB Charging",
    ],

    rentalRules: [
      "Valid driving license is required.",
      "Minimum rental age is 21 years.",
      "Fuel charges are not included.",
      "Vehicle must be returned on time.",
      "Late return charges may apply.",
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

  const car = cars.find((item) => item.id === id);

  if (!car) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Car Not Found</h1>

          <p className="mt-3 text-muted-foreground">
            The car you are looking for does not exist.
          </p>

          <Link
            href="/cars"
            className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to Cars
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-muted-foreground">
          <Link href="/cars" className="hover:text-foreground">
            Cars
          </Link>

          <span className="mx-2">/</span>

          <span>{car.name}</span>
        </div>

        {/* Header */}
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Vehicle Details
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {car.name}
              </h1>

              <p className="mt-3 text-muted-foreground">
                {car.variant} · {car.fuel} · {car.transmission} ·{" "}
                {car.seats} Seats
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">
                ★ {car.rating}
              </span>

              <span className="text-sm text-muted-foreground">
                {car.reviews} reviews
              </span>
            </div>
          </div>
        </section>

        {/* Main Car Section */}
        <section className="mt-10 grid gap-10 lg:grid-cols-2">

          {/* Car Image */}
          <div className="overflow-hidden rounded-2xl border bg-muted">
            <img
              src={car.image}
              alt={car.name}
              className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Booking Card */}
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                ₹{car.price.toLocaleString("en-IN")}
              </span>

              <span className="mb-1 text-muted-foreground">
                / day
              </span>
            </div>

            {/* Availability */}
            <div className="mt-8 rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Availability
                </h2>

                <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Available
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                This vehicle is currently available in {car.location}.
              </p>
            </div>

            {/* Quick Specs */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">
                  Fuel
                </p>

                <p className="mt-2 font-semibold">
                  {car.fuel}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">
                  Transmission
                </p>

                <p className="mt-2 font-semibold">
                  {car.transmission}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">
                  Seats
                </p>

                <p className="mt-2 font-semibold">
                  {car.seats}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">
                  Luggage
                </p>

                <p className="mt-2 font-semibold">
                  {car.luggage}
                </p>
              </div>

            </div>

            {/* Book Button */}
            <Link
              href={`/booking?car=${car.id}`}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Book This Car
            </Link>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free cancellation may be available depending on the rental
              policy.
            </p>
          </div>
        </section>

        {/* Vehicle Specifications */}
        <section className="mt-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Specifications
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Vehicle Specifications
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Fuel Type
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.fuel}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Transmission
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.transmission}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Seating Capacity
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.seats} Seats
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Air Conditioning
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.ac ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Luggage
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.luggage}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Location
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.location}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Variant
              </p>

              <p className="mt-2 text-lg font-semibold">
                {car.variant}
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                Rating
              </p>

              <p className="mt-2 text-lg font-semibold">
                ★ {car.rating} / 5
              </p>
            </div>

          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Features
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            What&apos;s Included
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {car.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl border p-5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm text-white">
                  ✓
                </span>

                <span className="text-sm font-medium">
                  {feature}
                </span>
              </div>
            ))}

          </div>
        </section>

        {/* Rental Rules + Documents */}
        <section className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* Rental Rules */}
          <div className="rounded-2xl border p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Important
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Rental Rules
            </h2>

            <div className="mt-6 space-y-4">

              {car.rentalRules.map((rule) => (
                <div
                  key={rule}
                  className="flex gap-3 text-sm text-muted-foreground"
                >
                  <span className="font-semibold text-foreground">
                    •
                  </span>

                  <span>{rule}</span>
                </div>
              ))}

            </div>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Verification
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Documents Required
            </h2>

            <div className="mt-6 space-y-4">

              {car.documents.map((document) => (
                <div
                  key={document}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm text-white">
                    ✓
                  </span>

                  <span className="text-sm">
                    {document}
                  </span>
                </div>
              ))}

            </div>
          </div>

        </section>

        {/* Pricing */}
        <section className="mt-16 rounded-2xl border p-8">

          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Pricing
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Rental Pricing
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            <div className="rounded-xl bg-muted p-6">
              <p className="text-sm text-muted-foreground">
                Daily Rental
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{car.price.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                per day
              </p>
            </div>

            <div className="rounded-xl bg-muted p-6">
              <p className="text-sm text-muted-foreground">
                Security Deposit
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{car.deposit.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                refundable deposit
              </p>
            </div>

          </div>

          <Link
            href={`/booking?car=${car.id}`}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Continue to Booking
          </Link>

        </section>

        {/* Back */}
        <div className="mt-10">
          <Link
            href="/cars"
            className="text-sm font-medium underline underline-offset-4"
          >
            ← Back to all cars
          </Link>
        </div>

      </div>
    </main>
  );
}
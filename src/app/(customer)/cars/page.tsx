import { Fuel, Gauge, Users } from "lucide-react";
import Link from "next/link";

const cars = [
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
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80",
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
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=80",
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
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function CarsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Our Fleet
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Explore Our Cars
              </h1>

              <p className="mt-4 max-w-2xl text-muted-foreground">
                Choose from our range of well-maintained self-drive cars
                available across Prime Rides locations.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {cars.length} vehicles
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b px-6 py-6">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <select className="h-11 rounded-lg border bg-background px-3 text-sm">
            <option>All Locations</option>
            <option>Delhi</option>
            <option>Goa</option>
            <option>Bangalore</option>
          </select>

          <select className="h-11 rounded-lg border bg-background px-3 text-sm">
            <option>All Fuel Types</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
          </select>

          <select className="h-11 rounded-lg border bg-background px-3 text-sm">
            <option>All Transmissions</option>
            <option>Automatic</option>
            <option>Manual</option>
          </select>

          <select className="h-11 rounded-lg border bg-background px-3 text-sm">
            <option>Sort by Priority</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </section>

      {/* Cars */}
      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <article
              key={car.id}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={car.image}
                  alt={car.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {car.name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {car.variant}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      ₹{car.price.toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      per day
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-4 text-sm text-muted-foreground">
                  📍 {car.location}
                </div>

                {/* Specifications */}
                <div className="mt-5 grid grid-cols-3 border-y py-4">
                  <div className="flex flex-col items-center gap-1">
                    <Fuel className="h-4 w-4" />

                    <span className="text-xs text-muted-foreground">
                      {car.fuel}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Gauge className="h-4 w-4" />

                    <span className="text-xs text-muted-foreground">
                      {car.transmission}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Users className="h-4 w-4" />

                    <span className="text-xs text-muted-foreground">
                      {car.seats} Seats
                    </span>
                  </div>
                </div>

                {/* Availability */}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  <span>Available</span>
                </div>

                {/* View Details */}
                <Link
                  href={`/cars/${car.id}`}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
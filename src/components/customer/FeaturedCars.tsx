import Link from "next/link";
import { Fuel, Gauge, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredCars = [
  {
    id: 1,
    brand: "Hyundai",
    model: "Creta",
    variant: "SX",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    brand: "Kia",
    model: "Seltos",
    variant: "HTX",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price: 2799,
    image:
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    brand: "Mahindra",
    model: "Thar",
    variant: "LX",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
  },
];

export default function FeaturedCars() {
  return (
    <section className="border-t bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Our Fleet
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Cars
            </h2>

            <p className="mt-3 max-w-xl text-muted-foreground">
              Choose from our popular self-drive cars available across
              Prime Rides locations.
            </p>
          </div>

          <Link
            href="/cars"
            className="text-sm font-medium underline underline-offset-4"
          >
            View all cars
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {featuredCars.map((car) => (
            <article
              key={car.id}
              className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {car.brand} {car.model}
                    </h3>

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

                {/* Specifications */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-y py-4 text-center">

                  <div className="flex flex-col items-center gap-1">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {car.fuel}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {car.transmission}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {car.seats} Seats
                    </span>
                  </div>

                </div>

                <Button className="mt-5 w-full" variant="outline">
                  View Details
                </Button>

              </div>
            </article>
          ))}

        </div>
      </div>
    </section>
  );
}
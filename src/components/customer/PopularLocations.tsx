import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const locations = [
  {
    name: "Delhi",
    description: "Explore Delhi and NCR with a self-drive car.",
    cars: "25+ Cars",
  },
  {
    name: "Goa",
    description: "Drive through beaches and scenic roads in Goa.",
    cars: "20+ Cars",
  },
  {
    name: "Bangalore",
    description: "Discover Bangalore and nearby destinations.",
    cars: "30+ Cars",
  },
];

export default function PopularLocations() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Popular Locations
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Choose your city and find the perfect self-drive car for your
            journey.
          </p>
        </div>

        {/* Locations */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.name}
              href={`/locations/${location.name.toLowerCase()}`}
              className="group"
            >
              <div className="h-full rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {location.name}
                    </h3>

                    <span className="text-sm text-muted-foreground">
                      {location.cars}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {location.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                    Explore cars
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
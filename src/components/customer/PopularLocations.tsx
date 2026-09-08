import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

const locations = [
  {
    name: "Delhi NCR",
    description: "Navigate Delhi, Gurgaon, and Noida seamlessly with unlimited kilometer self-drive options.",
    cars: "45+ Vehicles",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    slug: "delhi"
  },
  {
    name: "Goa Coast",
    description: "Cruising coastal roads, beach hubs, and nightlife in stylish open-top or compact SUVs.",
    cars: "35+ Vehicles",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    slug: "goa"
  },
  {
    name: "Bangalore Hub",
    description: "Airport pickups, weekend road trips to Coorg and Ooty, and tech corridor daily rentals.",
    cars: "50+ Vehicles",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    slug: "bangalore"
  },
];

export default function PopularLocations() {
  return (
    <section id="locations" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="text-center">


          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Popular Prime Locations
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Pick up your favorite self-drive ride right at airport terminals or doorstep delivery points across key metros.
          </p>
        </div>

        {/* Locations Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.name}
              href={`/cars?location=${location.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500"
            >
              {/* Image background with gradient overlay */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-90" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <div className="flex items-center justify-end">
                  <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-300 border border-white/10">
                    {location.cars}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{location.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-2">
                    {location.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300">
                    <span>Browse Cars in {location.name}</span>
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
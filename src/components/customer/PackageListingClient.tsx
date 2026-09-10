import Link from "next/link";
import Image from "next/image";
import { Check, Calendar, Car, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export type PublicPackageItem = {
  id: string;
  name: string;
  slug: string;
  type: "WEEKLY" | "MONTHLY" | "YEARLY";
  duration: number;
  price: number;
  shortDescription?: string | null;
  description?: string | null;
  image?: string | null;
  features: string[];
  vehicleCount: number;
};

type PackageListingProps = {
  title: string;
  subtitle: string;
  categoryTag: string;
  packages: PublicPackageItem[];
  currentType: "WEEKLY" | "MONTHLY" | "YEARLY";
};

export default function PackageListingClient({
  title,
  subtitle,
  categoryTag,
  packages,
  currentType,
}: PackageListingProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner Header */}
        <section className="relative overflow-hidden bg-[#0A1128] py-16 sm:py-24 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-black/60 pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md">
              <Tag className="h-3.5 w-3.5 text-blue-400" />
              <span>{categoryTag}</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {subtitle}
            </p>

            {/* Sub-navigation tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <Link
                href="/packages/weekly"
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currentType === "WEEKLY"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Weekly Packages
              </Link>
              <Link
                href="/packages/monthly"
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currentType === "MONTHLY"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Monthly Packages
              </Link>
              <Link
                href="/packages/yearly"
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currentType === "YEARLY"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Yearly Packages
              </Link>
            </div>
          </div>
        </section>

        {/* Packages Grid Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {packages.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No {currentType.toLowerCase()} packages available right now</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Check back soon or explore our other rental options and verified cars.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/cars"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                >
                  <Car className="h-4 w-4" />
                  <span>Explore Cars</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const displayImg =
                  pkg.image ||
                  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80";

                return (
                  <div
                    key={pkg.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                        <Image
                          src={displayImg}
                          alt={pkg.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                            {pkg.type}
                          </span>
                        </div>

                        {/* Duration Pill */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{pkg.duration} Days Plan</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {pkg.name}
                        </h3>

                        {pkg.shortDescription && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {pkg.shortDescription}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-5 flex items-baseline gap-1.5 border-t border-slate-100 pt-4">
                          <span className="text-3xl font-black tracking-tight text-slate-900">
                            ₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            / total for {pkg.duration} days
                          </span>
                        </div>

                        {/* Features List */}
                        {pkg.features.length > 0 && (
                          <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                            {pkg.features.slice(0, 4).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 mt-0.5">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Applicable Vehicles Count */}
                        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Car className="h-4 w-4 text-blue-600" />
                          <span>{pkg.vehicleCount} Eligible Vehicle{pkg.vehicleCount !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-6 pt-0">
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-bold text-white transition-all group-hover:bg-blue-600 shadow-md"
                      >
                        <span>View Details & Vehicles</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Confidence Assurance Banner */}
        <section className="bg-slate-100 py-12 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Prime Rides Package Guarantee</span>
            </div>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              All packages include comprehensive insurance, verified vehicles, zero hidden fees, and 24/7 roadside assistance.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

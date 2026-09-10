import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Calendar, Car, ShieldCheck, FileText, ArrowRight, ChevronRight } from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: {
      vehicles: {
        where: {
          availabilityStatus: "AVAILABLE",
          maintenanceStatus: "GOOD",
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!pkg || !pkg.isActive) {
    notFound();
  }

  const formattedPrice = Number(pkg.price).toLocaleString("en-IN");
  const heroImage =
    pkg.image ||
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Breadcrumb Header */}
        <div className="bg-[#0A1128] text-white pt-8 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/packages/${pkg.type.toLowerCase()}`}
                className="hover:text-white transition-colors"
              >
                {pkg.type.charAt(0) + pkg.type.slice(1).toLowerCase()} Packages
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-blue-400 truncate max-w-[200px]">{pkg.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="inline-block rounded-xl bg-blue-600 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
                  {pkg.type} PACKAGE
                </span>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  {pkg.name}
                </h1>

                {pkg.shortDescription && (
                  <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
                    {pkg.shortDescription}
                  </p>
                )}
              </div>

              {/* Price Callout */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shrink-0 text-left lg:text-right backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Package Price</p>
                <div className="mt-1 flex items-baseline gap-1 lg:justify-end">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹{formattedPrice}</span>
                </div>
                <p className="text-xs font-semibold text-blue-400 mt-1">Includes {pkg.duration} Days Rental</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left 2 Columns: Package Hero Image, Features, Description & Terms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Hero Image */}
              <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-md">
                <Image
                  src={heroImage}
                  alt={pkg.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>

              {/* Package Inclusions & Features */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Package Inclusions & Features</span>
                </h2>

                {pkg.features.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No specific features listed for this package.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white mt-0.5 shadow-sm">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Overview */}
              {pkg.description && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-4">
                    Package Description
                  </h2>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {pkg.description}
                  </p>
                </div>
              )}

              {/* Terms and Conditions */}
              {pkg.terms && (
                <div className="rounded-3xl border border-amber-200/80 bg-amber-50/60 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-700" />
                    <span>Terms & Conditions</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                    {pkg.terms}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Key Details Card */}
            <div className="space-y-6">
              <div className="sticky top-28 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-lg">
                <h3 className="text-lg font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Package Overview
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Category</span>
                    <span className="font-bold text-slate-900">{pkg.type}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-bold text-slate-900">{pkg.duration} Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Package Rate</span>
                    <span className="font-black text-blue-600 text-lg">₹{formattedPrice}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Eligible Vehicles</span>
                    <span className="font-bold text-slate-900">{pkg.vehicles.length} Cars</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Instant Online Booking</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Fixed Package Duration Protection</span>
                  </div>
                </div>

                <a
                  href="#eligible-vehicles"
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                >
                  <span>Select Car & Book Now</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Applicable Vehicles Section */}
          <section id="eligible-vehicles" className="mt-16 pt-8 border-t border-slate-200">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                <Car className="h-3.5 w-3.5" />
                <span>Select Your Vehicle</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Cars Eligible for this Package ({pkg.vehicles.length})
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Choose any of the verified vehicles below to book with the <strong className="text-slate-900">{pkg.name}</strong> package rate.
              </p>
            </div>

            {pkg.vehicles.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-600 text-sm font-semibold">
                  No specific vehicles are currently assigned to this package.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Please check other packages or browse our entire fleet.
                </p>
                <Link
                  href="/cars"
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                >
                  <Car className="h-4 w-4" />
                  <span>Browse All Cars</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pkg.vehicles.map((v) => {
                  const carImage =
                    v.primaryImage ||
                    v.images[0]?.url ||
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80";

                  return (
                    <div
                      key={v.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div>
                        {/* Vehicle Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                          <Image
                            src={carImage}
                            alt={`${v.brand} ${v.model}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                          <div className="absolute bottom-3 left-3">
                            <span className="rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
                              {v.fuelType || "Petrol"} • {v.transmission || "Automatic"}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {v.brand} {v.model}
                          </h3>
                          {v.variant && (
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{v.variant}</p>
                          )}

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600 font-semibold">
                            <span>Daily Base Rate: ₹{Number(v.basePrice).toLocaleString("en-IN")}</span>
                            <span>{v.seatingCapacity || 5} Seats</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="p-6 pt-0">
                        <Link
                          href={`/booking/${v.id}?packageId=${pkg.id}`}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                        >
                          <Car className="h-4 w-4" />
                          <span>Book {v.model} with Package</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
